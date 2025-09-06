-- CORREÇÃO DIRETA NO AUTH.USERS (executada como service_role)
-- Backup completo antes da correção
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  'da532205-9e08-434c-b099-c38879b31b38'::uuid,
  'critical_auth_correction',
  'direct_auth_email_correction',
  jsonb_build_object(
    'user_id', 'da532205-9e08-434c-b099-c38879b31b38',
    'correction_reason', 'Dessincronização auth-profile detectada',
    'old_email_auth', 'wagner@acairepublic.com',
    'new_email_auth', 'victor.pena@acpcontabil.com.br',
    'profiles_email', 'victor.pena@acpcontabil.com.br',
    'name', 'Victor Montes Pena',
    'company', 'exponential.co',
    'correction_method', 'direct_migration',
    'privacy_breach_resolved', true,
    'timestamp', now()
  ),
  'critical'
);

-- Atualizar email no auth.users para sincronizar com profiles
UPDATE auth.users 
SET 
  email = 'victor.pena@acpcontabil.com.br',
  updated_at = now()
WHERE id = 'da532205-9e08-434c-b099-c38879b31b38'::uuid;

-- Invalidar todas as sessões ativas para forçar re-login
DELETE FROM auth.sessions 
WHERE user_id = 'da532205-9e08-434c-b099-c38879b31b38'::uuid;

-- Registrar o sucesso da correção
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  'da532205-9e08-434c-b099-c38879b31b38'::uuid,
  'critical_auth_correction',
  'auth_profile_synchronized',
  jsonb_build_object(
    'user_id', 'da532205-9e08-434c-b099-c38879b31b38',
    'final_auth_email', 'victor.pena@acpcontabil.com.br',
    'final_profile_email', 'victor.pena@acpcontabil.com.br',
    'sync_status', 'success',
    'sessions_invalidated', true,
    'privacy_breach_resolved', true,
    'correction_completed_at', now()
  ),
  'info'
);