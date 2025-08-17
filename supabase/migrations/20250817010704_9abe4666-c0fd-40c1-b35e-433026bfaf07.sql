-- CORREÇÃO: Remover lógica insegura de admin por domínio de email

-- 1. Corrigir a função is_user_admin_fast (remover verificação por email)
CREATE OR REPLACE FUNCTION public.is_user_admin_fast(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id 
    AND ur.name = 'admin'
  );
$function$;

-- 2. Corrigir a função is_user_admin_secure (remover verificação por email)
CREATE OR REPLACE FUNCTION public.is_user_admin_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id 
    AND ur.name = 'admin'
  );
$function$;

-- 3. Corrigir a função get_user_role_secure (remover fallback por email)
CREATE OR REPLACE FUNCTION public.get_user_role_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role_name text;
BEGIN
  IF target_user_id IS NULL THEN
    RETURN 'anonymous';
  END IF;
  
  -- Buscar role apenas pela tabela user_roles (sem fallback por email)
  SELECT ur.name INTO user_role_name
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id
  LIMIT 1;
  
  -- Se encontrou role, retornar
  IF user_role_name IS NOT NULL THEN
    RETURN user_role_name;
  END IF;
  
  -- Se não encontrou, retornar 'member' como padrão (sem verificação de email)
  RETURN 'member';
END;
$function$;

-- 4. Log de auditoria da correção de segurança
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_improvement',
  'removed_admin_email_domain_fallback',
  jsonb_build_object(
    'functions_updated', ARRAY['is_user_admin_fast', 'is_user_admin_secure', 'get_user_role_secure'],
    'security_risk', 'Email domain admin bypass removed',
    'timestamp', now(),
    'description', 'Removida lógica insegura que permitia admin via domínio @viverdeia.ai'
  ),
  'high'
);