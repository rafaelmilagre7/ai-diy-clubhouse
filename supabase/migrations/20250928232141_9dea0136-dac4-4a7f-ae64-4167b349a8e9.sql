-- Política ultra-simples sem nenhuma recursão possível
-- Remover política de admin problemática

-- Desabilitar RLS temporariamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover política que pode causar recursão
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política simples: admins podem ver tudo usando função SECURITY DEFINER já existente
CREATE POLICY "profiles_admin_select"
ON public.profiles
FOR SELECT
USING (public.is_user_admin_secure(auth.uid()));

CREATE POLICY "profiles_admin_update"
ON public.profiles
FOR UPDATE
USING (public.is_user_admin_secure(auth.uid()));

CREATE POLICY "profiles_admin_delete"
ON public.profiles
FOR DELETE
USING (public.is_user_admin_secure(auth.uid()));

CREATE POLICY "profiles_admin_insert"
ON public.profiles
FOR INSERT
WITH CHECK (public.is_user_admin_secure(auth.uid()));