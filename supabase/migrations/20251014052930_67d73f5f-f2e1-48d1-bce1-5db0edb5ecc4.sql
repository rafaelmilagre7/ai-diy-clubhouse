-- Migração em massa: onboarding_final → networking_profiles_v2
-- Migra todos os usuários que completaram onboarding mas ainda não têm perfil v2

INSERT INTO networking_profiles_v2 (
  user_id,
  value_proposition,
  looking_for,
  main_challenge,
  keywords,
  ai_persona,
  networking_score,
  profile_completed_at,
  created_at,
  last_updated_at
)
SELECT 
  of.user_id,
  
  -- VALUE PROPOSITION: Combinar objetivos principais
  COALESCE(
    NULLIF(TRIM(CONCAT_WS(' • ', 
      of.goals_info->>'main_objective',
      of.goals_info->>'area_to_impact',
      of.goals_info->>'expected_result_90_days'
    )), ''),
    'Desenvolvimento de negócios estratégicos'
  ) as value_proposition,
  
  -- LOOKING FOR: Derivar de preferências e setor
  ARRAY[
    COALESCE('Conexões em ' || (of.business_info->>'business_sector'), 'Networking B2B'),
    'Oportunidades de negócio',
    'Parcerias estratégicas'
  ]::text[] as looking_for,
  
  -- MAIN CHALLENGE: Usar desafio de IA ou obstáculo principal
  COALESCE(
    NULLIF(TRIM(of.ai_experience->>'ai_main_challenge'), ''),
    NULLIF(TRIM(of.goals_info->>'main_obstacle'), ''),
    'Expansão de rede de contatos estratégicos'
  ) as main_challenge,
  
  -- KEYWORDS: Derivar de nível de IA, urgência e preferências
  ARRAY[
    CASE 
      WHEN of.ai_experience->>'ai_knowledge_level' = 'iniciante' THEN 'Inovador'
      WHEN of.ai_experience->>'ai_knowledge_level' = 'basico' THEN 'Colaborativo'
      WHEN of.ai_experience->>'ai_knowledge_level' = 'intermediario' THEN 'Estratégico'
      WHEN of.ai_experience->>'ai_knowledge_level' = 'avancado' THEN 'Visionário'
      WHEN of.ai_experience->>'ai_knowledge_level' = 'expert' THEN 'Data-Driven'
      ELSE 'Estratégico'
    END,
    CASE 
      WHEN of.goals_info->>'urgency_level' = 'low' THEN 'Organizado'
      WHEN of.goals_info->>'urgency_level' = 'medium' THEN 'Eficiente'
      WHEN of.goals_info->>'urgency_level' = 'high' THEN 'Orientado a Resultados'
      WHEN of.goals_info->>'urgency_level' = 'critical' THEN 'Resiliente'
      ELSE 'Eficiente'
    END,
    CASE 
      WHEN of.personalization->>'content_preference' = 'video' THEN 'Criativo'
      WHEN of.personalization->>'content_preference' = 'text' THEN 'Analítico'
      WHEN of.personalization->>'content_preference' = 'interactive' THEN 'Adaptável'
      WHEN of.personalization->>'content_preference' = 'practical' THEN 'Prático'
      ELSE 'Adaptável'
    END
  ]::text[] as keywords,
  
  -- AI PERSONA: Fallback estruturado baseado nos dados do onboarding
  jsonb_build_object(
    'business_type', COALESCE(of.business_info->>'business_sector', 'Geral'),
    'target_audience', COALESCE(of.goals_info->>'area_to_impact', 'Profissionais e Empreendedores'),
    'value_keywords', ARRAY[
      COALESCE(of.business_info->>'business_sector', 'networking'),
      'negócios',
      'parcerias'
    ],
    'networking_style', 'Profissional',
    'ideal_matches', ARRAY['Empreendedores', 'Gestores', 'Profissionais'],
    'networking_score', 75,
    'profile_quality', 'medium',
    'recommendations', ARRAY['Perfil migrado automaticamente do onboarding']
  ) as ai_persona,
  
  75 as networking_score,
  NOW() as profile_completed_at,
  NOW() as created_at,
  NOW() as last_updated_at

FROM onboarding_final of
INNER JOIN profiles p ON p.id = of.user_id
WHERE 
  -- Apenas quem completou onboarding
  p.onboarding_completed = true
  
  -- E ainda não tem perfil v2
  AND of.user_id NOT IN (
    SELECT user_id FROM networking_profiles_v2
  )
  
  -- Garantir que tem dados mínimos
  AND of.goals_info IS NOT NULL
  AND of.business_info IS NOT NULL;

-- Log do resultado
DO $$ 
DECLARE
  inserted_count INTEGER;
BEGIN
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RAISE NOTICE '✅ Migrados % perfis para networking_profiles_v2', inserted_count;
END $$;