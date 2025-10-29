-- Correção da função is_user_admin_secure para resolver erro "relation profiles does not exist"
-- Problema: search_path vazio impedia encontrar a tabela profiles
-- Solução: Definir search_path como 'public'

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
    WHERE p.id = COALESCE(target_user_id, auth.uid())
    AND ur.name = 'admin'
  );
$function$;