-- Correção do Sistema de Matches de Networking
-- Fase 1: Política RLS para permitir visualização de perfis no networking

-- Remover política antiga restritiva
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- Criar política que permite ver o próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Criar nova política para networking: usuários podem ver perfis disponíveis
CREATE POLICY "profiles_networking_view" ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Perfis disponíveis para networking podem ser vistos por usuários autenticados
  available_for_networking = true
  OR
  -- Admins veem tudo
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
      AND ur.name = 'admin'
  )
);