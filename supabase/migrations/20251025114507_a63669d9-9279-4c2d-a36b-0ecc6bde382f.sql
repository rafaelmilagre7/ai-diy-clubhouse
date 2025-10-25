-- ============================================
-- CORREÇÃO CRÍTICA: Política RLS de audit_logs
-- ============================================
-- Problema: audit_logs bloqueava inserções sem user_id
-- Solução: Criar função is_service_role() para bypass seguro

-- 1. Criar função para verificar se é service_role
CREATE OR REPLACE FUNCTION public.is_service_role() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se a role atual é service_role
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role',
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 2. Dropar função antiga COM CASCADE (vai dropar as policies que dependem dela)
DROP FUNCTION IF EXISTS public.is_user_admin_safe(uuid) CASCADE;

-- 3. Recriar função com nome de parâmetro correto
CREATE FUNCTION public.is_user_admin_safe(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT ur.name INTO user_role
  FROM profiles p
  JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = check_user_id;
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 4. Recriar política de SELECT para audit_logs
CREATE POLICY "audit_logs_select_policy" 
ON public.audit_logs
FOR SELECT
USING (
  -- Service role pode ver tudo
  is_service_role() 
  OR 
  -- Usuário pode ver seus próprios logs
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Admin pode ver tudo
  (auth.uid() IS NOT NULL AND is_user_admin_safe(auth.uid()))
);

-- 5. Recriar política de INSERT para audit_logs
CREATE POLICY "audit_logs_insert_policy" 
ON public.audit_logs
FOR INSERT
WITH CHECK (
  -- Service role pode inserir tudo
  is_service_role() 
  OR 
  -- Usuário autenticado pode inserir seus próprios logs OU logs sem user_id (eventos de sistema)
  (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
  OR
  -- Admin pode inserir qualquer log
  (auth.uid() IS NOT NULL AND is_user_admin_safe(auth.uid()))
);

-- 6. Comentários para documentação
COMMENT ON FUNCTION public.is_service_role() IS 
'Verifica se a requisição atual é feita pelo service_role (edge functions). SECURITY DEFINER para bypass seguro de RLS.';

COMMENT ON FUNCTION public.is_user_admin_safe(uuid) IS 
'Verifica se um usuário é admin de forma segura sem recursão. Usado em políticas RLS.';

COMMENT ON POLICY "audit_logs_insert_policy" ON public.audit_logs IS 
'Permite inserção de logs por: service_role (edge functions), próprio usuário (incluindo logs de sistema sem user_id), ou admins. Corrige bloqueio de logs de segurança.';