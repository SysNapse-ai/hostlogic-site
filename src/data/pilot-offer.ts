// GERADO por scripts/sync-pilot-offer-to-site.mjs — editar em hostlogic app src/content/pilotOffer.ts
/**
 * Fonte única da oferta do programa piloto.
 * Sem imports: este ficheiro é copiado tal e qual para o site.
 * Editar só aqui.
 */
export const pilotOffer = {
  trialDays: 30,
  noCard: true,
  discountPct: 50,
  discountMonths: 3,
  conversationDays: [7, 21, 30],
  tiers: [
    { id: 'faixa_1', min: 1, max: 1, priceCents: 3900, range: '1 imóvel', price: 'R$39/mês' },
    { id: 'faixa_2', min: 2, max: 2, priceCents: 6900, range: '2 imóveis', price: 'R$69/mês' },
    { id: 'faixa_3_5', min: 3, max: 5, priceCents: 9900, range: '3 a 5 imóveis', price: 'R$99/mês' },
    { id: 'faixa_6_8', min: 6, max: 8, priceCents: 15900, range: '6 a 8 imóveis', price: 'R$159/mês' },
    { id: 'faixa_9_15', min: 9, max: 15, priceCents: 24900, range: '9 a 15 imóveis', price: 'R$249/mês' },
    { id: 'faixa_16_mais', min: 16, max: null, priceCents: null, range: 'Mais de 15 imóveis', price: 'Fale com a gente' },
  ],
  pilotEyebrow: 'Programa piloto',
  pilotTitle: 'Quer ser piloto e receber vantagens?',
  pilotBullets: [
    'Trinta dias grátis para todo o seu portfólio, sem cartão.',
    'Depois dos 30 dias, 50% da mensalidade da tabela por 3 meses, em troca de seu feedback.',
    'Sem contrato. Sai quando quiser.',
    'Quanto mais imóveis no seu portfólio, mais você vê o valor do HostLogic.',
  ],
  pilotCta: 'Peça para entrar no programa piloto.',
  accessCta: 'Quero ser piloto',
  accessCtaHref: 'https://hostlogic.com.br/planos#programa-piloto',
  fromPriceLabel: 'a partir de R$39/mês',
  priceContext:
    'Depois dos 30 dias, a mensalidade segue esta tabela. Em troca de seu feedback, você paga 50% por 3 meses.',
  plansTitle: 'Mensalidade por faixa de imóveis',
  formTitle: 'Quero participar do programa piloto',
  formSub:
    'Trinta dias grátis para todo o seu portfólio, sem cartão. Sem contrato. Sai quando quiser.',
  faq: [
    {
      question: 'Preciso conectar API da Airbnb?',
      answer:
        'Não. O HostLogic centraliza as reservas que você já recebe e organiza tudo no painel, sem depender de integrações complexas.',
    },
    {
      question: 'Como funciona o preço por imóvel?',
      answer:
        'Conta-se o número de imóveis ativos na sua conta. A mensalidade é a da faixa onde esse número cai: 1 imóvel, 2, 3 a 5, 6 a 8 ou 9 a 15. Se você adicionar ou remover imóveis e mudar de faixa, o valor muda no mês seguinte. Acima de 15 imóveis, combinamos caso a caso.',
    },
    {
      question: 'Como começo?',
      answer:
        'Peça para entrar no programa piloto. Respondemos por e-mail. Trinta dias grátis para todo o seu portfólio, sem cartão. Sem contrato. Sai quando quiser.',
    },
  ],
  listingsBands: [
    { id: '1', label: '1 imóvel' },
    { id: '2-5', label: '2–5 imóveis' },
    { id: '6-10', label: '6–10 imóveis' },
    { id: '11-20', label: '11–20 imóveis' },
    { id: '20+', label: '20+ imóveis' },
  ],
} as const;
