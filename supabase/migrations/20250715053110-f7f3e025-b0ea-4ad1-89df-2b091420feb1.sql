-- Corrigir perfil órfão com role_id válido
WITH invite_data AS (
  SELECT 
    u.id as user_id,
    u.email,
    u.created_at,
    COALESCE(i.role_id, (SELECT id FROM public.user_roles WHERE name = 'membro_club' LIMIT 1)) as target_role_id,
    COALESCE(
      u.raw_user_meta_data->>'name',
      u.raw_user_meta_data->>'full_name',
      split_part(u.email, '@', 1)
    ) as user_name
  FROM auth.users u
  LEFT JOIN public.invites i ON i.token = u.raw_user_meta_data->>'invite_token'
  WHERE u.id = '24eb5a5b-01ca-46ec-8979-8132324fc8b6'
)
INSERT INTO public.profiles (
  id,
  email,
  role_id,
  name,
  created_at,
  updated_at,
  onboarding_completed
)
SELECT 
  user_id,
  email,
  target_role_id,
  user_name,
  created_at,
  now(),
  false
FROM invite_data
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = invite_data.user_id);