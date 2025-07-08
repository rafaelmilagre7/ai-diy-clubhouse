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