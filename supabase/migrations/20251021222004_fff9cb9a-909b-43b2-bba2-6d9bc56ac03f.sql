-- Criar função RPC para incrementar send_attempts de forma atômica
CREATE OR REPLACE FUNCTION public.increment_invite_send_attempts(invite_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invites
  SET send_attempts = COALESCE(send_attempts, 0) + 1
  WHERE id = invite_id_param;
END;
$$;

-- Comentário
COMMENT ON FUNCTION public.increment_invite_send_attempts IS 'Incrementa atomicamente o contador de tentativas de envio de um convite';