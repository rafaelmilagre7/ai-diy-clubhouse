-- ============================================
-- CORREÇÃO CRÍTICA: is_user_admin_secure
-- Problema: search_path vazio impede encontrar tabela profiles
-- Solução: Qualificação explícita de schemas
-- ============================================

-- Recriar função com qualificação explícita
CREATE OR REPLACE FUNCTION public.is_user_admin_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = COALESCE(target_user_id, auth.uid())
    AND ur.name = 'admin'
  );
$$;

-- Regranting permissões
GRANT EXECUTE ON FUNCTION public.is_user_admin_secure(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin_secure(uuid) TO service_role;

-- Documentação
COMMENT ON FUNCTION public.is_user_admin_secure(uuid) IS 
'Verifica se usuário é admin usando qualificação explícita de schemas. Corrigido para funcionar com search_path vazio.';