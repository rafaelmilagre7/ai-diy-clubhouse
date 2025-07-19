
-- REFATORAÇÃO ESTRUTURAL: Consolidar sistema de roles e eliminar recursão RLS
-- Esta migração resolve o problema de "infinite recursion detected" e "Role insuficiente"

-- 1. Criar função SECURITY DEFINER robusta para verificação de roles
CREATE OR REPLACE FUNCTION public.get_user_role_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  user_role_name text;
  user_email text;
BEGIN
  -- Verificar se usuário existe
  IF target_user_id IS NULL THEN
    RETURN 'anonymous';
  END IF;
  
  -- Primeiro tentar buscar role via profiles + user_roles
  SELECT ur.name INTO user_role_name
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id
  LIMIT 1;
  
  -- Se encontrou role, retornar
  IF user_role_name IS NOT NULL THEN
    RETURN user_role_name;
  END IF;
  
  -- Fallback: verificar se é admin por email
  SELECT p.email INTO user_email
  FROM public.profiles p
  WHERE p.id = target_user_id
  LIMIT 1;
  
  -- Se email termina com @viverdeia.ai, é admin
  IF user_email IS NOT NULL AND user_email LIKE '%@viverdeia.ai' THEN
    RETURN 'admin';
  END IF;
  
  -- Default para member
  RETURN 'member';
END;
$$;

-- 2. Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_user_admin_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT public.get_user_role_secure(target_user_id) = 'admin';
$$;

-- 3. Remover policies problemáticas da tabela user_roles
DROP POLICY IF EXISTS "Safe admin access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- 4. Criar policies simples e não-recursivas para user_roles
CREATE POLICY "Admin access to user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_user_admin_secure(auth.uid()));

CREATE POLICY "Users can view own role data"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role_id = user_roles.id
  )
);

-- 5. Atualizar políticas da tabela profiles para usar função segura
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR public.is_user_admin_secure(auth.uid())
);

CREATE POLICY "Users can update own profile or admins can update all"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR public.is_user_admin_secure(auth.uid())
)
WITH CHECK (
  auth.uid() = id OR public.is_user_admin_secure(auth.uid())
);

-- 6. Criar função para validar acesso a cursos
CREATE OR REPLACE FUNCTION public.can_access_learning_content(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT public.get_user_role_secure(target_user_id) IN ('admin', 'membro_club', 'formacao');
$$;

-- 7. Comentários para documentação
COMMENT ON FUNCTION public.get_user_role_secure(uuid) IS 'Função SECURITY DEFINER para obter role do usuário sem recursão RLS';
COMMENT ON FUNCTION public.is_user_admin_secure(uuid) IS 'Função SECURITY DEFINER para verificar se usuário é admin';
COMMENT ON FUNCTION public.can_access_learning_content(uuid) IS 'Função para validar acesso a conteúdo de aprendizado';
