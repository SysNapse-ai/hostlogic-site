/**
 * Slides do carrossel de prints reais (dados de demonstração).
 * Copy alinhada ao plano do site — não anunciar módulos fora do lançamento
 * (envio automático à portaria, Gmail OAuth, WhatsApp nativo).
 */

export interface ProductScreen {
  id: string;
  image: string;
  area: string;
  title: string;
  bullets: string[];
  alt: string;
  width: number;
  height: number;
}

export const PRODUCT_SCREENS: ProductScreen[] = [
  {
    id: 'reserva-cartao',
    image: '/screenshots/reserva-cartao.webp',
    area: 'Reservas',
    title: 'Tudo da estadia num só cartão',
    bullets: [
      'A reserva do Airbnb entra sozinha, com bloco, apartamento e datas.',
      'Badges mostram cadastro do hóspede, faxina e pagamento.',
    ],
    alt: 'Cartão da reserva com bloco, apartamento, datas e status da estadia',
    width: 591,
    height: 1280,
  },
  {
    id: 'portfolio',
    image: '/screenshots/portfolio.webp',
    area: 'Reservas',
    title: 'O portfólio inteiro de relance',
    bullets: [
      'Check-ins e check-outs dos próximos 1, 3 ou 7 dias.',
      'Cada imóvel com cor de status: ocupado, livre com reserva próxima ou lacuna.',
    ],
    alt: 'Portfólio de imóveis com check-ins, check-outs e cores de status',
    width: 591,
    height: 1280,
  },
  {
    id: 'portal-home',
    image: '/screenshots/portal-home.webp',
    area: 'Portal do hóspede',
    title: 'Um link resolve a chegada',
    bullets: [
      'O hóspede recebe o link exclusivo na mensagem automática do Airbnb.',
      'Vê confirmação, datas, endereço com mapa e regras, sem instalar app.',
    ],
    alt: 'Portal do hóspede no celular com confirmação da estadia, datas e mapa',
    width: 449,
    height: 905,
  },
  {
    id: 'checkin-titular',
    image: '/screenshots/checkin-titular.webp',
    area: 'Check-in digital',
    title: 'Cadastro guiado no celular',
    bullets: [
      'O titular preenche nome, documento e telefone no celular.',
      'Selfie opcional com aviso de privacidade.',
      'Acompanhantes por link individual.',
    ],
    alt: 'Formulário de cadastro do titular no check-in digital',
    width: 448,
    height: 905,
  },
  {
    id: 'anfitri-ia',
    image: '/screenshots/anfitri-ia.webp',
    area: 'Anfitri-IA',
    title: 'Pergunte pela operação',
    bullets: [
      'Pergunte em linguagem natural («já cadastraram os acompanhantes?»).',
      'No painel, fale também por PTT (apertar para falar) sobre as estadias.',
      'A resposta vem com dados do painel: imóvel, hóspede, datas e pendências.',
    ],
    alt: 'Chat da Anfitri-IA com pergunta operacional e resposta do painel',
    width: 447,
    height: 902,
  },
  {
    id: 'financeiro-painel',
    image: '/screenshots/financeiro-painel.webp',
    area: 'Financeiro',
    title: 'O mês fecha com um clique',
    bullets: [
      'Pago, a receber e ganhos brutos por imóvel ou portfólio.',
      'Gere o relatório do mês no botão, sem montar planilha.',
    ],
    alt: 'Painel financeiro com pago, a receber e ganhos por imóvel',
    width: 591,
    height: 1280,
  },
  {
    id: 'limpeza-os',
    image: '/screenshots/limpeza-os.webp',
    area: 'Limpeza',
    title: 'O.S. gerada a cada check-out',
    bullets: [
      'Cada saída cria uma ordem de serviço com prazo contando.',
      'A faxineira entra com senha própria e registra a chegada ao imóvel.',
    ],
    alt: 'Ordem de serviço de limpeza gerada no check-out',
    width: 591,
    height: 1280,
  },
  {
    id: 'limpeza-fotos',
    image: '/screenshots/limpeza-fotos.webp',
    area: 'Limpeza',
    title: 'Prova por fotos sorteadas',
    bullets: [
      'O sistema sorteia os itens a fotografar (chão da sala, cama arrumada…).',
      'As fotos comprovam a faxina e o estado do imóvel antes da próxima reserva.',
    ],
    alt: 'Tela de fotos sorteadas para comprovar a faxina',
    width: 408,
    height: 807,
  },
];
