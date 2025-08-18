-- Dar permissão de networking para o role membro_club
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
  ur.id as role_id,
  pd.id as permission_id
FROM public.user_roles ur
CROSS JOIN public.permission_definitions pd
WHERE ur.name = 'membro_club' 
AND pd.code = 'networking.access'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Dar também outras permissões básicas para membro_club
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
  ur.id as role_id,
  pd.id as permission_id
FROM public.user_roles ur
CROSS JOIN public.permission_definitions pd
WHERE ur.name = 'membro_club' 
AND pd.code IN ('community.access', 'events.access', 'certificates.access')
ON CONFLICT (role_id, permission_id) DO NOTHING;