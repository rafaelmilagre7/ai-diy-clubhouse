
-- Criar role lovable_e_formacao combinando permissões de formação e lovable course
INSERT INTO user_roles (
  id,
  name, 
  description,
  permissions,
  is_system,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'lovable_e_formacao',
  'Acesso completo aos cursos Lovable e Formação Viver de IA - inclui cursos, ferramentas, comunidade e certificados',
  jsonb_build_object(
    'formacao', true,
    'learning', true,
    'tools', true,
    'community', true,
    'certificates', true,
    'lovable_course', true
  ),
  false,
  now(),
  now()
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  updated_at = now();
