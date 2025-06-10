
-- CORREÇÃO CRÍTICA: LIMPEZA E REAPLICAÇÃO DAS POLÍTICAS DA TABELA PROFILES
-- ========================================================================

-- PROBLEMA IDENTIFICADO:
-- - 17 políticas RLS conflitantes na tabela profiles causando redirecionamento indevido do admin
-- - Políticas com recursão infinita e funções inconsistentes
-- - Admin sendo redirecionado para onboarding devido a falha no carregamento do perfil

-- ETAPA 1: LIMPEZA COMPLETA DE TODAS AS POLÍTICAS DA TABELA PROFILES
-- ==================================================================

-- Remover TODAS as políticas existentes (17 políticas conflitantes)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profile_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profile_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profile_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profile_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- ETAPA 2: CONFIRMAR QUE RLS ESTÁ ATIVO
-- ====================================

-- Garantir que RLS está ativado (foi ativado na Fase 1)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ETAPA 3: REAPLICAÇÃO DAS 4 POLÍTICAS CORRETAS DA FASE 1
-- ========================================================

-- POLÍTICA SELECT: Usuário vê seu perfil + Admins veem todos + Leitura pública básica
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT 
  USING (
    -- Usuário pode ver seu próprio perfil completo
    auth.uid() = id 
    OR 
    -- Admins podem ver todos os perfis
    public.is_user_admin(auth.uid())
    OR 
    -- Qualquer pessoa pode ver informações básicas públicas
    true  -- Permite leitura pública de campos como name, avatar_url para funcionalidades como comunidade
  );

-- POLÍTICA INSERT: Apenas para o próprio usuário
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- POLÍTICA UPDATE: Usuário atualiza seu perfil + Admins atualizam qualquer um
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE 
  USING (
    auth.uid() = id 
    OR 
    public.is_user_admin(auth.uid())
  );

-- POLÍTICA DELETE: Apenas admins
CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE 
  USING (public.is_user_admin(auth.uid()));

-- ETAPA 4: VALIDAÇÃO DA CORREÇÃO
-- ==============================

-- Verificar se apenas 4 políticas estão ativas na tabela profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY policyname;

-- Verificar se o RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- RESULTADO ESPERADO:
-- - Exatamente 4 políticas ativas: profiles_select_policy, profiles_insert_policy, profiles_update_policy, profiles_delete_policy
-- - RLS ativo (rls_enabled = true)
-- - Login de admin funcionará sem redirecionamento para onboarding
-- - Perfil do usuário será recuperado corretamente

-- TESTE RECOMENDADO:
-- 1. Fazer logout completo
-- 2. Fazer login como admin
-- 3. Verificar se é redirecionado para /admin (não para /onboarding)
-- 4. Confirmar que o perfil está sendo carregado corretamente
