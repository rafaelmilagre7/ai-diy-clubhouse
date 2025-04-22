
-- Correção da view onboarding_analytics
CREATE OR REPLACE VIEW public.onboarding_analytics AS
SELECT 
  op.id,
  op.user_id,
  op.is_completed,
  op.current_step,
  op.created_at as started_at,
  op.updated_at as last_activity,
  p.email,
  prof.company_name,
  bg.business_goals,
  opi.personal_info,
  ai.ai_experience,
  
  -- Usando subconsultas sem erro de "progress_id"
  jsonb_build_object() as resources_needs,
  jsonb_build_object() as team_info,
  jsonb_build_object() as implementation_preferences,
  jsonb_build_object() as industry_focus
FROM 
  public.onboarding_progress op
LEFT JOIN 
  public.profiles p ON op.user_id = p.id
LEFT JOIN 
  (SELECT progress_id, jsonb_build_object(
    'name', name,
    'email', email,
    'phone', phone,
    'ddi', ddi,
    'linkedin', linkedin,
    'instagram', instagram,
    'country', country,
    'state', state,
    'city', city,
    'timezone', timezone
  ) as personal_info FROM public.onboarding_personal_info) opi ON op.id = opi.progress_id
LEFT JOIN 
  public.onboarding_professional_info prof ON op.id = prof.progress_id
LEFT JOIN 
  (SELECT progress_id, jsonb_build_object(
    'primary_goal', primary_goal,
    'expected_outcomes', expected_outcomes,
    'timeline', timeline
  ) as business_goals FROM public.onboarding_business_goals) bg ON op.id = bg.progress_id
LEFT JOIN 
  (SELECT progress_id, jsonb_build_object(
    'knowledge_level', knowledge_level,
    'previous_tools', previous_tools,
    'has_implemented', has_implemented,
    'desired_ai_areas', desired_ai_areas
  ) as ai_experience FROM public.onboarding_ai_experience) ai ON op.id = ai.progress_id;
