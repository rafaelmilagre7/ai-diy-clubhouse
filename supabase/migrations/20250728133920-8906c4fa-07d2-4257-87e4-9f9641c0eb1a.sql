-- Atualizar políticas RLS para permitir conexões
CREATE POLICY IF NOT EXISTS "Usuários podem enviar solicitações de conexão" 
ON member_connections
FOR INSERT
TO authenticated
WITH CHECK (requester_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Usuários podem ver conexões que foram enviadas ou recebidas por eles" 
ON member_connections
FOR SELECT
TO authenticated
USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- Garantir que o status é inicializado corretamente
ALTER TABLE member_connections 
ALTER COLUMN status SET DEFAULT 'pending';

-- Criar trigger para gerar notificações de conexão
CREATE OR REPLACE FUNCTION public.handle_new_connection_request()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO connection_notifications (
    user_id,
    sender_id,
    type
  ) VALUES (
    NEW.recipient_id,
    NEW.requester_id,
    'connection_request'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;