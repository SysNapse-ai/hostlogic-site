/**
 * Lista de espera — POST /api/waitlist
 *
 * O browser envia o cadastro; o Worker chama a API do Resend (chave só no servidor).
 * Não persiste PII (LGPD): o destino é o e-mail da equipe (WAITLIST_TO).
 * Confirmação ao visitante é best-effort (falha não bloqueia o sucesso).
 */
import { CONTACT } from '../src/consts';

export interface WaitlistEnv {
  RESEND_API_KEY?: string;
  WAITLIST_FROM?: string;
  WAITLIST_TO?: string;
  WAITLIST_RL_BURST: { limit(options: { key: string }): Promise<{ success: boolean }> };
  WAITLIST_RL_SUSTAINED: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

const ALLOWED_HOSTS = new Set([
  'hostlogic.com.br',
  'www.hostlogic.com.br',
  'localhost',
  '127.0.0.1',
]);

const PROPERTY_VALUES = new Set(['1', '2-5', '6-10', '11-20', '20+']);
const PROPERTY_LABELS: Record<string, string> = {
  '1': '1 imóvel',
  '2-5': '2 a 5 imóveis',
  '6-10': '6 a 10 imóveis',
  '11-20': '11 a 20 imóveis',
  '20+': 'Mais de 20 imóveis',
};

const MAX_PAYLOAD_BYTES = 4096;
const MAX_NAME = 120;
const MAX_EMAIL = 160;
const MAX_PHONE = 32;
const MAX_LOCATION = 120;
const REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_FROM = 'HostLogic <noreply@hostlogic.com.br>';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_RE = /^[\d\s()+.-]+$/;

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extra,
    },
  });
}

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  try {
    return ALLOWED_HOSTS.has(new URL(origin).hostname);
  } catch {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function waitlistFrom(env: WaitlistEnv): string {
  const raw = env.WAITLIST_FROM?.trim();
  return raw && raw.length > 0 ? raw : DEFAULT_FROM;
}

function waitlistTo(env: WaitlistEnv): string {
  const raw = env.WAITLIST_TO?.trim();
  return raw && raw.length > 0 ? raw : CONTACT.email;
}

export interface WaitlistFields {
  name: string;
  email: string;
  phone: string;
  location: string;
  properties: string;
}

function isValidOptionalPhone(phone: string): boolean {
  if (phone.length === 0) return true;
  if (phone.length > MAX_PHONE || !PHONE_CHARS_RE.test(phone)) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export function parseWaitlistBody(
  raw: unknown,
): { fields: WaitlistFields } | { honeypot: true } | { error: string } {
  if (typeof raw !== 'object' || raw === null) return { error: 'invalid_body' };
  const body = raw as Record<string, unknown>;

  const honeypot = typeof body.website === 'string' ? body.website.trim() : '';
  if (honeypot.length > 0) return { honeypot: true };

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const location = typeof body.location === 'string' ? body.location.trim() : '';
  const properties = typeof body.properties === 'string' ? body.properties.trim() : '';
  const consent = body.consent === true || body.consent === 'true';

  if (!name || !email || !properties) return { error: 'missing_fields' };
  if (!consent) return { error: 'consent_required' };
  if (
    name.length > MAX_NAME ||
    email.length > MAX_EMAIL ||
    phone.length > MAX_PHONE ||
    location.length > MAX_LOCATION
  ) {
    return { error: 'field_too_long' };
  }
  if (!EMAIL_RE.test(email)) return { error: 'invalid_email' };
  if (!isValidOptionalPhone(phone)) return { error: 'invalid_phone' };
  if (!PROPERTY_VALUES.has(properties)) return { error: 'invalid_properties' };

  return { fields: { name, email, phone, location, properties } };
}

function buildTeamText(fields: WaitlistFields, submittedAt: string): string {
  const loc = fields.location || '(não informado)';
  const phone = fields.phone || '(não informado)';
  const portfolio = PROPERTY_LABELS[fields.properties] ?? fields.properties;
  return [
    'Lista de espera — HostLogic',
    '',
    `Nome: ${fields.name}`,
    `E-mail: ${fields.email}`,
    `Telefone: ${phone}`,
    `Localização: ${loc}`,
    `Imóveis geridos: ${portfolio}`,
    '',
    `Enviado em: ${submittedAt}`,
    '',
    'Responda a esta mensagem para falar com o interessado (Reply-To).',
  ].join('\n');
}

function buildTeamHtml(fields: WaitlistFields, submittedAt: string): string {
  const loc = fields.location || '(não informado)';
  const phone = fields.phone || '(não informado)';
  const portfolio = PROPERTY_LABELS[fields.properties] ?? fields.properties;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#1a1d2e;">
  <h1 style="font-size:18px;">Lista de espera — HostLogic</h1>
  <table style="border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Nome</td><td>${escapeHtml(fields.name)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b;">E-mail</td><td>${escapeHtml(fields.email)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Telefone</td><td>${escapeHtml(phone)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Localização</td><td>${escapeHtml(loc)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Imóveis geridos</td><td>${escapeHtml(portfolio)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Enviado em</td><td>${escapeHtml(submittedAt)}</td></tr>
  </table>
  <p style="font-size:13px;color:#64748b;">Responda a esta mensagem para falar com o interessado.</p>
</body>
</html>`;
}

function buildConfirmText(name: string): string {
  return [
    `Olá, ${name}.`,
    '',
    'Recebemos o seu pedido para a lista de espera do HostLogic.',
    'A equipe entra em contato por este e-mail quando houver vaga no acesso antecipado.',
    '',
    'Se não foi você, ignore esta mensagem.',
    '',
    'HostLogic — hostlogic.com.br',
  ].join('\n');
}

function buildConfirmHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#1a1d2e;">
  <p>Olá, ${escapeHtml(name)}.</p>
  <p>Recebemos o seu pedido para a lista de espera do HostLogic. A equipe entra em contato por este e-mail quando houver vaga no acesso antecipado.</p>
  <p style="font-size:13px;color:#64748b;">Se não foi você, ignore esta mensagem.</p>
  <p>HostLogic — <a href="https://hostlogic.com.br">hostlogic.com.br</a></p>
</body>
</html>`;
}

async function sendResendEmail(
  apiKey: string,
  payload: Record<string, unknown>,
): Promise<{ ok: true; id?: string } | { ok: false; status: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const upstream = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!upstream.ok) {
      return { ok: false, status: upstream.status };
    }
    let id: string | undefined;
    try {
      const data = (await upstream.json()) as { id?: unknown };
      if (typeof data.id === 'string') id = data.id;
    } catch {
      /* corpo opcional */
    }
    return { ok: true, id };
  } finally {
    clearTimeout(timeout);
  }
}

const CLIENT_ERROR_MESSAGE: Record<string, string> = {
  missing_fields: 'Preencha nome, e-mail e portfólio de imóveis.',
  consent_required: 'Marque o consentimento para continuar.',
  field_too_long: 'Algum campo ultrapassou o tamanho permitido.',
  invalid_email: 'Informe um e-mail válido.',
  invalid_phone: 'Informe um telefone válido ou deixe em branco.',
  invalid_properties: 'Selecione o portfólio de imóveis.',
  invalid_body: 'Não foi possível ler o formulário. Tente novamente.',
};

export async function handleWaitlist(request: Request, env: WaitlistEnv): Promise<Response> {
  if (!isAllowedOrigin(request)) {
    return json({ error: 'forbidden', message: 'Origem não permitida.' }, 403);
  }
  if (request.method !== 'POST') {
    return json({ error: 'method_not_allowed', message: 'Use POST.' }, 405, { Allow: 'POST' });
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const [burst, sustained] = await Promise.all([
    env.WAITLIST_RL_BURST.limit({ key: ip }),
    env.WAITLIST_RL_SUSTAINED.limit({ key: ip }),
  ]);
  if (!burst.success || !sustained.success) {
    return json(
      {
        error: 'rate_limited',
        message: 'Muitos envios em pouco tempo. Espere um minuto e tente de novo.',
      },
      429,
    );
  }

  const ct = request.headers.get('Content-Type') ?? '';
  if (!ct.toLowerCase().includes('application/json')) {
    return json({ error: 'unsupported_media_type', message: 'Envie JSON.' }, 415);
  }

  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return json({ error: 'invalid_body', message: CLIENT_ERROR_MESSAGE.invalid_body }, 400);
  }
  if (rawText.length > MAX_PAYLOAD_BYTES) {
    return json({ error: 'payload_too_large', message: 'Pedido demasiado grande.' }, 400);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return json({ error: 'invalid_json', message: CLIENT_ERROR_MESSAGE.invalid_body }, 400);
  }

  const result = parseWaitlistBody(parsed);
  if ('honeypot' in result) {
    return json({ ok: true }, 200);
  }
  if ('error' in result) {
    return json({ error: result.error, message: CLIENT_ERROR_MESSAGE[result.error] ?? 'Dados inválidos.' }, 400);
  }

  const apiKey = env.RESEND_API_KEY?.trim() ?? '';
  if (!apiKey) {
    return json(
      {
        error: 'service_unavailable',
        message: 'O envio automático está indisponível no momento. Tente mais tarde.',
      },
      503,
    );
  }

  const fields = result.fields;
  const submittedAt = new Date().toISOString();
  const from = waitlistFrom(env);
  const to = waitlistTo(env);

  try {
    const team = await sendResendEmail(apiKey, {
      from,
      to: [to],
      reply_to: fields.email,
      subject: `Lista de espera — ${fields.name}`,
      text: buildTeamText(fields, submittedAt),
      html: buildTeamHtml(fields, submittedAt),
      tags: [
        { name: 'category', value: 'waitlist' },
        { name: 'audience', value: 'internal' },
      ],
    });

    if (!team.ok) {
      console.warn('waitlist: resend team email failed', team.status);
      return json(
        {
          error: 'upstream_error',
          message: 'Não foi possível enviar agora. Tente novamente em instantes.',
        },
        502,
      );
    }

    const confirm = await sendResendEmail(apiKey, {
      from,
      to: [fields.email],
      reply_to: to,
      subject: 'Recebemos o seu pedido — HostLogic',
      text: buildConfirmText(fields.name),
      html: buildConfirmHtml(fields.name),
      tags: [
        { name: 'category', value: 'waitlist' },
        { name: 'audience', value: 'visitor' },
      ],
    });
    if (!confirm.ok) {
      console.warn('waitlist: resend confirmation failed', confirm.status);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return json(
        { error: 'timeout', message: 'O envio demorou demais. Tente novamente.' },
        504,
      );
    }
    console.warn('waitlist: unexpected error');
    return json(
      { error: 'internal_error', message: 'Algo deu errado. Tente novamente em instantes.' },
      500,
    );
  }
}
