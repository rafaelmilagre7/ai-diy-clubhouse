
-- CORREÇÃO: Remover função duplicada antes de recriar
-- ===================================================

-- ETAPA 1: REMOVER FUNÇÃO is_admin EXISTENTE (todas as versões)
-- =============================================================

DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;

-- ETAPA 2: REMOVER FUNÇÃO is_user_admin EXISTENTE
-- ===============================================

DROP FUNCTION IF EXISTS public.is_user_admin(uuid) CASCADE;

-- ETAPA 3: RECRIAR FUNÇÃO is_user_admin CORRIGIDA
-- ===============================================

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  is_admin_user boolean := false;
BEGIN
  -- Verificar se o usuário existe e tem role de admin via role_id
  SELECT EXISTS(
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = COALESCE(user_id, auth.uid())
    AND ur.name = 'admin'
  ) INTO is_admin_user;
  
  RETURN is_admin_user;
END;
$$;

-- ETAPA 4: RECRIAR FUNÇÃO is_admin() GLOBAL
-- =========================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN public.is_user_admin(auth.uid());
END;
$$;

-- ETAPA 5: CORRIGIR POLÍTICAS RLS DA TABELA user_roles
-- ====================================================

-- Remover políticas incorretas
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can modify user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Public can view role names" ON public.user_roles;

-- Criar políticas corretas
CREATE POLICY "Everyone can view role definitions" ON public.user_roles
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify roles" ON public.user_roles
  FOR ALL 
  USING (public.is_user_admin(auth.uid()));

-- ETAPA 6: CORRIGIR POLÍTICAS DA TABELA profiles
-- ==============================================

-- Remover políticas problemáticas se existirem
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Recriar políticas corretas
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (
    auth.uid() = id 
    OR 
    public.is_user_admin(auth.uid())
  );

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE 
  USING (
    auth.uid() = id 
    OR 
    public.is_user_admin(auth.uid())
  );

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE 
  USING (public.is_user_admin(auth.uid()));

-- ETAPA 7: TESTE DA CORREÇÃO
-- ==========================

-- Testar se a função funciona para Diego Malta
SELECT 
  p.email,
  p.role_id,
  ur.name as role_name,
  public.is_user_admin(p.id) as is_admin_check
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id
WHERE p.email = 'diego.malta@viverdeia.ai';

-- ETAPA 8: COMENTÁRIOS DE DOCUMENTAÇÃO
-- ====================================

COMMENT ON FUNCTION public.is_user_admin IS 'Função corrigida para verificar admin via role_id';
COMMENT ON FUNCTION public.is_admin IS 'Função global que usa is_user_admin com usuário atual';
