-- Criar função para testar envio WhatsApp com seu número
CREATE OR REPLACE FUNCTION test_whatsapp_delivery()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta função será usada para testar entregas WhatsApp
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Função de teste criada',
    'timestamp', now()
  );
END;
$$;