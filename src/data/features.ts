/**
 * Catálogo de funcionalidades do HostLogic com o valor para o anfitrião.
 * Fonte: varredura no código do app (componentes, server.ts, migrations).
 * Só constam funcionalidades implementadas (ou parciais que já entregam valor hoje).
 * Itens "Em breve" (soon) são roadmap real, não wishlist.
 *
 * Tom da copy: verbo + resultado concreto. Sem adjetivos vazios.
 * Não anunciar no catálogo público: WhatsApp nativo, Gmail OAuth, envio automático à portaria.
 */

export interface Feature {
  title: string;
  desc: string;
  soon?: boolean;
}

export interface FeatureCategory {
  id: string;
  title: string;
  blurb: string;
  features: Feature[];
}

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: 'reservas-calendario',
    title: 'Reservas e calendário',
    blurb:
      'As reservas da Airbnb entram sozinhas, sem lançamento manual, num calendário único de todos os imóveis. Relatório do mês sai com um clique.',
    features: [
      {
        title: 'Reservas do Airbnb entram sozinhas',
        desc: 'A conexão com o calendário do Airbnb (iCal) traz as reservas sem digitação; calendário e lista do dia a dia ficam alinhados.',
      },
      {
        title: 'Booking.com (em breve)',
        desc: 'Conexão com o calendário do Booking.com na mesma fila do Airbnb — segunda fase.',
        soon: true,
      },
      {
        title: 'Alterações e cancelamentos aplicados',
        desc: 'Quando a Airbnb muda datas, hóspedes ou valores, calendário, faxinas e financeiro atualizam juntos.',
      },
      {
        title: 'Reserva ligada pelo código de confirmação',
        desc: 'Portal, faxina e financeiro ficam na mesma reserva pelo código Airbnb — mesmo quando o calendário não o informa.',
      },
      {
        title: 'Revisão antes de fechar a pendência',
        desc: 'Confira a sugestão de data, hóspede ou valor antes de aceitar uma alteração e evitar calendário desalinhado.',
      },
      {
        title: 'Calendário multi-imóvel consolidado',
        desc: 'Um calendário para o portfólio, com a origem da reserva (Airbnb ou direto) por cor.',
      },
      {
        title: 'Etiquetas de status por reserva',
        desc: 'Mostra o que falta antes do check-in: portal, faxina, pagamento e alteração.',
      },
      {
        title: 'Filtros Ativas, Alteradas e Canceladas',
        desc: 'Foca a lista de reservas capturadas no que precisa de ação, sem procurar reserva a olho.',
      },
    ],
  },
  {
    id: 'monitor',
    title: 'Monitor operacional',
    blurb:
      'Check-ins, check-outs e o que ainda precisa de você — no painel e com avisos no celular (iPhone e Android).',
    features: [
      {
        title: 'Contadores de check-in e check-out (1, 3 e 7 dias)',
        desc: 'Mostra quantas entradas e saídas há nos próximos dias, com destaque para as janelas curtas.',
      },
      {
        title: 'Avisos no iPhone e no Android',
        desc: 'O celular avisa reserva nova, alteração, cancelamento, cadastro no portal, pergunta na Anfitri-IA e faxina iniciada. Você liga ou desliga cada tipo.',
      },
      {
        title: 'Alertas operacionais reunidos',
        desc: 'Alterações pendentes, despesas, limpeza e falhas da Anfitri-IA num só lugar.',
      },
      {
        title: 'Painel de falhas com resolução',
        desc: 'Marque falhas como resolvidas e veja o histórico do que já foi tratado.',
      },
      {
        title: 'Próximas reservas com contagem regressiva',
        desc: 'Check-ins das próximas 30 noites e estadias em curso, com contagem regressiva visual.',
      },
      {
        title: 'Escalações da Anfitri-IA',
        desc: 'Quando a IA não resolve, o Monitor avisa para você intervir antes de o hóspede ficar sem resposta.',
      },
    ],
  },
  {
    id: 'portal-hospede',
    title: 'Portal do hóspede',
    blurb:
      'Um link exclusivo do imóvel: informações da estadia, cadastro de acompanhantes e Anfitri-IA — o hóspede se resolve sozinho.',
    features: [
      {
        title: 'Check-in digital em etapas',
        desc: 'Titular, acompanhantes e regras num fluxo guiado pelo celular, sem app para instalar.',
      },
      {
        title: 'Cadastro do titular com selfie',
        desc: 'Dados pessoais e foto de rosto no fluxo guiado, com aceite de privacidade.',
      },
      {
        title: 'Autocadastro de acompanhantes',
        desc: 'O titular pode cadastrar os acompanhantes ou enviar um link individual para cada pessoa se autocadastrar.',
      },
      {
        title: 'Link do imóvel na mensagem do Airbnb',
        desc: 'Mantenha o link exclusivo na mensagem automática do Airbnb: o hóspede acessa a estadia, regras e instruções.',
      },
      {
        title: 'Guia do imóvel após o check-in',
        desc: 'Wi-Fi, regras, acesso, localização e orientações ficam disponíveis durante a estadia — o hóspede não precisa perguntar.',
      },
      {
        title: 'Cadastro de veículo (placa)',
        desc: 'Registra a placa quando o imóvel pede, junto com o restante do cadastro.',
      },
      {
        title: 'Anfitri-IA dentro do portal',
        desc: 'O hóspede tira dúvidas com base no texto que você cadastrou — inclusive o rascunho do anúncio.',
      },
      {
        title: 'Histórico visível para o anfitrião',
        desc: 'A conversa do portal aparece na visão anfitrião: consulte e, se preferir, esclareça o hóspede — sem pedir print.',
      },
      {
        title: 'Acesso pelo link ou código da reserva',
        desc: 'O hóspede entra pelo link exclusivo do imóvel ou pelo código de confirmação — sem app ou login manual.',
      },
      {
        title: 'Pré-visualização para o anfitrião',
        desc: 'Veja exatamente o que o hóspede vai ver antes de enviar o link.',
      },
    ],
  },
  {
    id: 'anfitri-ia',
    title: 'Anfitri-IA',
    blurb:
      'Responde o hóspede no portal; a conversa fica na visão anfitrião. O celular avisa quando o hóspede pergunta. No painel, fale por texto ou por voz.',
    features: [
      {
        title: 'Assistente do hóspede no portal',
        desc: 'Responde Wi-Fi, regras, horários e guia do imóvel com base no que você cadastrou — inclusive o texto bruto do anúncio.',
      },
      {
        title: 'Rascunho vira resposta segura',
        desc: 'Cole o texto como rascunho; a Anfitri-IA organiza e só afirma o que você incluiu no campo de respostas.',
      },
      {
        title: 'Consultora do gestor no painel',
        desc: 'Converse sobre ocupação, pendências, faxinas e o estado das reservas, com os números vindos do sistema.',
      },
      {
        title: 'Por voz — aperte para falar sobre as estadias',
        desc: 'No painel, fale com a Anfitri-IA sem digitar: aperte para falar e ouça a resposta enquanto se desloca.',
      },
      {
        title: 'Comandos por atalho no chat',
        desc: 'Atalhos como /status, /falhas, /faxinas-criticas e /checkins-hoje para ir direto ao que precisa.',
      },
      {
        title: 'Mesma conversa na visão anfitrião',
        desc: 'O que a Anfitri-IA responde no portal fica no seu painel: consulte e, se preferir, esclareça o hóspede.',
      },
      {
        title: 'Histórico de conversa por reserva',
        desc: 'Veja o que o hóspede perguntou e o que a Anfitri-IA respondeu, por estadia — sem pedir print.',
      },
      {
        title: 'Aviso no celular quando o hóspede pergunta',
        desc: 'O iPhone ou o Android avisa no momento em que o hóspede fala com a Anfitri-IA no portal.',
      },
    ],
  },
  {
    id: 'limpeza',
    title: 'Limpeza e faxinas',
    blurb:
      'Cada check-out gera uma ordem de serviço. A faxineira entra com senha própria, avisa a chegada e tira fotos — prova da faxina e do estado do imóvel.',
    features: [
      {
        title: 'Ordem de serviço automática por check-out',
        desc: 'A tarefa entra na fila quando o hóspede sai ou a data muda, sem criar nada à mão.',
      },
      {
        title: 'Fila com pendentes, atrasadas e concluídas',
        desc: 'O gestor vê o que está na fila, o que atrasou e o histórico, sem planilha.',
      },
      {
        title: 'Faxineira com senha própria',
        desc: 'Ela entra no app com o próprio acesso, vê só as tarefas dela e avisa a chegada ao imóvel.',
      },
      {
        title: 'Fotos de itens sorteados',
        desc: 'O sistema sorteia itens ou cômodos e exige as fotos antes de liberar a unidade.',
      },
      {
        title: 'Prova do estado do imóvel',
        desc: 'As fotos comprovam a faxina e como o imóvel estava antes da próxima reserva.',
      },
      {
        title: 'Alertas de faxina crítica',
        desc: 'Avisa quando há risco de não liberar o imóvel a tempo do próximo check-in.',
      },
      {
        title: 'Aviso no celular quando a faxina começa',
        desc: 'O iPhone e o Android avisam no momento em que a faxineira registra a chegada.',
      },
    ],
  },
  {
    id: 'equipe',
    title: 'Equipe e acessos',
    blurb:
      'Quem acessa o HostLogic, com que permissão e como entra — cada um com a própria senha, inclusive a faxineira.',
    features: [
      {
        title: 'Cadastro de colaboradores por cargo',
        desc: 'Faxineira, manutenção, funcionário, gerente ou administrador, cada um com o acesso do cargo.',
      },
      {
        title: 'Convite seguro por link',
        desc: 'O colaborador define a própria senha no primeiro acesso, sem senha padrão circulando.',
      },
      {
        title: 'Troca de senha obrigatória no 1º acesso',
        desc: 'Contas novas não ficam com senha temporária; exige senha forte.',
      },
      {
        title: 'Permissões por perfil',
        desc: 'Faxineira não vê calendário nem equipe; gerente e admin gerenciam a operação conforme o cargo.',
      },
      {
        title: 'Limite de 2 administradores',
        desc: 'Evita multiplicar contas com poder total e reduz o risco de configuração errada.',
      },
      {
        title: 'Arquivamento sem apagar histórico',
        desc: 'Remove o acesso mas mantém o registro — ex-colaboradores ficam para consulta.',
      },
    ],
  },
  {
    id: 'imoveis',
    title: 'Imóveis',
    blurb:
      'A carteira de imóveis organizada, com localização, calendário do Airbnb e o guia que alimenta o portal e a Anfitri-IA.',
    features: [
      {
        title: 'Cadastro do imóvel',
        desc: 'Nome, tipo, endereço, foto, bairro e região — base para reservas, faxinas e portal.',
      },
      {
        title: 'Coordenadas GPS capturadas no local',
        desc: 'Localização precisa do imóvel para a equipe e para o mapa do portal do hóspede.',
      },
      {
        title: 'Calendário do Airbnb ligado a cada imóvel',
        desc: 'Guarde o endereço do calendário da Airbnb no cadastro e atualize na hora quando precisar.',
      },
      {
        title: 'Instruções de limpeza e taxa de faxina',
        desc: 'Padronize como cada imóvel é entregue e registre a base de custo da limpeza.',
      },
      {
        title: 'Lotação máxima de hóspedes',
        desc: 'Impede cadastro no portal acima da capacidade do imóvel.',
      },
      {
        title: 'Guia pós-check-in e link do anúncio',
        desc: 'Escreva o guia uma vez (mesmo rascunho) e use o link fixo na mensagem automática do Airbnb.',
      },
    ],
  },
  {
    id: 'financeiro',
    title: 'Financeiro',
    blurb:
      'Receita, custos e lucro por imóvel, sem planilha paralela. O relatório do mês sai com um clique.',
    features: [
      {
        title: 'Painel do mês (líquido, recebido, a receber)',
        desc: 'Quanto entrou, quanto falta e o resultado líquido do mês, com comparativo e acumulado do ano.',
      },
      {
        title: 'Filtros por mês/ano, imóvel e proprietário',
        desc: 'Consolide a carteira ou filtre por unidade e por dono, com comissão configurável por proprietário.',
      },
      {
        title: 'Gráfico de previsto, recebido, custos e lucro',
        desc: 'Acompanhe o fluxo e a margem ao longo de meses passados e futuros.',
      },
      {
        title: 'Extrato por imóvel',
        desc: 'Bruto, recebido, despesas e líquido por unidade, no mesmo painel.',
      },
      {
        title: 'Relatório do mês em um clique',
        desc: 'Gere o fechamento para conferir ou enviar — reservas, custos e lucro, sem montar planilha.',
      },
      {
        title: 'Despesas por categoria',
        desc: 'Faxina, condomínio, luz, água, internet, manutenção e impostos, com previsão e baixa quando pago.',
      },
      {
        title: 'Proprietários e comissão',
        desc: 'Quando você administra para terceiros, desconte a comissão do líquido sem cálculo manual.',
      },
      {
        title: 'Distribuição de custos em gráfico',
        desc: 'Veja para onde o dinheiro está indo: limpeza, condomínio ou impostos.',
      },
      {
        title: 'Precificação assistida',
        desc: 'Cole preços de concorrentes da Airbnb e receba sugestão de tarifa — você decide o que aplicar.',
      },
      {
        title: 'Ocultar valores na tela',
        desc: 'Esconde os valores (viram ****) em reunião ou tela compartilhada.',
      },
    ],
  },
  {
    id: 'seguranca-lgpd',
    title: 'Privacidade dos dados',
    blurb:
      'Cada conta fica isolada. Documento e foto do hóspede não ficam à mostra nas listas. Depois do prazo, o sistema apaga ou anonimiza sozinho.',
    features: [
      {
        title: 'Sua conta isolada das outras',
        desc: 'Reservas, financeiro e equipe da sua conta não misturam com as de outro anfitrião na mesma plataforma.',
      },
      {
        title: 'CPF e documentos ocultos nas listas',
        desc: 'Quando ativo, esconde CPF, placas e nomes sensíveis nas telas do dia a dia.',
      },
      {
        title: 'Hóspede aceita privacidade no portal',
        desc: 'Antes do check-in, o hóspede aceita termos e privacidade, com os textos que você configura.',
      },
      {
        title: 'Dados antigos saem sozinhos',
        desc: 'Depois do prazo que você definir, o sistema apaga ou anonimiza os dados do hóspede, sem trabalho manual.',
      },
      {
        title: 'Aceite legal com registro',
        desc: 'O anfitrião só usa o painel depois de aceitar os documentos atualizados.',
      },
      {
        title: 'Páginas de privacidade e termos',
        desc: 'Privacidade e termos acessíveis a hóspedes e anfitriões, no rodapé do produto.',
      },
      {
        title: 'Histórico do que aconteceu na operação',
        desc: 'Registra captura de reservas, faxinas e ações da equipe para consulta posterior.',
      },
      {
        title: 'Exportar o histórico',
        desc: 'Baixe o registro em arquivo para o contador, o suporte ou uma conferência.',
      },
      {
        title: 'Cópia de segurança da conta',
        desc: 'Exporte e importe um pacote da sua conta para recuperação de emergência.',
      },
    ],
  },
];

export const FEATURE_COUNT = FEATURE_CATEGORIES.reduce(
  (sum, category) => sum + category.features.length,
  0,
);

export const FEATURE_CATEGORY_COUNT = FEATURE_CATEGORIES.length;
