-- ============================================================================
-- CORREÇÃO DEFINITIVA DA CAUSA RAIZ: FUNÇÕES ADMIN COM AUTH.USERS
-- ============================================================================
-- PROBLEMA: is_user_admin() e is_admin_user() consultam auth.users diretamente
-- SOLUÇÃO: Reescrever para usar apenas public.profiles + public.user_roles
-- ============================================================================

-- 1. SUBSTITUIR is_user_admin(uuid) - MANTENDO ASSINATURA ORIGINAL
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- NOVA IMPLEMENTAÇÃO: Usar apenas public.profiles + user_roles 
  -- Elimina completamente referências à auth.users
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
  -- USAR A MESMA LÓGICA SEGURA DA FUNÇÃO ACIMA
  SELECT public.is_user_admin(auth.uid());
$$;

-- 3. CRIAR FUNÇÃO is_user_admin() SEM PARÂMETRO PARA COMPATIBILIDADE
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- VERSÃO SEM PARÂMETRO USANDO auth.uid()
  SELECT public.is_user_admin(auth.uid());
$$;

-- 4. CONSOLIDAR get_user_role() PARA USAR A MESMA LÓGICA SEGURA
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

-- 5. RECRIAR is_admin() PARA CONSISTÊNCIA
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_user_admin(auth.uid());
$$;

-- 6. VERIFICAR TODAS AS FUNÇÕES QUE AINDA REFERENCIAM AUTH.USERS
-- (Esta query irá mostrar se ainda há problemas)
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) ILIKE '%auth.users%'
ORDER BY p.proname;

-- 7. LOG DA CORREÇÃO
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_fix',
  'auth_functions_root_cause_fix',
  jsonb_build_object(
    'message', 'CAUSA RAIZ CORRIGIDA: Funções admin não consultam mais auth.users',
    'fixed_functions', ARRAY['is_user_admin(uuid)', 'is_admin_user()', 'is_user_admin()', 'get_user_role()', 'is_admin()'],
    'new_approach', 'Usar apenas public.profiles + public.user_roles',
    'expected_result', 'Zero erros permission denied for table users',
    'timestamp', now()
  ),
  auth.uid()
);

-- 8. VALIDAÇÃO FINAL
SELECT 
  'CORREÇÃO APLICADA! ✅' as status,
  'Funções admin reescritas para não usar auth.users' as message,
  now() as timestamp;