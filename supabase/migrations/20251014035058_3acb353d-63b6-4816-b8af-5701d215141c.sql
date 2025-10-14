-- ================================================================
-- SOLUÇÃO DEFINITIVA: Remover Recursão Infinita em profiles
-- ================================================================
-- Remove políticas que causam recursão ao verificar admin
-- Cria política simples: próprio perfil + networking público
-- Admins verão todos os perfis via Edge Functions (não via RLS)
-- ================================================================

-- 1. Remover TODAS as políticas SELECT problemáticas
DROP POLICY IF EXISTS "profiles_select_simple" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_view_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_unified" ON public.profiles;

-- 2. Criar ÚNICA política sem recursão
CREATE POLICY "profiles_select_own_or_public" 
ON public.profiles FOR SELECT
TO authenticated
USING (
  -- Condição 1: Ver próprio perfil (direto, sem função)
  auth.uid() = id
  OR
  -- Condição 2: Ver perfis públicos de networking
  available_for_networking = true
);

-- 3. Documentação
COMMENT ON POLICY "profiles_select_own_or_public" ON public.profiles IS 
'Permite usuários autenticados verem: (1) seu próprio perfil, (2) perfis com networking ativo. Zero recursão. Admins usam Edge Functions para ver todos.';
