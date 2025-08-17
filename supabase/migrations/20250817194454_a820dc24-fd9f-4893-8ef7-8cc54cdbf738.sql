-- Unificar permissões de learning em uma única permissão
-- Remover permissões duplicadas e criar uma única permissão de acesso ao learning

-- Primeiro, vamos ver o que temos
-- DELETE FROM permission_definitions WHERE code IN ('formacao.view', 'courses.club_access');

-- Inserir ou atualizar para uma única permissão de learning
INSERT INTO permission_definitions (
  code, 
  name, 
  description, 
  category,
  created_at
) VALUES (
  'learning.access',
  'Acessar Learning',
  'Permite acesso à área de aprendizado (/learning). O controle específico de quais cursos o usuário pode ver é definido no gerenciamento de acesso a cursos por papel.',
  'learning',
  now()
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- Migrar as permissões existentes para a nova permissão unificada
-- Se um papel tinha qualquer uma das permissões antigas, ele recebe a nova
WITH roles_with_learning_permissions AS (
  SELECT DISTINCT rp.role_id
  FROM role_permissions rp
  JOIN permission_definitions pd ON rp.permission_id = pd.id
  WHERE pd.code IN ('formacao.view', 'courses.club_access', 'learning.view', 'learning.access')
),
new_permission AS (
  SELECT id FROM permission_definitions WHERE code = 'learning.access'
)
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT rwlp.role_id, np.id, now()
FROM roles_with_learning_permissions rwlp
CROSS JOIN new_permission np
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Remover as permissões antigas duplicadas
DELETE FROM role_permissions 
WHERE permission_id IN (
  SELECT id FROM permission_definitions 
  WHERE code IN ('formacao.view', 'courses.club_access', 'learning.view') 
  AND code != 'learning.access'
);

-- Remover as definições de permissões antigas
DELETE FROM permission_definitions 
WHERE code IN ('formacao.view', 'courses.club_access', 'learning.view') 
AND code != 'learning.access';