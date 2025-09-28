-- Limpeza completa e recriação das políticas RLS para profiles
-- Primeiro, desabilitar RLS temporariamente para limpeza completa
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes da tabela profiles
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT schemaname, tablename, policyname 
               FROM pg_policies 
               WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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

-- Políticas básicas e seguras
CREATE POLICY "profiles_own_select"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_own_update"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "profiles_admin_select"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Política INSERT básica
CREATE POLICY "profiles_insert"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);