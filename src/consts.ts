/**
 * Configuração central do site institucional HostLogic.
 *
 * Lista de espera: POST /api/waitlist no Worker (Resend). Outro contato: e-mail/telefone no rodapé.
 */

export const SITE = {
  name: 'HostLogic',
  /** Canonical pendente (apex vs www) — ver runbook. */
  url: 'https://hostlogic.com.br',
  tagline: 'Gestão de propriedades para hospedagem',
  description:
    'HostLogic — reservas, equipe, financeiro, portal do hóspede e Anfitri-IA para anfitriões de temporada.',
} as const;

/** URL do produto (painel/login). App de produção, desacoplado do site. */
export const APP_URL = 'https://app.hostlogic.com.br';

/** Documentos legais canónicos vivem no app. */
export const LEGAL = {
  privacy: `${APP_URL}/privacidade`,
  terms: `${APP_URL}/termos`,
} as const;

/**
 * Contato comercial (rodapé / schema.org). A lista de espera envia para WAITLIST_TO no Worker.
 * TODO: confirmar/preencher o telefone real.
 */
export const CONTACT = {
  email: 'adm@hostlogic.com.br',
  /** Formato E.164 para o link tel:. */
  phoneHref: '+5541995233638',
  /** Texto exibido do telefone. */
  phoneDisplay: '(41) 99523-3638',
  /** Número wa.me, com código do Brasil e sem sinais. */
  whatsappE164: '5541995233638',
  /** Texto ao lado do ícone flutuante. */
  whatsappPrompt: 'Tire suas dúvidas, responderemos o mais breve possível',
  /** Rascunho enviado à HostLogic ao abrir o chat. */
  whatsappPrefill: 'Olá, HostLogic! Gostaria de tirar uma dúvida.',
} as const;

/** Navegação simples (stubs preparados para evolução). */
export const NAV = [
  { label: 'Início', href: '/' },
  { label: 'Planos', href: '/planos' },
  { label: 'Funcionalidades', href: '/funcionalidades' },
  { label: 'Portal do hóspede', href: '/#portal-hospede' },
  { label: 'Anfitri-IA', href: '/#anfitri-ia' },
  { label: 'Financeiro', href: '/#financeiro' },
  { label: 'Lista de espera', href: '/#inscreva-se' },
  { label: 'Demonstração', href: '/demo' },
  { label: 'Blog', href: '/blog' },
] as const;
