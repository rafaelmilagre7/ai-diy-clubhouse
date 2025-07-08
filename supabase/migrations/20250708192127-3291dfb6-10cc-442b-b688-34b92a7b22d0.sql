
-- Criar função RPC para atualizar estatísticas de convite
CREATE OR REPLACE FUNCTION public.update_invite_send_attempt(invite_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.invites
  SET last_sent_at = NOW(),
      send_attempts = send_attempts + 1
  WHERE id = invite_id;
END;
$function$;

-- Melhorar logs de auditoria para WhatsApp
INSERT INTO public.audit_logs (
  event_type,
  action,
  user_id,
  resource_id,
  details
) VALUES (
  'whatsapp_function_fix',
  'create_rpc_function',
  '00000000-0000-0000-0000-000000000000',
  'update_invite_send_attempt',
  jsonb_build_object(
    'description', 'Função RPC criada para atualizar estatísticas de convites',
    'timestamp', NOW()
  )
);
