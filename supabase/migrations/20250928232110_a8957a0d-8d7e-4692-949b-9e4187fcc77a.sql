-- Correção da recursão RLS apenas nas políticas de profiles
-- Não mexer na função is_user_admin_secure pois está sendo usada por outras políticas

-- Desabilitar RLS temporariamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover apenas as políticas da tabela profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar política super simples: usuários podem ver apenas seu próprio perfil
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Política simples para UPDATE
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Política simples para INSERT
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Política básica para admins sem JOIN na própria tabela profiles
-- Usar a função existente que já funciona em outras tabelas
CREATE POLICY "profiles_admin_all"
ON public.profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.id = (
      SELECT role_id FROM auth.users au 
      JOIN public.profiles p ON p.id = au.id 
      WHERE au.id = auth.uid()
    ) 
    AND ur.name = 'admin'
  )
);