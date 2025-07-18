-- ============================================================================
-- CORREÇÃO DEFINITIVA DA CAUSA RAIZ: FUNÇÕES ADMIN SEM AUTH.USERS
-- ============================================================================

-- 1. SUBSTITUIR is_user_admin(uuid) - VERSÃO PRINCIPAL
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
  );
$$;

-- 2. SUBSTITUIR is_admin_user() - VERSÃO SEM PARÂMETRO
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_user_admin(auth.uid());
$$;

-- 3. CRIAR FUNÇÃO is_user_admin() SEM PARÂMETRO
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_user_admin(auth.uid());
$$;

-- 4. CORRIGIR get_user_role() PARA USAR APENAS PROFILES
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(ur.name, 'member')
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

-- 5. CORRIGIR is_admin() PARA CONSISTÊNCIA
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_user_admin(auth.uid());
$$;

-- 6. LOG DA CORREÇÃO
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'system_fix',
  'auth_functions_fixed',
  jsonb_build_object(
    'message', 'CAUSA RAIZ CORRIGIDA: Funções não usam mais auth.users',
    'timestamp', now()
  )
);