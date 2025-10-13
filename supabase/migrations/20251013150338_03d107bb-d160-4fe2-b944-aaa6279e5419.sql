-- Corrigir recursão infinita removendo políticas que causam loop

-- 1. Dropar políticas problemáticas
DROP POLICY IF EXISTS "profiles_networking_view_safe" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- 2. Recriar apenas política básica: usuário vê próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- 3. Criar política para networking SEM checagem de admin (evita recursão)
CREATE POLICY "profiles_networking_public" ON public.profiles
FOR SELECT TO authenticated
USING (available_for_networking = true);

-- 4. Criar função para admins consultarem perfis (usa SECURITY DEFINER para bypass RLS)
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS SETOF public.profiles
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Verificar se usuário é admin consultando apenas user_roles
  -- Esta função roda com privilégios elevados, então não dispara RLS
  IF NOT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  
  -- Retornar todos os perfis (RLS é bypassado por SECURITY DEFINER)
  RETURN QUERY SELECT * FROM public.profiles;
END;
$$;