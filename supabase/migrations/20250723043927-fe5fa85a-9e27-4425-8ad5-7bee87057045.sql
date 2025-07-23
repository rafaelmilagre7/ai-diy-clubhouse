-- CORREÇÃO CRÍTICA: Sincronizar estado do onboarding
-- Resetar onboarding_completed em profiles baseado no estado real do onboarding_final

UPDATE public.profiles 
SET 
  onboarding_completed = CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.onboarding_final onb 
      WHERE onb.user_id = profiles.id 
      AND onb.is_completed = true 
      AND onb.status = 'completed'
    ) THEN true
    ELSE false
  END,
  onboarding_completed_at = CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.onboarding_final onb 
      WHERE onb.user_id = profiles.id 
      AND onb.is_completed = true 
      AND onb.status = 'completed'
    ) THEN (
      SELECT onb.completed_at FROM public.onboarding_final onb 
      WHERE onb.user_id = profiles.id 
      AND onb.is_completed = true 
      LIMIT 1
    )
    ELSE null
  END,
  updated_at = now()
WHERE id IN (
  SELECT user_id FROM public.onboarding_final
);

-- Log da correção
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'data_correction',
  'fix_onboarding_inconsistency',
  jsonb_build_object(
    'message', 'Corrigida inconsistência massiva de onboarding',
    'affected_profiles', (SELECT COUNT(*) FROM public.profiles),
    'corrected_at', now()
  ),
  'high'
);