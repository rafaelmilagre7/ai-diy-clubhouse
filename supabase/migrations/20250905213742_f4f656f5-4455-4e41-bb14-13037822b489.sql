-- Correção completa do email do Victor Montes Pena (versão corrigida)
-- Backup dos dados originais antes da correção
INSERT INTO audit_logs (
  user_id,
  event_type, 
  action,
  details,
  severity
) VALUES (
  'da532205-9e08-434c-b099-c38879b31b38'::uuid,
  'data_correction',
  'email_correction_backup',
  jsonb_build_object(
    'user_id', 'da532205-9e08-434c-b099-c38879b31b38',
    'old_email', 'wagner@acairepublic.com',
    'new_email', 'victor.pena@acpcontabil.com.br',
    'name', 'Victor Montes Pena',
    'company_name', 'exponential.co',
    'correction_reason', 'Email incorreto - correção manual solicitada',
    'backup_timestamp', now()
  ),
  'info'
);

-- Atualizar o email no perfil do Victor
UPDATE public.profiles 
SET 
  email = 'victor.pena@acpcontabil.com.br',
  updated_at = now()
WHERE id = 'da532205-9e08-434c-b099-c38879b31b38'::uuid;

-- Verificar se existe convite com email antigo e marcar como migrado
UPDATE public.invites 
SET 
  notes = COALESCE(notes, '') || ' [MIGRADO: Email corrigido de wagner@acairepublic.com para victor.pena@acpcontabil.com.br]',
  last_sent_at = now()
WHERE email = 'wagner@acairepublic.com' 
AND used_at IS NULL;

-- Registrar a correção realizada
INSERT INTO audit_logs (
  user_id,
  event_type,
  action, 
  details,
  severity
) VALUES (
  'da532205-9e08-434c-b099-c38879b31b38'::uuid,
  'data_correction',
  'email_correction_applied',
  jsonb_build_object(
    'user_id', 'da532205-9e08-434c-b099-c38879b31b38',
    'old_email', 'wagner@acairepublic.com',
    'new_email', 'victor.pena@acpcontabil.com.br',
    'name', 'Victor Montes Pena',
    'correction_timestamp', now(),
    'applied_by', 'admin_manual_correction',
    'correction_status', 'completed'
  ),
  'info'
);