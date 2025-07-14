// Teste simulado do fluxo de onboarding com dados realistas

const testOnboardingData = {
  // STEP 1: Personal Info + Location
  personal_info: {
    name: "João Silva Santos",
    email: "joao.silva@empresa.com.br",
    phone: "+55 11 99999-8888",
    instagram: "@joaosilva",
    linkedin: "https://linkedin.com/in/joaosilva",
    birthDate: "1985-03-15",
    profilePicture: "",
    curiosity: "Sou apaixonado por tecnologia e sempre busco inovações para melhorar processos"
  },
  location_info: {
    state: "São Paulo",
    city: "São Paulo",
    country: "Brasil",
    timezone: "America/Sao_Paulo"
  },

  // STEP 2: Business Context
  business_info: {
    company_name: "TechSolutions Ltda",
    company_sector: "Tecnologia e Software",
    company_size: "51-200 funcionários",
    role_in_company: "CTO - Chief Technology Officer",
    experience_years: "10+ anos",
    team_size: "21-50 pessoas",
    annual_revenue: "R$ 5-10 milhões"
  },
  discovery_info: {
    how_found_us: "Indicação de um colega",
    main_interest: "Implementar IA para otimizar processos internos",
    specific_challenge: "Automatizar atendimento ao cliente e análise de dados"
  },

  // STEP 3: AI Experience
  ai_experience: {
    knowledge_level: "Intermediário - Já utilizei algumas ferramentas",
    current_ai_usage: "Uso esporadicamente para algumas tarefas",
    ai_tools_used: [
      "ChatGPT",
      "GitHub Copilot", 
      "Notion AI",
      "Canva AI",
      "Loom AI"
    ],
    biggest_challenge: "Integrar IA nos processos existentes sem disruption",
    main_expectation: "Aumentar produtividade da equipe e qualidade dos resultados",
    implementation_concerns: [
      "Segurança dos dados",
      "Treinamento da equipe"
    ]
  },

  // STEP 4: Goals
  goals_info: {
    mainObjective: "Aumentar produtividade e eficiência operacional",
    areaToImpact: "Tecnologia da Informação",
    expectedResult90Days: "Aumento de eficiência operacional",
    urgencyLevel: "Urgente (implementar em até 3 meses)",
    successMetric: "Aumento da produtividade",
    mainObstacle: "Resistência da equipe à mudança",
    preferredSupport: "Suporte completo (consultoria + implementação)",
    aiImplementationBudget: "R$ 25.000 - R$ 50.000"
  },

  // STEP 5: Personalization
  personalization: {
    communication_frequency: "Semanal",
    content_format: "Vídeos práticos e tutoriais",
    learning_pace: "Moderado - Prefiro aprender gradualmente",
    notification_types: [
      "Atualizações sobre IA",
      "Casos de sucesso",
      "Webinars e eventos"
    ],
    preferred_meeting_time: "Manhã (9h-12h)",
    follow_up_preference: "WhatsApp",
    additional_interests: [
      "Automação de processos",
      "Análise de dados",
      "Chatbots inteligentes"
    ]
  },

  // STEP 6: Finalization (automaticamente preenchido)
  completed_steps: [1, 2, 3, 4, 5, 6],
  current_step: 7,
  is_completed: true,
  status: "completed"
};

console.log("Dados de teste do onboarding:", JSON.stringify(testOnboardingData, null, 2));
console.log("\nTotal de campos mapeados:", 
  Object.keys(testOnboardingData.personal_info).length +
  Object.keys(testOnboardingData.location_info).length +
  Object.keys(testOnboardingData.business_info).length +
  Object.keys(testOnboardingData.discovery_info).length +
  Object.keys(testOnboardingData.ai_experience).length +
  Object.keys(testOnboardingData.goals_info).length +
  Object.keys(testOnboardingData.personalization).length +
  4 // campos de controle
);