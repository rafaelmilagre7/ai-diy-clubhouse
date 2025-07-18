-- =============================================
-- FASE 1: CORREÇÃO CRÍTICA DO SISTEMA DE AUTENTICAÇÃO
-- =============================================

-- 1. CORRIGIR SECURITY DEFINER VIEWS CRÍTICOS
-- Primeiro, identificar e corrigir as 2 views problemáticas

-- Dropar e recriar views problemáticas (se existirem)
DROP VIEW IF EXISTS admin_analytics_overview CASCADE;

-- Recriar view de analytics de forma segura
CREATE VIEW admin_analytics_overview 
WITH (security_invoker=true)
AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(*) FROM learning_lessons WHERE published = true) as total_lessons,
  (SELECT COUNT(*) FROM solutions) as total_solutions,
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM profiles WHERE onboarding_completed = true) as completed_onboarding,
  CASE 
    WHEN (SELECT COUNT(*) FROM profiles) > 0 
    THEN (SELECT COUNT(*) FROM profiles WHERE onboarding_completed = true)::numeric / (SELECT COUNT(*) FROM profiles)::numeric * 100
    ELSE 0
  END as completion_rate,
  CASE 
    WHEN (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days') > 0
    THEN (
      (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days')::numeric - 
      (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days')::numeric
    ) / (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days')::numeric * 100
    ELSE 0
  END as growth_rate,
  (SELECT COUNT(*) FROM solutions WHERE created_at >= NOW() - INTERVAL '30 days') as new_solutions_30d,
  (SELECT COUNT(DISTINCT user_id) FROM learning_progress WHERE updated_at >= NOW() - INTERVAL '7 days') as active_learners;

-- 2. CORRIGIR FUNÇÃO is_user_admin PARA ELIMINAR RECURSÃO
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  -- NOVA IMPLEMENTAÇÃO: Usar user_metadata do JWT sem acessar tabela profiles
  -- Isso evita completamente a recursão infinita nas políticas RLS
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  )
  -- Verificação de segurança: apenas para o usuário autenticado atual
  WHERE user_id = auth.uid();
$$;

-- 3. GARANTIR PERFIS PARA TODOS OS USUÁRIOS EXISTENTES
-- Executar função de criação de perfis faltantes
SELECT public.create_missing_profile_safe(id) 
FROM auth.users 
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = users.id
);

-- 4. LIMPAR POLÍTICAS RLS MAIS RESTRITIVAS E SEGURAS
-- Remover políticas que permitem acesso anônimo desnecessário na tabela profiles
DROP POLICY IF EXISTS "profiles_authenticated_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_authenticated_select" ON public.profiles;

-- Criar política mais restritiva para profiles
CREATE POLICY "profiles_secure_access" ON public.profiles
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id 
      OR 
      public.is_user_admin(auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id 
      OR 
      public.is_user_admin(auth.uid())
    )
  );

-- 5. GARANTIR ROLE_ID PARA USUÁRIOS SEM ROLE
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name IN ('membro_club', 'member', 'membro') 
  ORDER BY name 
  LIMIT 1
)
WHERE role_id IS NULL 
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.id = profiles.role_id
);

-- 6. LOG DA CORREÇÃO
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system_maintenance',
  'auth_system_critical_fix_phase1',
  jsonb_build_object(
    'timestamp', NOW(),
    'actions', ARRAY[
      'fixed_security_definer_views',
      'corrected_is_user_admin_function', 
      'ensured_all_user_profiles',
      'tightened_rls_policies',
      'guaranteed_role_assignments'
    ],
    'phase', 1
  )
);

-- Verificar resultado
SELECT 
  'Usuários sem perfil' as status,
  COUNT(*) as count
FROM auth.users 
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = users.id
)
UNION ALL
SELECT 
  'Perfis sem role_id' as status,
  COUNT(*) as count  
FROM public.profiles
WHERE role_id IS NULL;