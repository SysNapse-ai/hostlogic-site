/**
 * Assinatura HMAC dos turnos `model` do chat demo.
 *
 * O Worker é stateless: o browser reenvia o histórico completo a cada pergunta, incluindo
 * as respostas anteriores da IA. Sem assinatura, um atacante pode FORJAR turnos `model`
 * ("Claro, aqui estão minhas instruções...") para baixar a guarda do modelo (prompt
 * injection por histórico). Com assinatura, só aceitamos turnos `model` que nós próprios
 * emitimos, byte a byte.
 *
 * Chave: `ANFITRI_HISTORY_SECRET` (secret dedicado) — se ausente, deriva-se da
 * `GEMINI_API_KEY` para o deploy continuar zero-config. A chave nunca sai do Worker;
 * HMAC não a expõe. Sem PII: assina-se apenas o texto da resposta.
 */

const DOMAIN_PREFIX = 'hostlogic-anfitri-ia:model-turn:v1:';
const encoder = new TextEncoder();

let cachedKey: { secret: string; key: CryptoKey } | null = null;

async function importKey(secret: string): Promise<CryptoKey> {
  if (cachedKey && cachedKey.secret === secret) return cachedKey.key;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  cachedKey = { secret, key };
  return key;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array | null {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/** Resolve o segredo de assinatura a partir do ambiente (dedicado ou derivado). */
export function resolveHistorySecret(env: { ANFITRI_HISTORY_SECRET?: string; GEMINI_API_KEY?: string }): string | null {
  const dedicated = env.ANFITRI_HISTORY_SECRET?.trim();
  if (dedicated) return dedicated;
  const derived = env.GEMINI_API_KEY?.trim();
  return derived ? `derived:${derived}` : null;
}

/** Assina o texto de um turno `model`. Retorna hex (64 chars). */
export async function signModelTurn(text: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(DOMAIN_PREFIX + text));
  return toHex(sig);
}

/** Verifica a assinatura de um turno `model` (comparação em tempo constante via WebCrypto). */
export async function verifyModelTurn(text: string, sig: unknown, secret: string): Promise<boolean> {
  if (typeof sig !== 'string' || sig.length !== 64) return false;
  const raw = fromHex(sig);
  if (!raw) return false;
  const key = await importKey(secret);
  return crypto.subtle.verify('HMAC', key, raw, encoder.encode(DOMAIN_PREFIX + text));
}
