-- Corrigir políticas RLS da tabela audit_logs para permitir que admins salvem logs

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.audit_logs;

-- Criar políticas que permitam admins inserir e visualizar logs de auditoria
CREATE POLICY "Admins can insert audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (public.is_user_admin_safe(auth.uid()));

CREATE POLICY "Admins can view audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (public.is_user_admin_safe(auth.uid()));

-- Permitir que o sistema salve logs mesmo com user_id NULL (para eventos de sistema)
CREATE POLICY "System can insert audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    public.is_user_admin_safe(auth.uid())
  );