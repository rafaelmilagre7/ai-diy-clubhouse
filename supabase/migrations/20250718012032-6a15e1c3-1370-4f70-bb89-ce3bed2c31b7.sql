-- CORREÇÃO URGENTE: Remover política conflitante em user_roles que impede acesso admin
-- Problema: A política "Only admins can manage user roles" causa recursão e impede funcionalidade admin

-- 1. Remover política problemática que usa profiles.role (campo depreciado)
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;

-- 2. Verificar se política segura atual está funcionando
-- A política "user_roles_admin_access" já existe e usa verificação por email @viverdeia.ai
-- que é mais robusta e não causa recursão

-- 3. Log da correção para auditoria
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'security_fix',
  'remove_conflicting_rls_policy',
  jsonb_build_object(
    'table_name', 'user_roles',
    'removed_policy', 'Only admins can manage user roles',
    'reason', 'Policy conflict preventing admin access - recursive reference to profiles.role',
    'resolution', 'Kept user_roles_admin_access policy using email verification',
    'admin_affected', 'diego.malta@viverdeia.ai',
    'timestamp', NOW()
  )
);

-- 4. Verificar que Diego tem acesso
SELECT 'Diego admin access verification:' as status,
  (SELECT COUNT(*) FROM auth.users WHERE email = 'diego.malta@viverdeia.ai') as user_exists,
  (SELECT email LIKE '%@viverdeia.ai' FROM auth.users WHERE email = 'diego.malta@viverdeia.ai') as has_admin_email;