-- Inicializa registro de onboarding para o usuário impactado, se ainda não existir
INSERT INTO public.onboarding_final (
  user_id,
  current_step,
  is_completed,
  completed_steps,
  created_at,
  updated_at,
  status
)
SELECT 
  '14e45bf3-b535-4781-ae6e-60c99f27b8ed'::uuid,
  0,
  false,
  ARRAY[]::int[],
  now(),
  now(),
  'in_progress'
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_final WHERE user_id = '14e45bf3-b535-4781-ae6e-60c99f27b8ed'::uuid
);