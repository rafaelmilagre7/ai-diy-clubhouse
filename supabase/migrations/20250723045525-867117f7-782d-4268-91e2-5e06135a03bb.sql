-- Reset do status de onboarding para permitir que usuários existentes passem pelo novo processo
-- Isso vai permitir testar o sistema de onboarding com usuários reais

-- Resetar status na tabela profiles
UPDATE public.profiles 
SET 
  onboarding_completed = false,
  onboarding_completed_at = null,
  updated_at = now()
WHERE onboarding_completed = true;

-- Resetar status na tabela onboarding_final para usuários que foram marcados como completos automaticamente
UPDATE public.onboarding_final 
SET 
  is_completed = false,
  status = 'in_progress',
  current_step = 1,
  completed_steps = ARRAY[]::integer[],
  completed_at = null,
  updated_at = now()
WHERE is_completed = true;

-- Log da operação
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'system_reset',
  'reset_onboarding_status',
  jsonb_build_object(
    'message', 'Reset do status de onboarding para permitir teste do novo sistema',
    'reset_at', now(),
    'reason', 'Permitir que usuários existentes testem o novo fluxo de onboarding'
  ),
  'info'
);