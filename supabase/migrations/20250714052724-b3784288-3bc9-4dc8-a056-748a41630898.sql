-- Teste com um user_id válido existente
INSERT INTO public.onboarding_final (
  user_id,
  personal_info,
  location_info,
  discovery_info,
  business_info,
  business_context,
  goals_info,
  ai_experience,
  personalization,
  current_step,
  completed_steps,
  is_completed,
  completed_at,
  created_at,
  updated_at
) VALUES (
  '78cde3c9-3ee1-45ee-8dae-30f4689668b7', -- Rafael Milagre (usuário existente)
  -- Personal Info (Step 1) - 8 campos
  jsonb_build_object(
    'name', 'João Silva Santos',
    'email', 'joao.silva@empresa.com.br',
    'phone', '+55 11 99999-8888',
    'instagram', '@joaosilva',
    'linkedin', 'https://linkedin.com/in/joaosilva',
    'birthDate', '1985-03-15',
    'profilePicture', '',
    'curiosity', 'Sou apaixonado por tecnologia e sempre busco inovações para melhorar processos'
  ),
  -- Location Info (Step 1) - 4 campos
  jsonb_build_object(
    'state', 'São Paulo',
    'city', 'São Paulo',
    'country', 'Brasil',
    'timezone', 'America/Sao_Paulo'
  ),
  -- Discovery Info (Step 2) - 3 campos
  jsonb_build_object(
    'how_found_us', 'Indicação de um colega',
    'main_interest', 'Implementar IA para otimizar processos internos',
    'specific_challenge', 'Automatizar atendimento ao cliente e análise de dados'
  ),
  -- Business Info (Step 2) - 7 campos
  jsonb_build_object(
    'company_name', 'TechSolutions Ltda',
    'company_sector', 'Tecnologia e Software',
    'company_size', '51-200 funcionários',
    'role_in_company', 'CTO - Chief Technology Officer',
    'experience_years', '10+ anos',
    'team_size', '21-50 pessoas',
    'annual_revenue', 'R$ 5-10 milhões'
  ),
  -- Business Context (adicional) - 2 campos
  jsonb_build_object(
    'industry_challenges', 'Competição acirrada no mercado de tech',
    'growth_stage', 'Expansion'
  ),
  -- Goals Info (Step 4) - 8 campos
  jsonb_build_object(
    'mainObjective', 'Aumentar produtividade e eficiência operacional',
    'areaToImpact', 'Tecnologia da Informação',
    'expectedResult90Days', 'Aumento de eficiência operacional',
    'urgencyLevel', 'Urgente (implementar em até 3 meses)',
    'successMetric', 'Aumento da produtividade',
    'mainObstacle', 'Resistência da equipe à mudança',
    'preferredSupport', 'Suporte completo (consultoria + implementação)',
    'aiImplementationBudget', 'R$ 25.000 - R$ 50.000'
  ),
  -- AI Experience (Step 3) - 6 campos
  jsonb_build_object(
    'knowledge_level', 'Intermediário - Já utilizei algumas ferramentas',
    'current_ai_usage', 'Uso esporadicamente para algumas tarefas',
    'ai_tools_used', jsonb_build_array('ChatGPT', 'GitHub Copilot', 'Notion AI', 'Canva AI', 'Loom AI'),
    'biggest_challenge', 'Integrar IA nos processos existentes sem disruption',
    'main_expectation', 'Aumentar produtividade da equipe e qualidade dos resultados',
    'implementation_concerns', jsonb_build_array('Segurança dos dados', 'Treinamento da equipe')
  ),
  -- Personalization (Step 5) - 7 campos
  jsonb_build_object(
    'communication_frequency', 'Semanal',
    'content_format', 'Vídeos práticos e tutoriais',
    'learning_pace', 'Moderado - Prefiro aprender gradualmente',
    'notification_types', jsonb_build_array('Atualizações sobre IA', 'Casos de sucesso', 'Webinars e eventos'),
    'preferred_meeting_time', 'Manhã (9h-12h)',
    'follow_up_preference', 'WhatsApp',
    'additional_interests', jsonb_build_array('Automação de processos', 'Análise de dados', 'Chatbots inteligentes')
  ),
  7, -- current_step (completo)
  ARRAY[1,2,3,4,5,6], -- completed_steps
  true, -- is_completed
  now(), -- completed_at
  now(), -- created_at
  now()  -- updated_at
);