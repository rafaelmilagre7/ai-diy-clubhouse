-- Limpar dados antigos que podem ter "Nenhuma ainda"
UPDATE onboarding_final 
SET ai_experience = jsonb_set(
  COALESCE(ai_experience, '{}'),
  '{current_tools}',
  '[]'::jsonb
)
WHERE ai_experience->>'current_tools' IS NULL
   OR ai_experience->'current_tools' @> '["Nenhuma ainda"]';