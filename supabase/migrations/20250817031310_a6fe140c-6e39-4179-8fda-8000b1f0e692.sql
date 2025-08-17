-- Criar nova role "convidado" com os mesmos direitos de "membro_club"
INSERT INTO public.user_roles (
  id,
  name, 
  description,
  permissions,
  is_system,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'convidado',
  'Convidado do Viver de IA Club - acesso às soluções para implementação empresarial',
  '{}',
  false,
  now(),
  now()
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  updated_at = now();