/**
 * Cloudflare Worker — HostLogic site.
 *
 * Roteamento (Workers Static Assets, asset-first por defeito):
 *  - POST /api/anfitri-ia  -> chat demo (chama gemini-2.5-flash)
 *  - qualquer outra rota   -> delega a env.ASSETS (site estático)
 *
 * A chave GEMINI_API_KEY vem de wrangler secret (prod) ou .dev.vars (local),
 * nunca do browser. Não há persistência de conversa (stateless, sem log de
 * conteúdo/PII — LGPD).
 *
 * @see https://developers.cloudflare.com/workers/static-assets/
 */
import { KNOWLEDGE_BASE } from './knowledge-base';
import { SYSTEM_PROMPT, APP_URL_PLACEHOLDER } from './system-prompt';
import { APP_URL } from '../src/consts';

export interface Env {
  GEMINI_API_KEY: string;
  ASSETS: Fetcher;
  // Bindings de rate limit (wrangler.toml [[ratelimits]]). Tipo estrutural para não
  // depender da export `RateLimit` dos workers-types em versões mais antigas.
  ANFITRI_RL_BURST: { limit(options: { key: string }): Promise<{ success: boolean }> };
  ANFITRI_RL_SUSTAINED: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

// ---- Configuração de limite (higiene; o teto de custo real é Rate Limit + maxOutputTokens) ----
const MAX_USER_TURNS = 6;
const MAX_USER_MESSAGE_CHARS = 500;   // entrada do visitante (maxlength do input = 500)
const MAX_MODEL_MESSAGE_CHARS = 2000; // eco do servidor (até ~400 tokens ≈ 1500 chars); truncar, não rejeitar
const MAX_PAYLOAD_BYTES = 32768;      // comporta 6 turnos com respostas do modelo
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_OUTPUT_TOKENS = 400;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Origens permitidas (same-origin). Em dev, o wrangler serve em localhost.
const ALLOWED_HOSTS = new Set([
  'hostlogic.com.br',
  'www.hostlogic.com.br',
  'localhost',
  '127.0.0.1',
]);

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequestBody {
  messages?: unknown;
}

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return true; // mesmo domínio, sem CORS preflight; liberamos (a rota é same-origin)
  try {
    const url = new URL(origin);
    return ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/** Valida e normaliza o payload. Retorna turnos ou um erro HTTP. */
function validatePayload(raw: unknown): { turns: ChatTurn[] } | { error: Response } {
  if (typeof raw !== 'object' || raw === null) {
    return { error: json({ error: 'invalid_body' }, 400) };
  }
  const messages = (raw as ChatRequestBody).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: json({ error: 'invalid_messages' }, 400) };
  }
  if (messages.length > MAX_USER_TURNS * 2 + 1) {
    return { error: json({ error: 'too_many_turns' }, 400) };
  }
  const turns: ChatTurn[] = [];
  let userTurns = 0;
  for (const m of messages) {
    if (typeof m !== 'object' || m === null) {
      return { error: json({ error: 'invalid_message' }, 400) };
    }
    const role = (m as { role?: unknown }).role;
    const text = (m as { text?: unknown }).text;
    if (role !== 'user' && role !== 'model') {
      return { error: json({ error: 'invalid_role' }, 400) };
    }
    if (typeof text !== 'string' || text.trim().length === 0) {
      return { error: json({ error: 'invalid_text' }, 400) };
    }
    if (role === 'user') userTurns++;
    if (userTurns > MAX_USER_TURNS) {
      return { error: json({ error: 'too_many_questions' }, 400) };
    }
    if (role === 'user') {
      // Entrada do visitante: limitada e rejeitada se exceder (espelha o maxlength do frontend).
      if (text.length > MAX_USER_MESSAGE_CHARS) {
        return { error: json({ error: 'message_too_long' }, 400) };
      }
      turns.push({ role, text });
    } else {
      // Resposta anterior do modelo (eco do servidor): truncar para nunca quebrar a conversa.
      turns.push({ role, text: text.slice(0, MAX_MODEL_MESSAGE_CHARS) });
    }
  }
  return { turns };
}

/** Monta o body para generateContent (v1beta). */
function buildGeminiBody(turns: ChatTurn[]): unknown {
  const contents = turns.map((t) => ({
    role: t.role === 'user' ? 'user' : 'model',
    parts: [{ text: t.text }],
  }));
  const systemInstruction = {
    parts: [
      {
        text: SYSTEM_PROMPT.replaceAll(APP_URL_PLACEHOLDER, APP_URL)
          + '\n\n===== BASE DE CONHECIMENTO =====\n'
          + KNOWLEDGE_BASE,
      },
    ],
  };
  return {
    contents,
    systemInstruction,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      topP: 0.95,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };
}

/** Extrai o texto da resposta do Gemini com guardas (não lança). */
function extractGeminiText(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null;
  const candidates = (data as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const first = candidates[0];
  if (typeof first !== 'object' || first === null) return null;
  const content = (first as { content?: unknown }).content;
  if (typeof content !== 'object' || content === null) return null;
  const parts = (content as { parts?: unknown }).parts;
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const text = (parts[0] as { text?: unknown }).text;
  return typeof text === 'string' && text.trim().length > 0 ? text.trim() : null;
}

function isBlocked(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false;
  const fb = (data as { promptFeedback?: { blockReason?: unknown } }).promptFeedback;
  if (fb && typeof fb.blockReason === 'string' && fb.blockReason.length > 0) return true;
  const candidates = (data as { candidates?: Array<{ finishReason?: unknown }> }).candidates;
  if (Array.isArray(candidates) && candidates.length > 0) {
    const fr = candidates[0]?.finishReason;
    if (fr === 'SAFETY' || fr === 'RECITATION') return true;
  }
  return false;
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  if (!isAllowedOrigin(request)) {
    return json({ error: 'forbidden' }, 403);
  }
  if (request.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405, { Allow: 'POST' });
  }

  // Rate limit por IP no edge (bindings da Cloudflare): bloqueia rapid-fire e
  // loop de refresh ANTES de gastar Gemini. Cf-Connecting-IP é sempre definido
  // em produção; em dev local cai para 'local' (compartilhado, só para não quebrar).
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const [burst, sustained] = await Promise.all([
    env.ANFITRI_RL_BURST.limit({ key: ip }),
    env.ANFITRI_RL_SUSTAINED.limit({ key: ip }),
  ]);
  if (!burst.success || !sustained.success) {
    return json(
      {
        error: 'rate_limited',
        reply:
          'Você fez muitas perguntas em pouco tempo nesta demonstração. Espere cerca de um minuto e tente de novo.',
      },
      429,
    );
  }

  const ct = request.headers.get('Content-Type') ?? '';
  if (!ct.toLowerCase().includes('application/json')) {
    return json({ error: 'unsupported_media_type' }, 415);
  }

  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }
  if (rawText.length > MAX_PAYLOAD_BYTES) {
    return json({ error: 'payload_too_large' }, 400);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const result = validatePayload(parsed);
  if ('error' in result) return result.error;
  const turns = result.turns;

  // Só checamos a chave após validar o payload: erros de cliente (4xx) sempre
  // têm prioridade sobre a indisponibilidade do serviço (503).
  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim().length === 0) {
    return json({ error: 'service_unavailable', reply: 'Demonstração indisponível no momento.' }, 503);
  }

  const geminiBody = buildGeminiBody(turns);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${GEMINI_ENDPOINT}?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      // Não vazar corpo/body da API nem a chave; resposta genérica.
      return json({ error: 'upstream_error', reply: 'Tive um problema ao responder agora. Tente novamente.' }, 502);
    }
    const data: unknown = await upstream.json();
    if (isBlocked(data)) {
      return json(
        {
          reply: 'Não posso responder a isso nesta demonstração. Posso te ajudar com o HostLogic: reservas, portal do hóspede, faxinas, financeiro e mais.',
          notInKb: false,
        },
        200,
      );
    }
    const text = extractGeminiText(data);
    if (!text) {
      return json({ error: 'empty_response', reply: 'Não consegui formar uma resposta agora. Tente reformular a pergunta.' }, 502);
    }
    // notInKb é heurístico: se a resposta começa com o aviso combinado no prompt.
    const notInKb = /^isso eu não encontrei na base/i.test(text);
    return json({ reply: text, notInKb }, 200);
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') {
      return json({ error: 'timeout', reply: 'Demorei demais para responder. Tente novamente.' }, 504);
    }
    return json({ error: 'internal_error', reply: 'Algo deu errado. Tente novamente em instantes.' }, 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    // Canonical = apex (hostlogic.com.br). www redireciona 301 para o apex (SEO).
    if (url.hostname === 'www.hostlogic.com.br') {
      const apex = new URL(url.pathname + url.search, 'https://hostlogic.com.br');
      return Response.redirect(apex.toString(), 301);
    }
    if (url.pathname === '/api/anfitri-ia') {
      return handleChat(request, env);
    }
    // Qualquer outra rota: delega aos assets estáticos (preserva o site).
    return env.ASSETS.fetch(request);
  },
};
