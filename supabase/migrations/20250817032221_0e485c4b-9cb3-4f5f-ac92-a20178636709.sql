-- Corrigir políticas RLS da tabela audit_logs de forma mais permissiva

-- Remover políticas existentes
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;  
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_restricted_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_service_role_insert" ON public.audit_logs;

-- Criar política mais permissiva para inserção
CREATE POLICY "audit_logs_insert_policy" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (
    -- Permitir service_role sempre
    auth.role() = 'service_role' OR
    -- Permitir usuários autenticados inserir seus próprios logs
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR
    -- Permitir admins inserir qualquer log
    (auth.uid() IS NOT NULL AND public.is_user_admin_safe(auth.uid()))
  );

-- Criar política para visualização
CREATE POLICY "audit_logs_select_policy" 
  ON public.audit_logs 
  FOR SELECT 
  USING (
    -- Admins podem ver todos os logs
    public.is_user_admin_safe(auth.uid()) OR
    -- Usuários podem ver apenas seus logs não sensíveis
    (
      user_id = auth.uid() AND 
      event_type NOT IN ('login', 'logout', 'password_change', 'role_change', 'admin_access') AND
      severity NOT IN ('critical', 'high')
    )
  );