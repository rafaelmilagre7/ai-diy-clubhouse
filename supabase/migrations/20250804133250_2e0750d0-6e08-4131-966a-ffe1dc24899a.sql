-- Atualizar usuários com role_id NULL para membro_club
-- ID do role membro_club: 91e3c1b0-ad08-4a58-82b5-59a762bc4719

UPDATE profiles 
SET 
  role_id = '91e3c1b0-ad08-4a58-82b5-59a762bc4719',
  updated_at = NOW()
WHERE role_id IS NULL;

-- Registrar logs de auditoria para cada usuário atualizado
INSERT INTO audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) 
SELECT 
  id as user_id,
  'role_assignment',
  'admin_null_role_fix',
  jsonb_build_object(
    'old_role_id', null,
    'new_role_id', '91e3c1b0-ad08-4a58-82b5-59a762bc4719',
    'new_role_name', 'membro_club',
    'reason', 'fixing_null_roles_security_issue',
    'affected_users', 3,
    'fixed_by_admin', true,
    'timestamp', NOW()
  ),
  'info'
FROM profiles 
WHERE role_id IS NULL;