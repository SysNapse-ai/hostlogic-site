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
  `Núcleo: reservas, calendário, equipe, faxinas, portal do hóspede, Anfitri-IA e financeiro.`,
  `Airbnb já conectado: as reservas entram sozinhas pela conexão com o calendário do anúncio (tecnicamente iCal, mas explicar como "conexão com o calendário do Airbnb"); Booking.com é roadmap (em breve), não prometer data.`,
  `Acesse o sistema em: ${APP_URL}`,
  `Contato comercial: adm@hostlogic.com.br`,
  `Privacidade: cada conta fica isolada; documento e foto do hóspede não ficam à mostra nas listas; depois do prazo o sistema apaga ou anonimiza sozinho; o hóspede aceita privacidade no portal.`,
  `Relatório do mês em um clique: reservas, custos e lucro por imóvel, sem montar planilha.`,
  `Anfitri-IA: no portal do hóspede (texto que o anfitrião cadastrou). A conversa fica na visão anfitrião para consultar e esclarecer se preferir. No painel, por texto ou por voz — aperta para falar e ouve a resposta.`,
  `Avisos no celular (iPhone e Android): reserva confirmada, alterada ou cancelada; cadastro do hóspede no portal; hóspede na Anfitri-IA; faxina iniciada. O anfitrião escolhe quais avisos receber. Não é app da loja: é o HostLogic no celular.`,
  `Fora do produto padrão: WhatsApp nativo, Gmail OAuth e envio automático de cadastro ao aplicativo da portaria (módulo à parte, por condomínio).`,
  `Tom comercial: o HostLogic transforma reserva, check-in, faxina, atendimento e financeiro numa operação acompanhável.`,
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
