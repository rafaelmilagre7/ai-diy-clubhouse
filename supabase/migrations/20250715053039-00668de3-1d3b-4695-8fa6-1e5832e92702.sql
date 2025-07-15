-- Corrigir o último perfil órfão identificado
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
  u.id,
  u.email,
  i.role_id,
  COALESCE(
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1)
  ) as name,
  u.created_at,
  now(),
  false
FROM auth.users u
LEFT JOIN public.invites i ON i.token = u.raw_user_meta_data->>'invite_token'
WHERE u.id = '24eb5a5b-01ca-46ec-8979-8132324fc8b6'
AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;