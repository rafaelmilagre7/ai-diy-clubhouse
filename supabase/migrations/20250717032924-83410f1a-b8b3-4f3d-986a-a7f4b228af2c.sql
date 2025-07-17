-- Corrigir onboarding do Diego Malta
-- Reset para Step 1 e limpar dados problemáticos

UPDATE public.onboarding_final
SET 
  current_step = 1,
  completed_steps = ARRAY[]::integer[],
  ai_experience = '{}'::jsonb,
  status = 'in_progress',
  updated_at = now()
WHERE user_id = 'b837c23e-e064-4eb8-8648-f1298d4cbe75';

-- Atualizar perfil para garantir consistência
UPDATE public.profiles
SET 
  onboarding_completed = false,
  onboarding_completed_at = NULL,
  updated_at = now()
WHERE id = 'b837c23e-e064-4eb8-8648-f1298d4cbe75';

-- Log da correção
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  'b837c23e-e064-4eb8-8648-f1298d4cbe75',
  'onboarding_fix',
  'reset_stuck_onboarding',
  jsonb_build_object(
    'reason', 'User stuck on step 3',
    'previous_step', 3,
    'reset_to_step', 1,
    'fixed_by', 'admin_correction',
    'timestamp', now()
  )
);