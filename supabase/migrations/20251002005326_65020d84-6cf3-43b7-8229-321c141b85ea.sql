-- Corrigir a função do trigger para usar o valor correto no constraint
CREATE OR REPLACE FUNCTION public.handle_new_connection_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO connection_notifications (
    user_id,
    sender_id,
    type
  ) VALUES (
    NEW.recipient_id,
    NEW.requester_id,
    'request'  -- Corrigido de 'connection_request' para 'request'
  );
  RETURN NEW;
END;
$function$;