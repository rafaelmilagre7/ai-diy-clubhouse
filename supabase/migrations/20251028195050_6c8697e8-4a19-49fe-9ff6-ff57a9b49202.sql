-- ETAPA 1: EMERGÊNCIA - Desabilitar múltiplos triggers e criar 80 perfis

-- 1. Desabilitar triggers problemáticos temporariamente
ALTER TABLE profiles DISABLE TRIGGER create_notification_preferences_on_profile_creation;
ALTER TABLE profiles DISABLE TRIGGER trigger_sync_is_master_user_insert;
ALTER TABLE profiles DISABLE TRIGGER trigger_sync_is_master_user_update;

-- 2. Criar perfis para usuários órfãos
INSERT INTO profiles (
  id, 
  email, 
  name, 
  role, 
  role_id, 
  onboarding_completed, 
  is_master_user, 
  created_at, 
  updated_at,
  referrals_count,
  successful_referrals_count
)
SELECT
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'display_name',
    split_part(au.email, '@', 1)
  ) as name,
  'membro_club' as role,
  '91e3c1b0-ad08-4a58-82b5-59a762bc4719'::uuid as role_id,
  false as onboarding_completed,
  true as is_master_user,
  NOW() as created_at,
  NOW() as updated_at,
  0 as referrals_count,
  0 as successful_referrals_count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Reabilitar triggers
ALTER TABLE profiles ENABLE TRIGGER create_notification_preferences_on_profile_creation;
ALTER TABLE profiles ENABLE TRIGGER trigger_sync_is_master_user_insert;
ALTER TABLE profiles ENABLE TRIGGER trigger_sync_is_master_user_update;