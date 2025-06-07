
// Configurações SEO centralizadas para toda a plataforma

export interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  type?: string;
  image?: string;
}

// SEO base da plataforma
export const baseSEO = {
  siteName: "VIVER DE IA Hub",
  baseUrl: "https://app.viverdeia.com",
  defaultImage: "/og-image-viver-ia.jpg",
  twitterHandle: "@viverdeia"
};

// Configurações SEO por página
export const seoConfigs: Record<string, PageSEO> = {
  // Landing Page
  home: {
    title: "VIVER DE IA Hub | Implemente IA no seu Negócio com Autonomia e Resultados",
    description: "Transforme seu negócio com soluções práticas de IA. Acesse ferramentas, cursos e uma comunidade exclusiva para implementar inteligência artificial e aumentar seus resultados em 30 dias.",
    keywords: "implementar IA negócio, soluções inteligência artificial, ferramentas IA empresas, curso IA prático, automação empresarial, viver de IA",
    type: "website"
  },

  // Dashboard
  dashboard: {
    title: "Dashboard | Seu Centro de Controle para Implementação de IA",
    description: "Acompanhe seu progresso, acesse soluções personalizadas e gerencie suas implementações de IA. Seu hub completo para transformação digital empresarial.",
    keywords: "dashboard IA, centro controle IA, progresso implementação IA, hub transformação digital",
    type: "website"
  },

  // Soluções
  solutions: {
    title: "Soluções de IA para Empresas | Receita, Operação e Estratégia",
    description: "Descubra soluções práticas de IA categorizadas por área: aumente receita, otimize operações e melhore estratégias. Implementações testadas e aprovadas por +1000 empresários.",
    keywords: "soluções IA empresas, automação receita, otimização operacional IA, estratégia IA negócios, implementações práticas IA",
    type: "website"
  },

  // Categorias de Soluções
  'solutions-revenue': {
    title: "Soluções de IA para Aumentar Receita | Vendas e Marketing Automatizado",
    description: "Implemente soluções de IA focadas em receita: automação de vendas, marketing inteligente, atendimento personalizado. Aumente suas vendas em até 40% com IA.",
    keywords: "IA vendas, automação marketing, receita IA, vendas automatizadas, marketing inteligente",
    type: "website"
  },

  'solutions-operational': {
    title: "Automação Operacional com IA | Otimize Processos e Reduza Custos",
    description: "Transforme suas operações com IA: automatize processos, reduza custos operacionais, otimize fluxos de trabalho. Eficiência de até 60% com implementações práticas.",
    keywords: "automação operacional, otimização processos IA, redução custos IA, eficiência operacional",
    type: "website"
  },

  'solutions-strategy': {
    title: "IA Estratégica para Empresas | Decisões Data-Driven e Crescimento",
    description: "Potencialize sua estratégia empresarial com IA: análise de dados avançada, insights preditivos, decisões inteligentes. Cresça 3x mais rápido com estratégia orientada por dados.",
    keywords: "estratégia IA, decisões data-driven, análise dados IA, insights preditivos, crescimento empresarial IA",
    type: "website"
  },

  // Ferramentas
  tools: {
    title: "Catálogo de Ferramentas de IA | +200 Tools Testadas e Aprovadas",
    description: "Acesse o maior catálogo de ferramentas de IA para empresas. Encontre a solução perfeita para automação, produtividade e crescimento do seu negócio.",
    keywords: "ferramentas IA, tools IA empresas, catálogo IA, produtividade IA, automação ferramentas",
    type: "website"
  },

  // Cursos/Learning
  learning: {
    title: "Cursos de IA Prática | Aprenda a Implementar Inteligência Artificial",
    description: "Domine a implementação de IA com cursos práticos e diretos ao ponto. Transforme conhecimento em resultados reais para seu negócio.",
    keywords: "cursos IA prática, aprender IA, implementação IA curso, treinamento IA empresarial",
    type: "website"
  },

  // Comunidade
  community: {
    title: "Comunidade VIVER DE IA | Network de Empresários que Implementam IA",
    description: "Conecte-se com mais de 1000 empresários que estão transformando seus negócios com IA. Compartilhe experiências, tire dúvidas e acelere sua implementação.",
    keywords: "comunidade IA, network empresários IA, fórum IA, discussões implementação IA",
    type: "website"
  },

  // Benefícios
  benefits: {
    title: "Benefícios Exclusivos | Vantagens de ser Membro VIVER DE IA Hub",
    description: "Descubra todos os benefícios exclusivos para membros: acesso antecipado, mentoria personalizada, ferramentas premium e muito mais.",
    keywords: "benefícios membros IA, vantagens exclusivas IA, mentoria IA, ferramentas premium IA",
    type: "website"
  },

  // Eventos
  events: {
    title: "Eventos de IA | Workshops, Webinars e Encontros Exclusivos",
    description: "Participe de eventos exclusivos sobre IA: workshops práticos, webinars com especialistas e encontros presenciais. Acelere seu aprendizado em IA.",
    keywords: "eventos IA, workshops IA, webinars IA, encontros IA, treinamentos presenciais IA",
    type: "website"
  }
};

// Função para gerar SEO dinâmico para soluções individuais
export const generateSolutionSEO = (solution: {
  title: string;
  description: string;
  category: string;
  difficulty: string;
}): PageSEO => {
  const categoryMap: Record<string, string> = {
    'Receita': 'Receita',
    'Operacional': 'Operacional', 
    'Estratégia': 'Estratégia'
  };

  const difficultyMap: Record<string, string> = {
    'easy': 'Iniciante',
    'medium': 'Intermediário',
    'advanced': 'Avançado'
  };

  return {
    title: `${solution.title} | Solução de IA ${categoryMap[solution.category] || 'Prática'}`,
    description: `${solution.description} Implemente esta solução de IA ${categoryMap[solution.category]?.toLowerCase()} de nível ${difficultyMap[solution.difficulty]?.toLowerCase()} e transforme seu negócio.`,
    keywords: `${solution.title.toLowerCase()}, solução IA ${categoryMap[solution.category]?.toLowerCase()}, implementação IA ${difficultyMap[solution.difficulty]?.toLowerCase()}, automação empresarial`,
    type: 'article'
  };
};

// Função para gerar SEO dinâmico para ferramentas
export const generateToolSEO = (tool: {
  name: string;
  description: string;
  category: string;
}): PageSEO => {
  return {
    title: `${tool.name} | Ferramenta de IA para ${tool.category}`,
    description: `${tool.description} Descubra como usar ${tool.name} para transformar seu negócio com inteligência artificial.`,
    keywords: `${tool.name.toLowerCase()}, ferramenta IA ${tool.category.toLowerCase()}, ${tool.category.toLowerCase()} IA, automação ${tool.category.toLowerCase()}`,
    type: 'article'
  };
};

// Função para gerar SEO dinâmico para cursos
export const generateCourseSEO = (course: {
  title: string;
  description: string;
  category?: string;
}): PageSEO => {
  return {
    title: `${course.title} | Curso de IA Prática`,
    description: `${course.description} Domine esta habilidade de IA com curso prático e direto ao ponto.`,
    keywords: `curso ${course.title.toLowerCase()}, aprender IA, treinamento IA prático, ${course.category?.toLowerCase() || 'implementação'} IA`,
    type: 'article'
  };
};
