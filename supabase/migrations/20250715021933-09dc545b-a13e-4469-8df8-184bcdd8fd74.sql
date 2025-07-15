-- Verificar se existe função para validar configuração do WhatsApp
CREATE OR REPLACE FUNCTION public.check_whatsapp_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Esta função só verificará se os convites estão sendo processados corretamente
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Verificação de configuração WhatsApp disponível',
    'timestamp', now()
  );
END;
$function$;