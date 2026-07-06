/**
 * Catálogo de funcionalidades do HostLogic com o valor para o anfitrião.
 * Fonte: varredura no código do app (componentes, server.ts, migrations).
 * Só constam funcionalidades implementadas (ou parciais que já entregam valor hoje).
 * Itens "Em breve" (soon) são roadmap real, não wishlist.
 *
 * Tom da copy: verbo + resultado concreto. Sem adjetivos vazios.
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
      'As reservas da Airbnb entram por iCal e captura automática, sem lançamento manual, num calendário único do portfólio.',
    features: [
      {
        title: 'Captura automática por iCal (Airbnb)',
        desc: 'Sincroniza as reservas da Airbnb sem digitação; calendário e lista operacional ficam alinhados.',
      },
      {
        title: 'Booking.com por iCal (em breve)',
        desc: 'Sincronização do calendário do Booking.com na mesma fila do Airbnb — segunda fase.',
        soon: true,
      },
      {
        title: 'Gmail OAuth (multi-caixa, somente leitura)',
        desc: 'Conecte uma ou mais contas Gmail sem partilhar a senha; acesso somente leitura, com revogação a qualquer momento.',
      },
      {
        title: 'Alterações e cancelamentos aplicados',
        desc: 'Quando a Airbnb muda datas, hóspedes ou valores, calendário, faxinas e financeiro atualizam juntos.',
      },
      {
        title: 'Reconciliação pelo código de confirmação',
        desc: 'Liga portal, automações e reserva pelo código Airbnb — mesmo quando ele não aparece no iCal.',
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
        title: 'Badges de status por reserva',
        desc: 'Mostra o que falta antes do check-in: portal, portaria, repasse, faxina e alteração.',
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
      'A tela que reúne o que entra, o que sai e o que precisa de você — no lugar da planilha e do grupo de WhatsApp.',
    features: [
      {
        title: 'KPIs de check-in e check-out (1, 3 e 7 dias)',
        desc: 'Mostra quantas entradas e saídas há nos próximos dias, com destaque para as janelas curtas.',
      },
      {
        title: 'Alertas operacionais reunidos',
        desc: 'Falhas de IA, alterações pendentes, portaria, despesas, limpeza, mensagens, manutenção, compras e fila do condomínio num só lugar.',
      },
      {
        title: 'Painel de falhas com resolução',
        desc: 'Marque falhas como resolvidas, veja o histórico de tarefas e dispare agentes manualmente.',
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
      'Um link do imóvel para cadastro, acompanhantes, regras, localização e Anfitri-IA — com visibilidade para o anfitrião.',
    features: [
      {
        title: 'Check-in digital em etapas',
        desc: 'Titular, acompanhantes, regras e vistoria num fluxo guiado pelo celular, sem app para instalar.',
      },
      {
        title: 'Cadastro do titular com selfie',
        desc: 'Dados pessoais e foto de rosto para liberação no condomínio, com consentimento LGPD.',
      },
      {
        title: 'Autocadastro de acompanhantes',
        desc: 'O titular pode cadastrar os acompanhantes ou enviar um link individual para cada pessoa se autocadastrar.',
      },
      {
        title: 'Link do imóvel na mensagem do Airbnb',
        desc: 'Mantenha o link do portal na mensagem automática do Airbnb para o hóspede acessar regras, localização e instruções.',
      },
      {
        title: 'Guia do imóvel após o check-in',
        desc: 'Wi-Fi, regras, acesso, localização e orientações ficam disponíveis durante a estadia — o hóspede não precisa perguntar.',
      },
      {
        title: 'Cadastro de veículo (placa)',
        desc: 'Registra a placa para condomínios que a exigem na portaria.',
      },
      {
        title: 'Anfitri-IA dentro do portal',
        desc: 'O hóspede tira dúvidas sobre regras, acesso e estadia com base no guia que você cadastrou.',
      },
      {
        title: 'Histórico visível para o anfitrião',
        desc: 'Veja no painel o que o hóspede perguntou e o que a Anfitri-IA respondeu, sem pedir prints.',
      },
      {
        title: 'Acesso pelo código Airbnb',
        desc: 'O hóspede entra com o código de confirmação da reserva, sem link personalizado manual.',
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
      'Responde ao hóspede no portal do imóvel e deixa o histórico visível para o anfitrião acompanhar cada conversa.',
    features: [
      {
        title: 'Assistente do hóspede no portal',
        desc: 'Responde Wi-Fi, regras, horários, localização e guia do imóvel 24h com base no que você treinou.',
      },
      {
        title: 'Consultora do gestor no painel',
        desc: 'Converse sobre ocupação, pendências, faxinas, falhas e preço, com tom direto para decidir rápido.',
      },
      {
        title: 'Números vindos do banco (anti-alucinação)',
        desc: 'Totais de check-ins, faxinas e falhas vêm do sistema, não da imaginação da IA — você confia nos números.',
      },
      {
        title: 'Comandos por slash no chat',
        desc: 'Atalhos como /status, /falhas, /faxinas-criticas, /checkins-hoje, /historico-hospede e /notificar-equipe.',
      },
      {
        title: 'Entrada por voz e leitura em voz (TTS)',
        desc: 'Use o chat sem as mãos durante portaria, limpeza ou deslocamento.',
      },
      {
        title: 'Histórico de conversa por reserva',
        desc: 'Veja o que o hóspede perguntou e o que a Anfitri-IA respondeu — útil para auditoria, suporte e condomínios.',
      },
      {
        title: 'Delegação de agentes configurável',
        desc: 'Você define quais agentes a Anfitri-IA pode acionar (check-in, limpeza, compras, manutenção).',
      },
    ],
  },
  {
    id: 'limpeza',
    title: 'Limpeza e faxinas',
    blurb:
      'Cada check-out gera uma ordem de serviço, com geofence, auditoria por fotos e lembretes no WhatsApp da faxineira.',
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
        title: 'Atribuição à faxineira certa',
        desc: 'Delegue a O.S.; a faxineira vê só o que é dela, com as instruções do imóvel no celular.',
      },
      {
        title: 'Início automático ao chegar (geofence)',
        desc: 'Ao entrar no raio GPS do imóvel, a O.S. passa para «em andamento» — sem depender de clique.',
      },
      {
        title: 'Auditoria por fotos de itens sorteados',
        desc: 'O sistema sorteia 3 itens ou cômodos por tarefa e exige as fotos antes de liberar.',
      },
      {
        title: 'Liberação da unidade com 3 fotos',
        desc: 'Só libera o imóvel para o próximo hóspede com evidência mínima de limpeza concluída.',
      },
      {
        title: 'Lembretes no WhatsApp da faxineira',
        desc: 'Avisos no dia anterior e antes do check-out, com link direto para a tarefa no app.',
      },
      {
        title: 'Reporte de manutenção na faxina',
        desc: 'Problemas achados na limpeza são registrados com fotos, sem WhatsApp solto.',
      },
      {
        title: 'Pedido de insumos direto para Compras',
        desc: 'A faxineira solicita materiais (quantidade e link) e o gestor centraliza em Compras.',
      },
      {
        title: 'Alertas de faxina crítica',
        desc: 'Avisa quando há risco de não liberar o imóvel a tempo do próximo check-in.',
      },
    ],
  },
  {
    id: 'equipe',
    title: 'Equipe e acessos',
    blurb:
      'Quem acessa o HostLogic, com que permissão e como entra — centralizado, sem senha em grupo de WhatsApp.',
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
        desc: 'Contas provisionadas não ficam com credencial temporária; exige senha forte.',
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
        desc: 'Remove o acesso mas mantém o registro — ex-colaboradores ficam para consulta e auditoria.',
      },
    ],
  },
  {
    id: 'imoveis-condominios',
    title: 'Imóveis e condomínios',
    blurb:
      'A carteira de imóveis organizada, com GPS, iCal, perfis de condomínio e o guia que alimenta o portal.',
    features: [
      {
        title: 'Cadastro do imóvel',
        desc: 'Nome, tipo, endereço, foto, bairro e região — base para reservas, faxinas, portal e vistoria.',
      },
      {
        title: 'Coordenadas GPS capturadas no local',
        desc: 'Habilita o geofence de faxina e a validação de vistoria por proximidade, com o ponto real do apto.',
      },
      {
        title: 'iCal do Airbnb por imóvel',
        desc: 'Guarde a URL do calendário da Airbnb no cadastro, com sync manual quando precisar na hora.',
      },
      {
        title: 'Perfis de condomínio reutilizáveis',
        desc: 'Dados operacionais do prédio e regras de portaria reaproveitados em vários imóveis do mesmo condomínio.',
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
        title: 'Guia pós-check-in e link Airbnb',
        desc: 'Escreva o guia uma vez (texto e imagens) e copie um link fixo com o código de confirmação para o anúncio.',
      },
      {
        title: 'Configuração de vistoria por imóvel',
        desc: 'Defina cômodos, quantidade de fotos e raio GPS por unidade antes do hóspede entrar.',
      },
    ],
  },
  {
    id: 'vistoria',
    title: 'Vistoria digital',
    blurb:
      'Registro do estado do imóvel na entrada e na saída — fotos com data, GPS e hash, assinatura digital e PDF.',
    features: [
      {
        title: 'Checklist de cômodos por imóvel',
        desc: 'A vistoria segue a planta real (sala, quartos, banheiro), não um formulário genérico.',
      },
      {
        title: 'Quantidade de fotos por número de quartos',
        desc: 'Ajusta as fotos exigidas ao tamanho do imóvel, sem sobrecarregar o hóspede.',
      },
      {
        title: 'Raio GPS configurável',
        desc: 'Tolerância geográfica por unidade (10 a 5000 m), best-effort — não bloqueia se o GPS for negado.',
      },
      {
        title: 'Fotos com metadados de auditoria',
        desc: 'Data, hora, GPS e hash SHA-256 em cada foto — evidência técnica em disputa de danos.',
      },
      {
        title: 'Saída comparada à entrada',
        desc: 'Na saída, referencia as fotos da entrada por cômodo para apontar alterações ou danos.',
      },
      {
        title: 'Assinatura digital do hóspede',
        desc: 'Aceite formal do estado do imóvel no check-in e no check-out.',
      },
      {
        title: 'Assinatura do anfitrião e termo em PDF',
        desc: 'Se o hóspede reporta problema, você assina e gera um documento baixável para arquivo ou condomínio.',
      },
    ],
  },
  {
    id: 'financeiro',
    title: 'Financeiro',
    blurb:
      'Receita, repasses, custos e lucro por imóvel, sem planilha paralela e com o repasse Airbnb reconciliado.',
    features: [
      {
        title: 'Painel do mês (líquido, recebido, a receber, YTD)',
        desc: 'Quanto entrou, quanto falta e o resultado líquido do mês, com comparativo e acumulado do ano.',
      },
      {
        title: 'Filtros por mês/ano, imóvel e proprietário',
        desc: 'Consolide a carteira ou filtre por unidade e por dono, com comissão configurável por proprietário.',
      },
      {
        title: 'Gráfico de previsto, recebido, custos e lucro',
        desc: 'Acompanhe o fluxo de caixa e a margem ao longo de meses passados e futuros.',
      },
      {
        title: 'Extrato por imóvel com alerta de pendência',
        desc: 'Bruto, recebido, despesas e líquido por unidade, destacando o repasse ainda não reconciliado.',
      },
      {
        title: 'Repasse Airbnb reconciliado',
        desc: 'Compara previsão e valor pago; se o repasse da Airbnb divergir, sinaliza para você reconciliar.',
      },
      {
        title: 'Despesas por categoria',
        desc: 'Faxina, condomínio, luz, água, internet, manutenção e impostos, com previsão e baixa quando pago.',
      },
      {
        title: 'Proprietários e comissão automática',
        desc: 'Modele a carteira de terceiros e desconte a comissão do líquido sem cálculo manual.',
      },
      {
        title: 'Distribuição de custos em gráfico',
        desc: 'Veja para onde o dinheiro está indo: limpeza, condomínio ou impostos.',
      },
      {
        title: 'Precificação assistida',
        desc: 'Cole preços de concorrentes da Airbnb e receba sugestão de tarifa (mediana, P25/P75) com leitura da IA.',
      },
      {
        title: 'Exportação em CSV e repasse em PDF',
        desc: 'Compartilhe números com o contador ou o proprietário e arquive o mês sem reescrever dados.',
      },
      {
        title: 'Ocultar valores na tela',
        desc: 'Esconde os valores (viram ****) em reunião ou tela compartilhada.',
      },
    ],
  },
  {
    id: 'compras',
    title: 'Compras',
    blurb:
      'A equipe pede insumos por imóvel; você aprova e o valor entra sozinho como despesa no financeiro.',
    features: [
      {
        title: 'Solicitação de insumos por imóvel',
        desc: 'Desinfetante, lâmpadas e material de limpeza pedidos num só lugar, sem WhatsApp disperso.',
      },
      {
        title: 'Fila de compras com filtro por imóvel',
        desc: 'Acompanhe os pedidos pendentes e aprovados da operação.',
      },
      {
        title: 'Aprovação vira despesa automática',
        desc: 'Ao aprovar a compra, o valor entra no Financeiro como despesa categorizada (limpeza ou manutenção).',
      },
      {
        title: 'Módulo ativável por plano',
        desc: 'Compras é um módulo premium, ligado conforme o contrato.',
        soon: true,
      },
    ],
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    blurb:
      'O canal que o hóspede brasileiro já usa, com mensagens operacionais e a Anfitri-IA respondendo na reserva certa.',
    features: [
      {
        title: 'Templates automáticos editáveis',
        desc: 'Boas-vindas, regras da estadia e pré-check-in com variáveis {{nome}}, {{regras}} e {{link}}.',
      },
      {
        title: 'Interruptores por tipo de mensagem',
        desc: 'Ligue ou desligue cada fluxo sem tocar em código, controlando custo e tom.',
      },
      {
        title: 'Pré-check-in automático (~24h antes)',
        desc: 'Lembra as regras, o link do portal e alerta sobre acompanhantes incompletos antes da chegada.',
      },
      {
        title: 'Conversa ligada à reserva pelo número',
        desc: 'Quando o hóspede escreve, a resposta vem no contexto da estadia certa, sem misturar hóspedes.',
      },
      {
        title: 'Resposta automática da Anfitri-IA',
        desc: 'Atende no canal preferido do hóspede, com escalação para você quando necessário.',
        soon: true,
      },
      {
        title: 'Notificações ao anfitrião',
        desc: 'Avisa cancelamentos, falhas de condomínio e faxina crítica no número que você já usa.',
      },
      {
        title: 'Notificações à equipe',
        desc: 'A faxineira recebe a O.S. e os cancelamentos, reduzindo ligações do anfitrião.',
      },
      {
        title: 'Lembretes de faxina configuráveis',
        desc: 'Horário e fuso do dia anterior e do dia da faxina ajustáveis por conta.',
      },
      {
        title: 'Menu guiado e número não cadastrado',
        desc: 'O hóspede pede «menu» e recebe opções; número desconhecido é orientado a se cadastrar, sem vazar dados.',
      },
      {
        title: 'Anti-loop e guarda de envio',
        desc: 'Protege a reputação do número Business e evita spam acidental.',
      },
    ],
  },
  {
    id: 'integracoes',
    title: 'Integrações operacionais',
    blurb:
      'iCal, Gmail OAuth e conferência operacional num fluxo confiável, com monitoramento e recuperação de falhas.',
    features: [
      {
        title: 'Gmail OAuth multi-caixa',
        desc: 'Conecte mais de uma caixa Gmail em somente leitura, com revogação a qualquer momento (LGPD).',
      },
      {
        title: 'Rotinas de portaria por unidade',
        desc: 'Organize os dados exigidos por cada condomínio e acompanhe pendências sem expor detalhes técnicos no site público.',
      },
      {
        title: 'Fila de conferência de portaria',
        desc: 'Acompanhe falhas, confirmação manual e reconciliação de cadastro sem duplicar hóspedes.',
      },
      {
        title: 'Webhooks idempotentes',
        desc: 'Reenvios de webhook não duplicam reservas nem eventos — processamento confiável.',
      },
      {
        title: 'Pipeline visual de integrações',
        desc: 'Estado legível de cada etapa de captura e conferência, com badges por reserva.',
      },
    ],
  },
  {
    id: 'seguranca-lgpd',
    title: 'Segurança e LGPD',
    blurb:
      'Multi-tenant com RLS, mascaramento de PII e retenção automática dos dados de hóspedes.',
    features: [
      {
        title: 'Multi-tenant com RLS',
        desc: 'Reservas, financeiro e equipe da sua conta ficam isolados de outras contas na mesma plataforma.',
      },
      {
        title: 'Mascaramento de PII',
        desc: 'Oculta CPF, placas e nomes sensíveis nas listagens quando ativo, reduzindo a exposição.',
      },
      {
        title: 'Consentimento LGPD no portal',
        desc: 'O hóspede aceita termos e privacidade antes do check-in, com URLs configuráveis.',
      },
      {
        title: 'Retenção e anonimização automáticas',
        desc: 'Remove ou anonimiza os dados do hóspede após o prazo legal configurável, sem trabalho manual.',
      },
      {
        title: 'Aceite legal com prova registrada',
        desc: 'O usuário host fica bloqueado até aceitar os documentos atualizados, com hora e IP registrados.',
      },
      {
        title: 'Páginas legais públicas',
        desc: 'Privacidade, Termos e DPA acessíveis a hóspedes e anfitriões, com rodapé unificado.',
      },
      {
        title: 'Logs de auditoria operacional',
        desc: 'Rastreia captura de reservas, falhas de IA, faxinas, condomínio e ações da equipe.',
      },
      {
        title: 'Exportação de logs (CSV/TXT)',
        desc: 'Compartilhe evidências com suporte, contabilidade ou auditoria externa.',
      },
      {
        title: 'Backup e restauro da conta',
        desc: 'Exporte e importe um pacote JSON para recuperação de emergência do tenant.',
      },
    ],
  },
];

export const FEATURE_COUNT = FEATURE_CATEGORIES.reduce(
  (sum, category) => sum + category.features.length,
  0,
);

export const FEATURE_CATEGORY_COUNT = FEATURE_CATEGORIES.length;
