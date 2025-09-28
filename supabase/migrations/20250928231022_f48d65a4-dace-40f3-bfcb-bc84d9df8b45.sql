-- Corrigir políticas RLS recursivas na tabela profiles
-- Primeiro, remover as políticas problemáticas
DROP POLICY IF EXISTS "Master users can view all profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Sub-users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Criar função SECURITY DEFINER para verificar organização sem recursão
CREATE OR REPLACE FUNCTION public.get_user_organization_safe(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

-- Criar função SECURITY DEFINER para verificar se é master user
CREATE OR REPLACE FUNCTION public.is_master_user_safe(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_master_user, false) FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

-- Política simples: usuários podem ver seu próprio perfil
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Política simples: usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Política para admins usando função segura
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Política para master users verem perfis da organização usando função segura
CREATE POLICY "Master users can view organization profiles"
ON public.profiles
FOR SELECT
USING (
  public.is_master_user_safe(auth.uid()) = true AND
  public.get_user_organization_safe(auth.uid()) = organization_id
);

-- Política para sub-users verem perfis da mesma organização usando função segura
CREATE POLICY "Sub-users can view same organization profiles"
ON public.profiles
FOR SELECT
USING (
  public.get_user_organization_safe(auth.uid()) IS NOT NULL AND
  public.get_user_organization_safe(auth.uid()) = organization_id
);