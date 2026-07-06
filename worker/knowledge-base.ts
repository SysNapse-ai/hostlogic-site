/**
 * Base de conhecimento pública para a Anfitri-IA (demonstração no site).
 *
 * Monta um texto compacto a partir do catálogo de funcionalidades (features.ts)
 * e de um resumo curado do produto (consts.ts). É o único conteúdo que a IA
 * pode usar para responder — só marketing público, nunca detalhes internos
 * (e-mail coletor, VDS, Skyvern, etc. são segredo industrial e não entram).
 *
 * Mantém a KB pequena (~1-2k tokens) para conter o custo por chamada, já que
 * ela é reenviada a cada request.
 */
import { FEATURE_CATEGORIES } from '../src/data/features';
import { SITE, APP_URL } from '../src/consts';

/** Resumo curado do produto — valor de alto nível, independente do catálogo. */
const PRODUCT_SUMMARY = [
  `HostLogic é um sistema de gestão de propriedades para hospedagem (Airbnb e temporada).`,
  `Público: anfitriões e administradores que não querem administrar temporada em planilha.`,
  `Núcleo: reservas, calendário, equipe, faxinas, portal do hóspede, Anfitri-IA, financeiro e WhatsApp.`,
  `Airbnb integrado agora; Booking.com é roadmap (em breve), não prometer data.`,
  `Acesse o sistema em: ${APP_URL}`,
  `Contato comercial: adm@hostlogic.com.br`,
  `LGPD: multi-tenant com RLS, mascaramento de PII, consentimento e retenção/anonimização de dados de hóspedes.`,
  `Tom comercial: o HostLogic transforma reserva, check-in, faxina, atendimento e repasse numa operação acompanhável.`,
].join('\n');

/** Transforma o catálogo em texto compacto: "Categoria — blurb · itens". */
function catalogToText(): string {
  return FEATURE_CATEGORIES.map((cat) => {
    const items = cat.features
      .map((f) => {
        // Evita "(em breve) (em breve)" quando o título já termina com o sufixo.
        const baseTitle = f.soon
          ? f.title.replace(/\s*\(em breve\)\s*$/i, '')
          : f.title;
        const tag = f.soon ? ' (em breve)' : '';
        return `  - ${baseTitle}${tag}: ${f.desc}`;
      })
      .join('\n');
    return `### ${cat.title}\n${cat.blurb}\n${items}`;
  }).join('\n\n');
}

/** Texto único da base de conhecimento, montado uma vez por cold start. */
export const KNOWLEDGE_BASE = [
  '===== SOBRE O HOSTLOGIC =====',
  PRODUCT_SUMMARY,
  '',
  '===== CATÁLOGO DE FUNCIONALIDADES =====',
  catalogToText(),
  '',
  `Site institucional: ${SITE.url}`,
].join('\n');
