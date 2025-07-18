-- =============================================
-- FASE 1.2: LIMPEZA COMPLETA DE DEPENDÊNCIAS
-- =============================================

-- 1. DROPAR TRIGGERS E FUNÇÕES COM CASCADE
DROP TRIGGER IF EXISTS validate_role_changes ON public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.validate_role_change_trigger() CASCADE;

-- 2. DROPAR OUTRAS POSSÍVEIS DEPENDÊNCIAS
DROP TRIGGER IF EXISTS check_admin_permissions ON public.user_roles CASCADE;
DROP FUNCTION IF EXISTS public.check_admin_permissions() CASCADE;

-- 3. LISTAR TODAS AS FUNÇÕES QUE USAM is_user_admin PARA VERIFICAÇÃO
SELECT 
  p.proname as function_name,
  n.nspname as schema_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%is_user_admin%'
AND n.nspname = 'public';

-- 4. AGORA RECRIAR A FUNÇÃO is_user_admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  -- IMPLEMENTAÇÃO SEGURA: Verificar através de user_roles sem recursão
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
    AND user_id = auth.uid() -- Apenas para usuário autenticado atual
  );
$$;