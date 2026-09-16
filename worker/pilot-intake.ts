/**
 * Programa piloto — POST /api/pilot-intake
 *
 * O browser envia o pedido no mesmo origin; o Worker valida, grava no app
 * (header X-HostLogic-Site-Key) e envia aviso interno + confirmação via Resend.
 * Sem persistência de PII no Worker. Sem log de e-mail/nome/WhatsApp/URL.
 */
import { CONTACT } from '../src/consts';

export interface PilotIntakeEnv {
  RESEND_API_KEY?: string;
  WAITLIST_FROM?: string;
  APP_PILOT_INTAKE_URL?: string;
  APP_PILOT_INTAKE_SECRET?: string;
  PILOT_INTAKE_RL_BURST: { limit(options: { key: string }): Promise<{ success: boolean }> };
  PILOT_INTAKE_RL_SUSTAINED: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

const ALLOWED_HOSTS = new Set([
  'hostlogic.com.br',
  'www.hostlogic.com.br',
  'localhost',
  '127.0.0.1',
]);

export const PILOT_SITE_CONSENT_VERSION = 'piloto-site-2026-09';
export const PILOT_REQUEST_SOURCE = 'site-piloto';
export const PILOT_LISTINGS_BANDS = new Set(['6-10', '11-20', '20+']);
export const SITE_PILOT_INTAKE_HEADER = 'X-HostLogic-Site-Key';

const MAX_PAYLOAD_BYTES = 8192;
const MAX_NAME = 120;
const MIN_NAME = 2;
const MAX_EMAIL = 254;
const MAX_WHATSAPP = 40;
const MAX_CITY = 120;
const MAX_FIRST_PROPERTY = 200;
const REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_FROM = 'HostLogic <noreply@hostlogic.com.br>';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_RE = /^[+\d\s()]+$/;

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

function textToHtml(text: string): string {
  const inner = escapeHtml(text).replaceAll('\n', '<br>\n');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#1a1d2e;">
${inner}
</body>
</html>`;
}

function mailFrom(env: PilotIntakeEnv): string {
  const raw = env.WAITLIST_FROM?.trim();
  return raw && raw.length > 0 ? raw : DEFAULT_FROM;
}

export interface PilotIntakeFields {
  name: string;
  email: string;
  whatsapp: string;
  city: string;
  airbnbProfileUrl: string;
  listingsBand: string;
  firstPropertyName: string;
}

export function isAirbnbPublicHost(host: string): boolean {
  const h = host.replace(/\.+$/, '').toLowerCase();
  if (!h) return false;
  return (
    h === 'airbnb.com' ||
    (h.endsWith('.airbnb.com') && h !== '.airbnb.com') ||
    h === 'airbnb.com.br' ||
    (h.endsWith('.airbnb.com.br') && h !== '.airbnb.com.br')
  );
}

export function parseAirbnbProfileHostname(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  const host = url.hostname.replace(/\.+$/, '').toLowerCase();
  if (!isAirbnbPublicHost(host)) return null;
  return host;
}

export function isAirbnbProfileUrl(raw: unknown): boolean {
  return parseAirbnbProfileHostname(raw) !== null;
}

function listingTitleFromAirbnbUrl(raw: string): string {
  try {
    const url = new URL(raw.trim());
    const segments = url.pathname.split('/').filter(Boolean);
    const hAt = segments.findIndex((part) => part.toLowerCase() === 'h');
    if (hAt >= 0 && segments[hAt + 1]) {
      const slug = decodeURIComponent(segments[hAt + 1])
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (slug) return slug.slice(0, MAX_FIRST_PROPERTY);
    }
    const roomsAt = segments.findIndex((part) => part.toLowerCase() === 'rooms');
    if (roomsAt >= 0 && segments[roomsAt + 1]) {
      const id = decodeURIComponent(segments[roomsAt + 1]).split(/[/?#]/)[0] ?? '';
      if (id) return `Anúncio ${id}`.slice(0, MAX_FIRST_PROPERTY);
    }
  } catch {
    /* ignore */
  }
  return 'A definir';
}

function isPilotWhatsapp(value: string): boolean {
  return value.length > 0 && value.length <= MAX_WHATSAPP && WHATSAPP_RE.test(value);
}

function optionalTrim(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim();
}

export function parsePilotIntakeBody(
  raw: unknown,
): { fields: PilotIntakeFields } | { honeypot: true } | { error: string } {
  if (typeof raw !== 'object' || raw === null) return { error: 'invalid_body' };
  const body = raw as Record<string, unknown>;

  const honeypot = typeof body.website === 'string' ? body.website.trim() : '';
  if (honeypot.length > 0) return { honeypot: true };

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const whatsapp = optionalTrim(body.whatsapp);
  const city = optionalTrim(body.city);
  const airbnbProfileUrl = typeof body.airbnbProfileUrl === 'string' ? body.airbnbProfileUrl.trim() : '';
  const listingsBand = typeof body.listingsBand === 'string' ? body.listingsBand.trim() : '';
  const consent = body.consent === true;

  if (!name || !email || !airbnbProfileUrl || !listingsBand) {
    return { error: 'missing_fields' };
  }
  if (!consent) return { error: 'consent_required' };
  if (name.length < MIN_NAME || name.length > MAX_NAME) return { error: 'invalid_name' };
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) return { error: 'invalid_email' };
  if (whatsapp.length > 0 && !isPilotWhatsapp(whatsapp)) return { error: 'invalid_whatsapp' };
  if (city.length > MAX_CITY) return { error: 'field_too_long' };
  if (!PILOT_LISTINGS_BANDS.has(listingsBand)) return { error: 'invalid_listings_band' };
  if (!isAirbnbProfileUrl(airbnbProfileUrl)) return { error: 'invalid_airbnb_url' };

  let firstPropertyName =
    typeof body.firstPropertyName === 'string' ? body.firstPropertyName.trim() : '';
  if (!firstPropertyName) {
    firstPropertyName = listingTitleFromAirbnbUrl(airbnbProfileUrl);
  }
  if (firstPropertyName.length < 1 || firstPropertyName.length > MAX_FIRST_PROPERTY) {
    return { error: 'invalid_first_property' };
  }

  return {
    fields: { name, email, whatsapp, city, airbnbProfileUrl, listingsBand, firstPropertyName },
  };
}

function appIntakeBody(fields: PilotIntakeFields): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: fields.name,
    email: fields.email,
    airbnbProfileUrl: fields.airbnbProfileUrl,
    listingsBand: fields.listingsBand,
    firstPropertyName: fields.firstPropertyName,
    consent: true,
    consentVersion: PILOT_SITE_CONSENT_VERSION,
    source: PILOT_REQUEST_SOURCE,
  };
  if (fields.whatsapp) body.whatsapp = fields.whatsapp;
  if (fields.city) body.city = fields.city;
  return body;
}

function dash(value: string): string {
  return value.trim() === '' ? '—' : value;
}

function buildInternalText(fields: PilotIntakeFields, notSaved: boolean): string {
  const lines = [
    'Novo pedido de piloto (origem site-piloto).',
    '',
    `Nome: ${fields.name}`,
    `E-mail: ${fields.email}`,
    `WhatsApp: ${dash(fields.whatsapp)}`,
    `Cidade: ${dash(fields.city)}`,
    `1.º anúncio (link): ${fields.airbnbProfileUrl}`,
    `Faixa de imóveis: ${fields.listingsBand}`,
    `1.º imóvel (título do anúncio): ${fields.firstPropertyName}`,
    `consentVersion: ${PILOT_SITE_CONSENT_VERSION}`,
    'source: site-piloto',
    '',
    'Abrir o anúncio → anfitrião → confirmar mais de 5 imóveis antes de aprovar.',
  ];
  if (notSaved) {
    lines.push('', 'não gravado: o pedido NÃO foi gravado no app (erro ou timeout). Contactar o visitante à mão.');
  }
  return lines.join('\n');
}

function buildConfirmText(name: string): string {
  return [
    `Olá, ${name}!`,
    '',
    'Recebemos o teu pedido para o programa piloto.',
    '',
    'Vamos analisar o teu anúncio no Airbnb e respondemos por e-mail.',
    '',
    'Enquanto isso, não precisas de fazer mais nada.',
    '',
    'HostLogic',
  ].join('\n');
}

function resolveIntakeUrl(raw: string | undefined): string | null {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase();
  const local = host === 'localhost' || host === '127.0.0.1';
  if (url.protocol === 'http:' && !local) return null;
  return url.toString();
}

async function sendResendEmail(
  apiKey: string,
  payload: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; status: number }> {
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
    return { ok: true };
  } finally {
    clearTimeout(timeout);
  }
}

async function postAppIntake(
  url: string,
  secret: string,
  body: Record<string, unknown>,
): Promise<{ kind: 'accepted' } | { kind: 'http'; status: number } | { kind: 'timeout' } | { kind: 'network' }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [SITE_PILOT_INTAKE_HEADER]: secret,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (upstream.status === 202) return { kind: 'accepted' };
    return { kind: 'http', status: upstream.status };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return { kind: 'timeout' };
    return { kind: 'network' };
  } finally {
    clearTimeout(timeout);
  }
}

const CLIENT_ERROR_MESSAGE: Record<string, string> = {
  missing_fields: 'Preencha nome, e-mail, o link do 1.º anúncio e a faixa de imóveis.',
  consent_required: 'Marque o consentimento para continuar.',
  invalid_name: 'Informe o nome completo (2 a 120 caracteres).',
  field_too_long: 'Algum campo ultrapassou o tamanho permitido.',
  invalid_email: 'Informe um e-mail válido.',
  invalid_whatsapp: 'Informe um WhatsApp válido (só números, espaços, + e parênteses) ou deixe em branco.',
  invalid_listings_band: 'Selecione a faixa de imóveis (mais de 5).',
  invalid_airbnb_url: 'Informe a URL https do 1.º anúncio no Airbnb (não é o iCal).',
  invalid_first_property: 'Informe o título exacto do 1.º anúncio (até 200 caracteres).',
  invalid_body: 'Não foi possível ler o formulário. Tente novamente.',
};

const GENERIC_UPSTREAM_MESSAGE = 'Não foi possível enviar agora. Tente novamente em instantes.';

async function sendInternalNotice(
  env: PilotIntakeEnv,
  fields: PilotIntakeFields,
  notSaved: boolean,
): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY?.trim() ?? '';
  if (!apiKey) {
    console.warn('pilot-intake: resend_unconfigured');
    return false;
  }
  const to = CONTACT.email;
  const subject = notSaved
    ? `Pedido de piloto (site) — ${fields.name} — não gravado`
    : `Pedido de piloto (site) — ${fields.name}`;
  const text = buildInternalText(fields, notSaved);
  try {
    const result = await sendResendEmail(apiKey, {
      from: mailFrom(env),
      to: [to],
      reply_to: fields.email,
      subject,
      text,
      html: textToHtml(text),
      tags: [
        { name: 'category', value: 'pilot-intake' },
        { name: 'audience', value: 'internal' },
      ],
    });
    if (!result.ok) {
      console.warn('pilot-intake: resend_internal_failed', result.status);
      return false;
    }
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.warn('pilot-intake: resend_internal_timeout');
    } else {
      console.warn('pilot-intake: resend_internal_error');
    }
    return false;
  }
}

async function sendVisitorConfirmation(env: PilotIntakeEnv, fields: PilotIntakeFields): Promise<void> {
  const apiKey = env.RESEND_API_KEY?.trim() ?? '';
  if (!apiKey) return;
  const text = buildConfirmText(fields.name);
  try {
    const result = await sendResendEmail(apiKey, {
      from: mailFrom(env),
      to: [fields.email],
      reply_to: CONTACT.email,
      subject: 'Recebemos o teu pedido de piloto HostLogic',
      text,
      html: textToHtml(text),
      tags: [
        { name: 'category', value: 'pilot-intake' },
        { name: 'audience', value: 'visitor' },
      ],
    });
    if (!result.ok) {
      console.warn('pilot-intake: resend_confirm_failed', result.status);
    }
  } catch {
    console.warn('pilot-intake: resend_confirm_error');
  }
}

export async function handlePilotIntake(request: Request, env: PilotIntakeEnv): Promise<Response> {
  if (!isAllowedOrigin(request)) {
    return json({ error: 'forbidden', message: 'Origem não permitida.' }, 403);
  }
  if (request.method !== 'POST') {
    return json({ error: 'method_not_allowed', message: 'Use POST.' }, 405, { Allow: 'POST' });
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const [burst, sustained] = await Promise.all([
    env.PILOT_INTAKE_RL_BURST.limit({ key: ip }),
    env.PILOT_INTAKE_RL_SUSTAINED.limit({ key: ip }),
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

  const result = parsePilotIntakeBody(parsed);
  if ('honeypot' in result) {
    return json({ ok: true }, 200);
  }
  if ('error' in result) {
    return json(
      { error: result.error, message: CLIENT_ERROR_MESSAGE[result.error] ?? 'Dados inválidos.' },
      400,
    );
  }

  const secret = env.APP_PILOT_INTAKE_SECRET?.trim() ?? '';
  const intakeUrl = resolveIntakeUrl(env.APP_PILOT_INTAKE_URL);
  if (!secret || !intakeUrl) {
    console.warn('pilot-intake: fail-closed');
    return json(
      {
        error: 'service_unavailable',
        message: 'O envio automático está indisponível no momento. Tente mais tarde.',
      },
      503,
    );
  }

  const fields = result.fields;
  const appResult = await postAppIntake(intakeUrl, secret, appIntakeBody(fields));

  if (appResult.kind === 'accepted') {
    await sendInternalNotice(env, fields, false);
    await sendVisitorConfirmation(env, fields);
    return json({ ok: true }, 202);
  }

  if (appResult.kind === 'http') {
    console.warn('pilot-intake: app_http', appResult.status);
  } else if (appResult.kind === 'timeout') {
    console.warn('pilot-intake: app_timeout');
  } else {
    console.warn('pilot-intake: app_network');
  }

  await sendInternalNotice(env, fields, true);

  if (appResult.kind === 'timeout') {
    return json({ error: 'timeout', message: GENERIC_UPSTREAM_MESSAGE }, 504);
  }
  return json({ error: 'upstream_error', message: GENERIC_UPSTREAM_MESSAGE }, 502);
}
