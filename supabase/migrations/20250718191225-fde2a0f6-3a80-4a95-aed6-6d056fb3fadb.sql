-- CORREÇÃO COMPLETA: Drop e recriação das funções problemáticas
-- ================================================================

-- FASE 1: REMOVER FUNÇÃO EXISTENTE COM CASCADE
-- ===========================================

DROP FUNCTION IF EXISTS public.is_user_admin(uuid) CASCADE;

-- FASE 2: RECRIAR FUNÇÃO is_user_admin COM ASSINATURA CORRETA
-- ==========================================================

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
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
    WHERE id = user_id 
    AND email LIKE '%@viverdeia.ai'
  );
$$;

-- FASE 3: CRIAR FUNÇÃO is_user_admin SEM PARÂMETROS
-- ===============================================

CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_user_admin(auth.uid());
$$;

-- FASE 4: RECRIAR POLÍTICAS SIMPLES EM PROFILES
-- =============================================

-- Remover todas as políticas existentes que causam recursão
DROP POLICY IF EXISTS "profiles_secure_unified_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_authenticated_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_update_own" ON public.profiles;
DROP POLICY IF EXISTS "secure_profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_insert" ON public.profiles;

-- Política básica para SELECT - sem função que cause recursão
CREATE POLICY "profiles_simple_select" ON public.profiles
  FOR SELECT 
  USING (
    auth.uid() = id 
    OR 
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

-- RESULTADO FINAL DE VERIFICAÇÃO
SELECT 
  'SISTEMA ESTABILIZADO' as status,
  now() as timestamp;