-- Criar permissões específicas para funcionalidades de uso (roles personalizados)
-- Limpar permissões existentes e criar um sistema claro de funcionalidades

-- Primeiro, fazer backup das permissões existentes
INSERT INTO analytics_backups (table_name, backup_reason, record_count, backup_data, created_at)
SELECT 
  'permission_definitions' as table_name,
  'Reorganização para funcionalidades de uso vs gestão' as backup_reason,
  (SELECT COUNT(*) FROM permission_definitions) as record_count,
  jsonb_agg(to_jsonb(permission_definitions.*)) as backup_data,
  now() as created_at
FROM permission_definitions;

-- Limpar permissões antigas (manter apenas as essenciais de admin)
DELETE FROM role_permissions WHERE permission_id IN (
  SELECT id FROM permission_definitions 
  WHERE category NOT IN ('admin', 'system') 
  OR code NOT LIKE '%.manage' AND code NOT LIKE 'admin.%'
);

DELETE FROM permission_definitions 
WHERE category NOT IN ('admin', 'system') 
OR (code NOT LIKE '%.manage' AND code NOT LIKE 'admin.%' AND code != 'learning.access');

-- Inserir permissões de funcionalidades específicas para usuários
INSERT INTO permission_definitions (code, name, description, category, created_at) VALUES
-- Trilha com IA
('ai_trail.access', 'Acessar Trilha com IA', 'Permite acesso às trilhas de implementação com inteligência artificial', 'features', now()),

-- Soluções
('solutions.access', 'Acessar Soluções', 'Permite visualizar e acessar o catálogo de soluções', 'features', now()),

-- Learning (já existe, vamos manter)
-- ('learning.access', 'Acessar Formações', 'Permite acesso à área de formações e cursos', 'features', now()),

-- Certificados
('certificates.access', 'Acessar Certificados', 'Permite visualizar e gerar certificados de conclusão', 'features', now()),

-- Ferramentas
('tools.access', 'Acessar Ferramentas', 'Permite utilizar ferramentas e recursos da plataforma', 'features', now()),

-- Benefícios
('benefits.access', 'Acessar Benefícios', 'Permite visualizar e utilizar benefícios exclusivos do club', 'features', now()),

-- Networking
('networking.access', 'Acessar Networking', 'Permite participar de atividades de networking e conexões', 'features', now()),

-- Comunidade
('community.access', 'Acessar Comunidade', 'Permite participar dos fóruns e discussões da comunidade', 'features', now()),

-- Eventos
('events.access', 'Acessar Eventos', 'Permite visualizar e participar de eventos da plataforma', 'features', now()),

-- Sugestões
('suggestions.access', 'Enviar Sugestões', 'Permite enviar sugestões e feedbacks para melhoria da plataforma', 'features', now())

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = now();

-- Atualizar a permissão de learning se necessário
UPDATE permission_definitions 
SET 
  name = 'Acessar Formações',
  description = 'Permite acesso à área de formações e cursos (/learning)',
  category = 'features'
WHERE code = 'learning.access';

-- Criar algumas permissões administrativas essenciais (se não existirem)
INSERT INTO permission_definitions (code, name, description, category, created_at) VALUES
('admin.dashboard', 'Dashboard Administrativo', 'Acesso ao painel administrativo completo', 'admin', now()),
('users.manage', 'Gerenciar Usuários', 'Controle total sobre usuários, papéis e permissões', 'admin', now()),
('system.manage', 'Gerenciar Sistema', 'Configurações avançadas e manutenção do sistema', 'admin', now()),
('analytics.manage', 'Gerenciar Analytics', 'Acesso completo aos relatórios e análises da plataforma', 'admin', now()),
('content.manage', 'Gerenciar Conteúdo', 'Controle editorial sobre cursos, soluções e conteúdos', 'admin', now())

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- Garantir que o papel admin tenha todas as permissões
WITH admin_role AS (
  SELECT id FROM user_roles WHERE name = 'admin' LIMIT 1
),
all_permissions AS (
  SELECT id FROM permission_definitions
)
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT ar.id, ap.id, now()
FROM admin_role ar
CROSS JOIN all_permissions ap
ON CONFLICT (role_id, permission_id) DO NOTHING;