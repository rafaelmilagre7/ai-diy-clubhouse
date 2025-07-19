
-- CORREÇÃO DAS POLÍTICAS RLS PARA EVITAR RECURSÃO INFINITA
-- Problema: políticas na tabela user_roles estão causando recursão infinita

-- 1. Criar função segura para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_user_admin_safe(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND ur.name = 'admin'
  );
$$;

-- 2. Criar função para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT COALESCE(ur.name, 'member')
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

-- 3. Remover políticas problemáticas da tabela user_roles
DROP POLICY IF EXISTS "Users can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;

-- 4. Criar políticas simples e seguras para user_roles
CREATE POLICY "Safe admin access to user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  -- Usar verificação direta no auth.users para evitar recursão
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%@viverdeia.ai' 
    OR raw_user_meta_data->>'role' = 'admin'
  )
);

-- 5. Política para visualização de roles (sem recursão)
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role_id = user_roles.id
  )
);
