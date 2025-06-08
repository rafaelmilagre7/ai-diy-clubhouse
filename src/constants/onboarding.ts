
// Constantes para o sistema de onboarding

export const ONBOARDING_STEPS = {
  WELCOME: 1,
  BUSINESS_PROFILE: 2,
  AI_MATURITY: 3,
  OBJECTIVES: 4,
  PERSONALIZATION: 5,
} as const;

export const ONBOARDING_STORAGE_KEY = 'viver_onboarding_data';

// Estados brasileiros
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

// Setores de negócio
export const BUSINESS_SECTORS = [
  { value: 'agriculture', label: 'Agronegócio' },
  { value: 'automotive', label: 'Automotivo' },
  { value: 'banking', label: 'Bancos e Financeiro' },
  { value: 'construction', label: 'Construção Civil' },
  { value: 'consulting', label: 'Consultoria' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'education', label: 'Educação' },
  { value: 'energy', label: 'Energia' },
  { value: 'food', label: 'Alimentação' },
  { value: 'healthcare', label: 'Saúde' },
  { value: 'hospitality', label: 'Hotelaria e Turismo' },
  { value: 'insurance', label: 'Seguros' },
  { value: 'logistics', label: 'Logística' },
  { value: 'manufacturing', label: 'Indústria' },
  { value: 'marketing', label: 'Marketing e Publicidade' },
  { value: 'media', label: 'Mídia e Comunicação' },
  { value: 'nonprofit', label: 'Organizações sem fins lucrativos' },
  { value: 'real_estate', label: 'Imobiliário' },
  { value: 'retail', label: 'Varejo' },
  { value: 'services', label: 'Serviços' },
  { value: 'technology', label: 'Tecnologia' },
  { value: 'ai', label: 'Inteligência Artificial' },
  { value: 'telecommunications', label: 'Telecomunicações' },
  { value: 'transportation', label: 'Transporte' },
  { value: 'other', label: 'Outro' },
];

// Tamanhos de empresa
export const COMPANY_SIZES = [
  { value: '1', label: 'Apenas eu (1 pessoa)' },
  { value: '2-5', label: '2-5 funcionários' },
  { value: '6-10', label: '6-10 funcionários' },
  { value: '11-25', label: '11-25 funcionários' },
  { value: '26-50', label: '26-50 funcionários' },
  { value: '51-100', label: '51-100 funcionários' },
  { value: '101-250', label: '101-250 funcionários' },
  { value: '251-500', label: '251-500 funcionários' },
  { value: '501-1000', label: '501-1000 funcionários' },
  { value: '1000+', label: 'Mais de 1000 funcionários' },
];

// Faixas de faturamento
export const REVENUE_RANGES = [
  { value: '0-100k', label: 'Até R$ 100 mil/ano' },
  { value: '100k-500k', label: 'R$ 100 mil - R$ 500 mil/ano' },
  { value: '500k-1M', label: 'R$ 500 mil - R$ 1 milhão/ano' },
  { value: '1M-5M', label: 'R$ 1 milhão - R$ 5 milhões/ano' },
  { value: '5M-10M', label: 'R$ 5 milhões - R$ 10 milhões/ano' },
  { value: '10M-25M', label: 'R$ 10 milhões - R$ 25 milhões/ano' },
  { value: '25M-50M', label: 'R$ 25 milhões - R$ 50 milhões/ano' },
  { value: '50M-100M', label: 'R$ 50 milhões - R$ 100 milhões/ano' },
  { value: '100M+', label: 'Mais de R$ 100 milhões/ano' },
];

// Cargos/posições
export const COMPANY_POSITIONS = [
  { value: 'ceo', label: 'CEO/Presidente' },
  { value: 'founder', label: 'Fundador(a)' },
  { value: 'director', label: 'Diretor(a)' },
  { value: 'manager', label: 'Gerente' },
  { value: 'coordinator', label: 'Coordenador(a)' },
  { value: 'analyst', label: 'Analista' },
  { value: 'consultant', label: 'Consultor(a)' },
  { value: 'entrepreneur', label: 'Empreendedor(a)' },
  { value: 'freelancer', label: 'Freelancer/Autônomo' },
  { value: 'other', label: 'Outro' },
];

// Ferramentas de IA populares
export const AI_TOOLS = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'copilot', label: 'Microsoft Copilot' },
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'canva_ai', label: 'Canva AI' },
  { value: 'notion_ai', label: 'Notion AI' },
  { value: 'jasper', label: 'Jasper' },
  { value: 'copy_ai', label: 'Copy.ai' },
  { value: 'grammarly', label: 'Grammarly' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'none', label: 'Não uso nenhuma' },
  { value: 'other', label: 'Outra' },
];

// Áreas de impacto
export const IMPACT_AREAS = [
  { value: 'sales', label: 'Vendas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operações' },
  { value: 'customer_service', label: 'Atendimento ao Cliente' },
  { value: 'hr', label: 'Recursos Humanos' },
  { value: 'finance', label: 'Financeiro' },
  { value: 'production', label: 'Produção' },
  { value: 'logistics', label: 'Logística' },
  { value: 'innovation', label: 'Inovação e P&D' },
  { value: 'administration', label: 'Administração' },
];

// Resultados esperados em 90 dias
export const EXPECTED_RESULTS_90_DAYS = [
  { value: 'cost_reduction_10', label: 'Redução de custos de 10-20%' },
  { value: 'cost_reduction_20', label: 'Redução de custos de 20-30%' },
  { value: 'sales_increase_15', label: 'Aumento de vendas de 15-25%' },
  { value: 'sales_increase_25', label: 'Aumento de vendas de 25-40%' },
  { value: 'automation_processes', label: 'Automatizar 3-5 processos principais' },
  { value: 'time_saving_20', label: 'Economia de 20+ horas semanais' },
  { value: 'productivity_increase', label: 'Aumentar produtividade em 30%' },
  { value: 'new_revenue_streams', label: 'Criar novas fontes de receita' },
  { value: 'competitive_advantage', label: 'Obter vantagem competitiva' },
  { value: 'team_optimization', label: 'Otimizar performance da equipe' },
];

// Orçamentos para IA
export const AI_BUDGETS = [
  { value: '0-5k', label: 'Até R$ 5 mil' },
  { value: '5k-15k', label: 'R$ 5 mil - R$ 15 mil' },
  { value: '15k-30k', label: 'R$ 15 mil - R$ 30 mil' },
  { value: '30k-50k', label: 'R$ 30 mil - R$ 50 mil' },
  { value: '50k-100k', label: 'R$ 50 mil - R$ 100 mil' },
  { value: '100k-250k', label: 'R$ 100 mil - R$ 250 mil' },
  { value: '250k+', label: 'Mais de R$ 250 mil' },
];

// Tempo semanal de aprendizado
export const WEEKLY_LEARNING_TIME = [
  { value: '1-2h', label: '1-2 horas por semana' },
  { value: '3-5h', label: '3-5 horas por semana' },
  { value: '6-10h', label: '6-10 horas por semana' },
  { value: '10h+', label: 'Mais de 10 horas por semana' },
];

// Dias da semana para encontros
export const MEETING_DAYS = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

// Períodos do dia
export const TIME_PERIODS = [
  { value: 'morning', label: 'Manhã (8h-12h)' },
  { value: 'afternoon', label: 'Tarde (13h-17h)' },
  { value: 'evening', label: 'Noite (18h-22h)' },
];
