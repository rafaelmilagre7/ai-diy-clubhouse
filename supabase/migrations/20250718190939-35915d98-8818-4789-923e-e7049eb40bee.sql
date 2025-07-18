-- CORREÇÃO DEFINITIVA: Eliminar recursão infinita e estabilizar sistema
-- ==============================================================================

-- FASE 1: REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS EM PROFILES
-- =============================================================

-- Remover todas as políticas existentes que causam recursão
DROP POLICY IF EXISTS "profiles_secure_unified_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_authenticated_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_update_own" ON public.profiles;
DROP POLICY IF EXISTS "secure_profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_insert" ON public.profiles;

-- FASE 2: CRIAR POLÍTICAS SIMPLES SEM RECURSÃO
-- ===========================================

-- Política básica para SELECT - sem função que cause recursão
CREATE POLICY "profiles_simple_select" ON public.profiles
  FOR SELECT 
  USING (
    -- Usuário pode ver próprio perfil
    auth.uid() = id 
    OR 
    -- Admins com email @viverdeia.ai podem ver todos
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email LIKE '%@viverdeia.ai'
    )
  );

-- Política para UPDATE
CREATE POLICY "profiles_simple_update" ON public.profiles
  FOR UPDATE 
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email LIKE '%@viverdeia.ai'
    )
  );

-- Política para INSERT
CREATE POLICY "profiles_simple_insert" ON public.profiles
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email LIKE '%@viverdeia.ai'
    )
  );

-- FASE 3: CORRIGIR FUNÇÃO is_user_admin DEFINITIVAMENTE
-- ====================================================

CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Verificação simples baseada apenas no JWT e auth.users
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  ) OR EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = check_user_id 
    AND email LIKE '%@viverdeia.ai'
  );
$$;

-- FASE 4: CRIAR FUNÇÃO is_user_admin SEM PARÂMETROS
-- ===============================================

CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_user_admin(auth.uid());
$$;

-- FASE 5: SIMPLIFICAR POLÍTICAS EM USER_ROLES
-- ==========================================

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "user_roles_admin_simple" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_management" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_access" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_restricted" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_authenticated_access" ON public.user_roles;

-- Criar política simples para user_roles
CREATE POLICY "user_roles_simple_admin" ON public.user_roles
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL AND (
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
      OR
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email LIKE '%@viverdeia.ai'
      )
    )
  );

-- FASE 6: VERIFICAR TABELAS CRÍTICAS
-- =================================

-- Verificar se ainda há políticas recursivas em learning_lessons
DROP POLICY IF EXISTS "learning_lessons_admin_access" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_published_access" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_unified_access" ON public.learning_lessons;

-- Política simples para learning_lessons
CREATE POLICY "learning_lessons_simple_access" ON public.learning_lessons
  FOR SELECT 
  USING (
    published = true 
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email LIKE '%@viverdeia.ai'
    )
  );

-- FASE 7: LOG DE CORREÇÃO
-- ======================

INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_recovery',
  'infinite_recursion_fix_definitive',
  jsonb_build_object(
    'message', 'CORREÇÃO DEFINITIVA: Recursão infinita eliminada',
    'policies_removed', 'profiles, user_roles, learning_lessons',
    'simple_policies_created', true,
    'admin_verification', 'email_based_and_jwt',
    'timestamp', now()
  ),
  auth.uid()
);

-- RESULTADO ESPERADO:
-- ✅ Recursão infinita completamente eliminada
-- ✅ Políticas RLS simples e funcionais
-- ✅ Sistema administrativo estável
-- ✅ Verificação de admin baseada em email e JWT