-- Migration: Correção de RLS para cadastro de usuários
-- Descrição: Permite que o trigger handle_new_user() insira dados em profiles, onboarding_final e audit_logs
-- Data: 2025-10-26
-- SEGURO PARA PRODUÇÃO - Apenas adiciona condição, não remove validações existentes

-- ========================================
-- 1. PROFILES - Permitir INSERT via trigger
-- ========================================
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

CREATE POLICY "profiles_insert_policy" 
ON public.profiles
FOR INSERT
WITH CHECK (
  -- Permite usuário criar próprio perfil
  (auth.uid() = id) 
  -- Permite admin criar perfis
  OR is_user_admin_secure(auth.uid())
  -- Permite triggers SECURITY DEFINER (handle_new_user)
  OR (auth.uid() IS NULL AND current_setting('role') = 'authenticator')
);

-- ========================================
-- 2. ONBOARDING_FINAL - Permitir INSERT via trigger
-- ========================================
DROP POLICY IF EXISTS "onboarding_insert_policy" ON public.onboarding_final;

CREATE POLICY "onboarding_insert_policy" 
ON public.onboarding_final
FOR INSERT
WITH CHECK (
  -- Permite usuário criar próprio onboarding
  (user_id = auth.uid()) 
  -- Permite triggers SECURITY DEFINER (handle_new_user)
  OR (auth.uid() IS NULL AND current_setting('role') = 'authenticator')
);

-- ========================================
-- 3. AUDIT_LOGS - Permitir INSERT via trigger
-- ========================================
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;

CREATE POLICY "audit_logs_insert_policy" 
ON public.audit_logs
FOR INSERT
WITH CHECK (
  -- Service role tem acesso total
  is_service_role()
  -- Usuário pode criar seus próprios logs
  OR ((auth.uid() IS NOT NULL) AND ((user_id = auth.uid()) OR (user_id IS NULL)))
  -- Admin pode criar logs
  OR ((auth.uid() IS NOT NULL) AND is_user_admin_safe(auth.uid()))
  -- Permite triggers SECURITY DEFINER (handle_new_user)
  OR (auth.uid() IS NULL AND current_setting('role') = 'authenticator')
);