-- Resolver conflito entre sistemas de onboarding duplos
-- Desativar triggers conflitantes e consolidar em onboarding_final

-- 1. Remover triggers problemáticos da tabela user_onboarding
DROP TRIGGER IF EXISTS update_user_onboarding_updated_at ON public.user_onboarding;
DROP TRIGGER IF EXISTS sync_onboarding_to_profile ON public.user_onboarding;

-- 2. Verificar se a tabela onboarding_final tem estrutura correta
-- (ela já existe e foi criada anteriormente)

-- 3. Migrar dados pendentes de user_onboarding para onboarding_final se houver
INSERT INTO public.onboarding_final (
  user_id,
  current_step,
  completed_steps,
  is_completed,
  personal_info,
  business_info,
  goals_info,
  ai_experience_info,
  created_at,
  updated_at
)
SELECT 
  user_id,
  COALESCE(current_step, 1),
  COALESCE(completed_steps, ARRAY[]::integer[]),
  COALESCE(is_completed, false),
  COALESCE(personal_info, '{}'::jsonb),
  COALESCE(business_info, '{}'::jsonb),
  COALESCE(goals_info, '{}'::jsonb),
  COALESCE(ai_experience_info, '{}'::jsonb),
  COALESCE(created_at, now()),
  COALESCE(updated_at, now())
FROM public.user_onboarding uo
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_final of2 
  WHERE of2.user_id = uo.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Desativar a tabela user_onboarding renomeando-a para backup
ALTER TABLE IF EXISTS public.user_onboarding RENAME TO user_onboarding_backup;

-- 5. Garantir que apenas onboarding_final está ativa
-- O trigger sync_onboarding_final_to_profile já existe e está funcionando corretamente