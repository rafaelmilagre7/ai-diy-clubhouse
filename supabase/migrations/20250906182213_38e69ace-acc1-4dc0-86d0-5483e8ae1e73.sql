-- Executar correção direta no auth.users (via service_role)
-- Atualizar email no auth.users para sincronizar com profiles
UPDATE auth.users 
SET 
  email = 'victor.pena@acpcontabil.com.br',
  updated_at = now()
WHERE id = 'da532205-9e08-434c-b099-c38879b31b38'::uuid;

-- Invalidar sessões ativas para forçar re-login
DELETE FROM auth.sessions 
WHERE user_id = 'da532205-9e08-434c-b099-c38879b31b38'::uuid;

-- Registrar correção completa
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  'da532205-9e08-434c-b099-c38879b31b38'::uuid,
  'auth_correction_final',
  'sync_auth_profile_completed',
  jsonb_build_object(
    'user_id', 'da532205-9e08-434c-b099-c38879b31b38',
    'final_email', 'victor.pena@acpcontabil.com.br',
    'name', 'Victor Montes Pena',
    'company', 'exponential.co',
    'correction_method', 'direct_auth_update',
    'sessions_invalidated', true,
    'auth_profile_synced', true,
    'privacy_breach_resolved', true,
    'timestamp', now()
  ),
  'critical'
);