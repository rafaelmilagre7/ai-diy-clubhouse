-- Voltar usuário rafaelmilagre@hotmail.com para etapa 0 do onboarding
-- Para permitir reselecionar o tipo de usuário

UPDATE onboarding_final 
SET 
  user_type = NULL,
  current_step = 0,
  completed_steps = ARRAY[]::integer[],
  updated_at = now()
WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'rafaelmilagre@hotmail.com'
);

-- Log da alteração
INSERT INTO audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  (SELECT id FROM profiles WHERE email = 'rafaelmilagre@hotmail.com'),
  'onboarding_reset',
  'reset_user_type_step',
  jsonb_build_object(
    'reason', 'User requested to reselect user type',
    'reset_to_step', 0,
    'previous_user_type', 'entrepreneur'
  ),
  'info'
);