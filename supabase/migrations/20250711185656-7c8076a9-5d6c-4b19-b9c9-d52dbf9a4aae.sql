-- Remover a constraint problemática de audit_logs que está impedindo a criação de contas
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_event_type_check;

-- Criar uma constraint mais flexível que permita event_types necessários
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_event_type_check 
CHECK (event_type IN (
  'account_creation', 
  'user_signup', 
  'profile_update', 
  'role_change', 
  'login', 
  'logout', 
  'invite_used',
  'security_event',
  'security_violation',
  'system_cleanup',
  'start',
  'permission_change',
  'data_access',
  'admin_action'
));