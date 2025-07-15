-- CORREÇÃO FINAL COMPLETA DO FLUXO DE CONVITES
-- Esta migração resolve todos os problemas identificados

-- 1. Limpar função duplicada - manter apenas a versão mais recente
DROP FUNCTION IF EXISTS public.initialize_onboarding_for_user(uuid);

-- 2. Recriar trigger principal que estava faltando
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_onboarding();

-- 3. Limpar políticas RLS conflitantes na tabela profiles
DROP POLICY IF EXISTS "Users can view their profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles view policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;

-- Criar políticas RLS limpas e eficientes
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    is_user_admin(auth.uid())
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (
    id = auth.uid() AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (
    id = auth.uid() OR 
    is_user_admin(auth.uid())
  );

-- 4. Corrigir usuário órfão específico
WITH user_data AS (
  SELECT 
    u.id as user_id,
    u.email,
    u.raw_user_meta_data,
    i.role_id,
    i.whatsapp_number,
    i.notes
  FROM auth.users u
  LEFT JOIN public.invites i ON i.token = u.raw_user_meta_data->>'invite_token'
  WHERE u.email = 'yasmin-altoe@tuamaeaquelaursa.com'
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
  COALESCE(role_id, (SELECT id FROM public.user_roles WHERE name = 'membro' LIMIT 1)) as role_id,
  COALESCE(
    raw_user_meta_data->>'name',
    raw_user_meta_data->>'full_name',
    split_part(email, '@', 1)
  ) as name,
  now(),
  now(),
  false
FROM user_data
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_data.user_id)
ON CONFLICT (id) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  name = COALESCE(EXCLUDED.name, profiles.name),
  updated_at = now();

-- 5. Inicializar onboarding para usuário órfão
WITH user_data AS (
  SELECT 
    u.id as user_id,
    u.email,
    u.raw_user_meta_data,
    i.whatsapp_number,
    i.notes
  FROM auth.users u
  LEFT JOIN public.invites i ON i.token = u.raw_user_meta_data->>'invite_token'
  WHERE u.email = 'yasmin-altoe@tuamaeaquelaursa.com'
)
INSERT INTO public.onboarding_final (
  user_id,
  current_step,
  completed_steps,
  is_completed,
  personal_info,
  business_info,
  ai_experience,
  goals_info,
  personalization,
  status,
  created_at,
  updated_at
)
SELECT 
  user_id,
  1,
  ARRAY[]::integer[],
  false,
  jsonb_build_object(
    'name', COALESCE(
      raw_user_meta_data->>'name',
      raw_user_meta_data->>'full_name',
      split_part(email, '@', 1)
    ),
    'email', email
  ) || CASE 
    WHEN whatsapp_number IS NOT NULL THEN 
      jsonb_build_object('phone', whatsapp_number, 'phone_from_invite', true)
    ELSE '{}'::jsonb
  END,
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  'in_progress',
  now(),
  now()
FROM user_data
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_final 
  WHERE onboarding_final.user_id = user_data.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- 6. Relatório final de validação
WITH validation_report AS (
  SELECT 
    'Total de usuários' as metric,
    COUNT(*) as count
  FROM auth.users
  
  UNION ALL
  
  SELECT 
    'Usuários com perfil' as metric,
    COUNT(*) as count
  FROM public.profiles
  
  UNION ALL
  
  SELECT 
    'Usuários com onboarding' as metric,
    COUNT(*) as count
  FROM public.onboarding_final
  
  UNION ALL
  
  SELECT 
    'Usuários órfãos (sem perfil)' as metric,
    COUNT(*) as count
  FROM auth.users u
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
  
  UNION ALL
  
  SELECT 
    'Usuários sem onboarding' as metric,
    COUNT(*) as count
  FROM public.profiles p
  WHERE NOT EXISTS (SELECT 1 FROM public.onboarding_final o WHERE o.user_id = p.id)
  
  UNION ALL
  
  SELECT 
    'Convites ativos' as metric,
    COUNT(*) as count
  FROM public.invites
  WHERE expires_at > now() AND used_at IS NULL
  
  UNION ALL
  
  SELECT 
    'Trigger on_auth_user_created ativo' as metric,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created' 
      AND event_object_table = 'users'
      AND event_object_schema = 'auth'
    ) THEN 1 ELSE 0 END as count
)
SELECT 
  metric,
  count,
  CASE 
    WHEN metric = 'Total de usuários' THEN '👥'
    WHEN metric = 'Usuários com perfil' THEN '📋'
    WHEN metric = 'Usuários com onboarding' THEN '🎯'
    WHEN metric = 'Usuários órfãos (sem perfil)' THEN CASE WHEN count = 0 THEN '✅' ELSE '🔴' END
    WHEN metric = 'Usuários sem onboarding' THEN CASE WHEN count = 0 THEN '✅' ELSE '⚠️' END
    WHEN metric = 'Convites ativos' THEN '📧'
    WHEN metric = 'Trigger on_auth_user_created ativo' THEN CASE WHEN count = 1 THEN '✅' ELSE '🔴' END
  END as status
FROM validation_report
ORDER BY 
  CASE metric
    WHEN 'Total de usuários' THEN 1
    WHEN 'Usuários com perfil' THEN 2
    WHEN 'Usuários com onboarding' THEN 3
    WHEN 'Usuários órfãos (sem perfil)' THEN 4
    WHEN 'Usuários sem onboarding' THEN 5
    WHEN 'Convites ativos' THEN 6
    WHEN 'Trigger on_auth_user_created ativo' THEN 7
  END;