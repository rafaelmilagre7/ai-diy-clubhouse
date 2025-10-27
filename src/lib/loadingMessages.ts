/**
 * Biblioteca centralizada de mensagens de loading por contexto
 * Todas as mensagens são rotativas e contextualizadas
 */

export const LOADING_MESSAGES = {
  // Contextos genéricos
  default: [
    "Preparando ambiente...",
    "Carregando dados...",
    "Quase lá...",
    "Finalizando...",
  ],

  // Autenticação e perfil
  auth: [
    "Verificando suas credenciais...",
    "Configurando ambiente seguro...",
    "Preparando sua sessão...",
    "Carregando permissões...",
    "Finalizando autenticação...",
  ],

  profile: [
    "Carregando seu perfil...",
    "Buscando suas informações...",
    "Preparando dashboard...",
    "Sincronizando dados...",
  ],

  // Builder - Geração de soluções
  builder_generating: [
    "Analisando suas respostas...",
    "Processando informações...",
    "Criando estrutura da solução...",
    "Gerando framework personalizado...",
    "Montando checklist de implementação...",
    "Preparando recomendações...",
    "Organizando conteúdo...",
    "Finalizando sua solução...",
  ],

  builder_framework: [
    "Extraindo o cérebro do Rafael Milagre...",
    "Pegando emprestado a experiência de design do Steve Jobs...",
    "Consultando os sábios do Vale do Silício...",
    "Roubando insights dos unicórnios de startup...",
    "Telepatiando com os fundadores da OpenAI...",
    "Decodificando padrões de sucessos bilionários...",
    "Invocando o espírito empreendedor de Elon Musk...",
    "Canalizando a sabedoria dos mestres da IA...",
    "Destilando décadas de experiência em minutos...",
  ],

  builder_checklist: [
    "Quebrando pedras grandes em pedrinhas...",
    "Transformando caos em ordem cronológica...",
    "Criando atalhos para o seu sucesso...",
    "Cortando gordura, ficando só com músculo...",
    "Descomplicando o complicado...",
    "Montando seu GPS para o sucesso...",
    "Eliminando armadilhas ocultas do caminho...",
    "Traduzindo teoria em ação prática...",
    "Simplificando sem perder a profundidade...",
  ],

  // 🆕 FASE 2: Novos contextos específicos do Builder
  builder_lovable_prompt: [
    "Extraindo padrões de código campeões...",
    "Traduzindo sua visão em linguagem Lovable...",
    "Gerando prompt otimizado para IA...",
    "Estruturando documentação técnica...",
    "Preparando instruções de implementação...",
    "Montando blueprint de desenvolvimento...",
    "Criando roadmap de execução...",
    "Organizando especificações técnicas...",
  ],

  builder_tools_validation: [
    "Validando ferramentas sugeridas...",
    "Consultando catálogo de integrações...",
    "Verificando compatibilidades...",
    "Buscando alternativas inteligentes...",
    "Confirmando disponibilidade de APIs...",
  ],

  feasibility_validation: [
    "Analisando viabilidade técnica...",
    "Consultando especialistas virtuais...",
    "Avaliando complexidade de implementação...",
    "Verificando limitações conhecidas...",
    "Estimando esforço necessário...",
    "Calculando custo-benefício...",
  ],

  builder_recommendations: [
    "Vasculhando +10 mil horas de conteúdo...",
    "Garimpando pérolas no oceano de conhecimento...",
    "Filtrando ouro do que é só pirita...",
    "Conectando pontos que você nem via...",
    "Encurtando sua curva de aprendizado...",
    "Montando seu atalho para a maestria...",
    "Evitando que você perca tempo com fluff...",
    "Selecionando só o que realmente funciona...",
    "Criando sua trilha personalizada de sucesso...",
  ],

  // Dashboard e soluções
  dashboard: [
    "Carregando suas soluções...",
    "Buscando atualizações...",
    "Preparando visão geral...",
    "Sincronizando progresso...",
  ],

  solutions: [
    "Carregando detalhes da solução...",
    "Preparando framework...",
    "Estruturando checklist...",
    "Buscando recomendações...",
    "Carregando recursos...",
  ],

  implementation: [
    "Carregando checklist de implementação...",
    "Preparando quadro Kanban...",
    "Buscando seu progresso...",
    "Sincronizando tarefas...",
  ],

  // Networking
  networking: [
    "Conectando pessoas incríveis...",
    "Buscando conexões relevantes...",
    "Carregando network...",
    "Preparando colaborações...",
  ],

  // Learning
  learning: [
    "Preparando conteúdo de aprendizado...",
    "Carregando módulos...",
    "Estruturando aulas...",
    "Organizando materiais...",
  ],

  learning_module: [
    "Carregando módulo...",
    "Preparando aulas...",
    "Buscando recursos...",
    "Sincronizando progresso...",
  ],

  learning_lesson: [
    "Carregando aula...",
    "Preparando conteúdo...",
    "Buscando materiais complementares...",
    "Finalizando...",
  ],

  // Admin
  admin: [
    "Carregando painel administrativo...",
    "Buscando dados do sistema...",
    "Preparando análises...",
    "Carregando métricas...",
  ],

  admin_users: [
    "Carregando usuários...",
    "Buscando perfis...",
    "Preparando estatísticas...",
    "Sincronizando dados...",
  ],

  admin_solutions: [
    "Carregando soluções do sistema...",
    "Buscando templates...",
    "Preparando análises...",
    "Carregando configurações...",
  ],

  // Processamento pesado
  heavy_processing: [
    "Processando informações complexas...",
    "Analisando dados...",
    "Gerando insights...",
    "Finalizando análise...",
    "Quase pronto...",
  ],

  // Data sync
  syncing: [
    "Sincronizando com servidor...",
    "Atualizando dados...",
    "Salvando alterações...",
    "Finalizando sincronização...",
  ],
};

/**
 * Helper para pegar mensagens de loading por contexto
 * Retorna mensagens padrão se o contexto não existir
 */
export const getLoadingMessages = (context: keyof typeof LOADING_MESSAGES): string[] => {
  return LOADING_MESSAGES[context] || LOADING_MESSAGES.default;
};
