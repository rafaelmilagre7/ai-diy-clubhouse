-- Adicionar permissão 'builder' para todos os roles
-- Garantir que todos os usuários tenham acesso à ferramenta Builder

-- Atualizar todos os roles existentes para incluir builder: true
UPDATE user_roles
SET permissions = jsonb_set(
  COALESCE(permissions, '{}'::jsonb),
  '{builder}',
  'true'::jsonb,
  true
)
WHERE permissions IS NULL OR NOT permissions ? 'builder';

-- Comentário explicativo
COMMENT ON COLUMN user_roles.permissions IS 
'Permissões do role em formato JSONB. Inclui: solutions, learning, tools, benefits, certificates, community, events, builder, networking, etc.';

-- Verificação (query de validação)
-- SELECT name, permissions->'builder' as has_builder FROM user_roles ORDER BY name;