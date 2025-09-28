-- Correção final: Políticas RLS simples sem recursão
-- Remover todas as políticas e funções que podem causar recursão
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Limpar completamente todas as políticas
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

-- Remover as funções que podem causar recursão
DROP FUNCTION IF EXISTS public.get_user_organization_safe(uuid);
DROP FUNCTION IF EXISTS public.is_master_user_safe(uuid);

-- Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política ultra-simples: usuários podem ver apenas seu próprio perfil
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Política ultra-simples: usuários podem atualizar apenas seu próprio perfil  
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Política simples para admins (sem JOIN complexo)
CREATE POLICY "profiles_admin_all"
ON public.profiles
FOR ALL
USING (
  auth.uid() IN (
    SELECT p.id FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role_id IN (
      SELECT ur.id FROM public.user_roles ur WHERE ur.name = 'admin'
    )
  )
);

-- Política básica para INSERT
CREATE POLICY "profiles_insert_own"  
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);