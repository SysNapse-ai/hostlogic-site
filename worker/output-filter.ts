/**
 * Filtro de saída do chat demo — última linha de defesa contra fuga do system prompt.
 *
 * O modelo pode ser convencido a "repetir o texto acima"; independentemente do que o
 * Gemini fizer, se a resposta contiver marcadores das instruções internas ela é
 * substituída por uma recusa curta. Determinístico, sem custo, sem PII.
 */

/** Frases que só existem no system prompt / cabeçalhos da base de conhecimento. */
const PROMPT_LEAK_MARKERS: RegExp[] = [
  /modo\s+demonstra[cç][aã]o\s+no\s+site\s+institucional/i,
  /\bPERSONA\s+E\s+TOM\b/,
  /REGRA\s+DE\s+BASE\s+DE\s+CONHECIMENTO/i,
  /QUANDO\s+A\s+PERGUNTA\s+N[AÃ]O\s+TEM\s+BASE/i,
  /LIMITES\s+E\s+SEGURAN[CÇ]A/i,
  /ESTILO\s+DE\s+SA[IÍ]DA/i,
  /=====\s*BASE\s+DE\s+CONHECIMENTO\s*=====/i,
  /=====\s*(SOBRE\s+O\s+HOSTLOGIC|CAT[AÁ]LOGO\s+DE\s+FUNCIONALIDADES)\s*=====/i,
  /vendedora\s+simp[aá]tica,\s+consultiva/i,
  /entre\s+30\s+e\s+60\s+anos/i,
  /__APP_URL__/,
  /n[aã]o\s+invente\s+pre[cç]os,\s+prazos,\s+datas/i,
  /voc[eê]\s+[eé]\s+a\s+["“']?anfitri-ia["”']?,\s+assistente\s+do\s+hostlogic\s+em\s+modo/i,
  /system\s*prompt\s*:/i,
  /\bsystemInstruction\b/,
];

export const SAFE_REFUSAL_REPLY =
  'Não posso compartilhar minhas instruções internas — elas são confidenciais. Posso te ajudar com o HostLogic: reservas, portal do hóspede, faxinas, financeiro e avisos no celular. O que quer saber?';

export interface OutputFilterResult {
  text: string;
  blocked: boolean;
  /** Marcadores encontrados (só para diagnóstico local; nunca devolver ao browser). */
  markers: string[];
}

export function filterDemoOutput(text: string): OutputFilterResult {
  const markers = PROMPT_LEAK_MARKERS.filter((re) => re.test(text)).map((re) => re.source);
  if (markers.length > 0) {
    return { text: SAFE_REFUSAL_REPLY, blocked: true, markers };
  }
  return { text, blocked: false, markers: [] };
}
