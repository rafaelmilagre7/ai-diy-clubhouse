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

-- Adicionar log da mudança
INSERT INTO audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'permission_update',
  'membro_club_networking_access',
  jsonb_build_object(
    'role', 'membro_club',
    'added_permissions', '["networking", "solutions", "learning", "tools", "benefits", "events", "community", "certificates"]',
    'reason', 'Fix networking access for membro_club users'
  ),
  'info'
);