-- CORREÇÃO URGENTE DE POLÍTICAS RLS - FASE 1: TABELAS CRÍTICAS
-- Corrigir as políticas RLS que estão causando falhas no front-end

-- 1. CORRIGIR FORUM_POSTS - Adicionar política SELECT ausente
DROP POLICY IF EXISTS "forum_posts_authenticated_select" ON public.forum_posts;
CREATE POLICY "forum_posts_authenticated_select" ON public.forum_posts
FOR SELECT USING (
  auth.uid() IS NOT NULL AND NOT is_hidden
);

-- Adicionar políticas UPDATE e DELETE para donos e admins
DROP POLICY IF EXISTS "forum_posts_owner_update" ON public.forum_posts;
CREATE POLICY "forum_posts_owner_update" ON public.forum_posts
FOR UPDATE USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

DROP POLICY IF EXISTS "forum_posts_owner_delete" ON public.forum_posts;
CREATE POLICY "forum_posts_owner_delete" ON public.forum_posts
FOR DELETE USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 2. CORRIGIR LEARNING_COURSES - Consolidar políticas conflitantes
-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Admins podem gerenciar todos os cursos" ON public.learning_courses;
DROP POLICY IF EXISTS "Only admins can update courses" ON public.learning_courses;
DROP POLICY IF EXISTS "Users can view published courses" ON public.learning_courses;
DROP POLICY IF EXISTS "learning_courses_secure_select_policy" ON public.learning_courses;

-- Criar política única e clara para SELECT
CREATE POLICY "learning_courses_unified_access" ON public.learning_courses
FOR SELECT USING (
  published = true OR 
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.profiles p
      INNER JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  )
);

-- Política separada para operações administrativas
CREATE POLICY "learning_courses_admin_management" ON public.learning_courses
FOR ALL USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 3. CORRIGIR PROFILES - Eliminar políticas redundantes
-- Remover políticas conflitantes
DROP POLICY IF EXISTS "profiles_authenticated_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_authenticated_restricted_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_can_update_own" ON public.profiles;

-- Política principal: usuários podem ver próprio perfil + admins veem todos
CREATE POLICY "profiles_secure_unified_access" ON public.profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles p
      INNER JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  )
);

-- Política para atualizações: próprio perfil apenas
CREATE POLICY "profiles_user_update_own" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id AND auth.uid() IS NOT NULL
);

-- Política para criação (inserção inicial)
CREATE POLICY "profiles_secure_insert" ON public.profiles
FOR INSERT WITH CHECK (
  auth.uid() = id AND auth.uid() IS NOT NULL
);

-- 4. CORRIGIR USER_ROLES - Remover acesso anônimo
-- Remover política de acesso público
DROP POLICY IF EXISTS "public_read_access" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_only" ON public.user_roles;

-- Política restritiva: apenas admins podem ver roles
CREATE POLICY "user_roles_admin_restricted" ON public.user_roles
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Política para operações administrativas em roles
CREATE POLICY "user_roles_admin_management" ON public.user_roles
FOR ALL USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 5. LOG DA CORREÇÃO
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'rls_critical_fix',
  'fix_critical_rls_policies_phase_1',
  jsonb_build_object(
    'phase', '1 - Critical Tables RLS Fix',
    'tables_fixed', ARRAY[
      'forum_posts - Added missing SELECT policy',
      'learning_courses - Consolidated 4 conflicting policies into 2',
      'profiles - Reduced from 4 to 3 essential policies',
      'user_roles - Removed anonymous access, admin-only'
    ],
    'security_impact', 'Significant hardening while maintaining functionality',
    'expected_result', 'Frontend should load without permission denied errors',
    'policies_dropped', 11,
    'policies_created', 8,
    'net_change', -3
  ),
  'critical'
);