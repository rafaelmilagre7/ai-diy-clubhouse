-- Atualizar permissões do role membro_club para incluir networking
UPDATE user_roles 
SET permissions = jsonb_build_object(
  'solutions', true,
  'learning', true,
  'tools', true,
  'benefits', true,
  'networking', true,
  'events', true,
  'community', true,
  'certificates', true
)
WHERE name = 'membro_club';