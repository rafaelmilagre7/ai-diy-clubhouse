-- Criar registro de onboarding para o usuário problema que não possui um
-- Este usuário tem onboarding_completed = false mas não tem registro na tabela onboarding_final

INSERT INTO onboarding_final (
  user_id,
  current_step,
  is_completed,
  user_type,
  data,
  completed_steps,
  created_at,
  updated_at
) VALUES (
  '14e45bf3-b535-4781-ae6e-60c99f27b8ed', -- ID do usuário problema
  0, -- Step inicial
  false, -- Não completado
  null, -- User type ainda não definido
  '{}', -- Dados vazios iniciais
  '[]', -- Nenhum step completado ainda
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING; -- Evitar duplicatas se já existir