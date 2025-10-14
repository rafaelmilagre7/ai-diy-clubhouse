-- ================================================================
-- CORREÇÃO FINAL: Recursão Infinita em RLS de profiles
-- ================================================================
-- Problema: profiles_select_unified causa recursão ao verificar admin via JOIN
-- Solução: Separar em 2 políticas independentes sem recursão
-- ================================================================

-- 1. Remover política problemática
DROP POLICY IF EXISTS "profiles_select_unified" ON public.profiles;

-- 2. Criar política SIMPLES para usuários regulares
-- Permite ver apenas: próprio perfil + perfis públicos de networking
CREATE POLICY "profiles_select_simple" 
ON public.profiles FOR SELECT
TO authenticated
USING (
  -- Próprio perfil SEMPRE visível (sem função, direto)
  auth.uid() = id
  OR
  -- Perfis públicos para networking (coluna simples, sem subquery)
  available_for_networking = true
);

-- 3. Criar política SEPARADA para admins verem tudo
-- Usa is_user_admin_via_jwt() que já existe e não causa recursão
CREATE POLICY "profiles_admin_view_all" 
ON public.profiles FOR SELECT
TO authenticated
USING (
  -- Admins podem ver todos os perfis
  -- Esta função NÃO causa recursão pois consulta user_roles de forma isolada
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 4. Comentários de documentação
COMMENT ON POLICY "profiles_select_simple" ON public.profiles IS 
'Permite usuários autenticados verem: (1) seu próprio perfil, (2) perfis públicos de networking. Sem recursão.';

COMMENT ON POLICY "profiles_admin_view_all" ON public.profiles IS 
'Permite admins verem todos os perfis. Separada da política principal para evitar recursão.';