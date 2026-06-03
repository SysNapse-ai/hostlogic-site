/**
 * Configuração central do site institucional HostLogic.
 *
 * Fase inicial: contato SOMENTE por e-mail e telefone (sem formulário/automação).
 * Quando ativar captura de leads (adesivos) e marketing, ver docs/SITE_FUTURE_INTEGRATIONS.md.
 */

export const SITE = {
  name: 'HostLogic',
  /** Canonical pendente (apex vs www) — ver runbook. */
  url: 'https://hostlogic.com.br',
  tagline: 'Gestão de propriedades para hospedagem',
  description:
    'HostLogic — gestão de propriedades, reservas, faxinas, portal do hóspede e operação de hospedagem, com segurança e LGPD.',
} as const;

/** URL do produto (painel/login). App de produção, desacoplado do site. */
export const APP_URL = 'https://app.hostlogic.com.br';

/** Documentos legais canónicos vivem no app. */
export const LEGAL = {
  privacy: `${APP_URL}/privacidade`,
  terms: `${APP_URL}/termos`,
} as const;

/**
 * Contato comercial — fase inicial manual.
 * TODO: confirmar/preencher o telefone real antes do go-live do site.
 */
export const CONTACT = {
  email: 'adm@hostlogic.com.br',
  /** Formato E.164 para o link tel: (ajustar ao número real). */
  phoneHref: '+5500000000000',
  /** Texto exibido do telefone (ajustar ao número real). */
  phoneDisplay: '+55 (00) 00000-0000',
} as const;

/** Navegação simples (stubs preparados para evolução). */
export const NAV = [
  { label: 'Início', href: '/' },
  { label: 'Acesso antecipado', href: '/#inscreva-se' },
  { label: 'Demonstração', href: '/demo' },
  { label: 'Blog', href: '/blog' },
] as const;
