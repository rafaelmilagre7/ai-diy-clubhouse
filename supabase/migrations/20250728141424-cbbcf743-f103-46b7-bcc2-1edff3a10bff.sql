-- Remover políticas duplicadas se existirem
DROP POLICY IF EXISTS "connection_requests_insert" ON member_connections;
DROP POLICY IF EXISTS "connection_requests_select" ON member_connections;

-- Criar as novas políticas com nomes corretos
CREATE POLICY "Usuários podem enviar solicitações de conexão" 
ON member_connections
FOR INSERT
TO authenticated
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Usuários podem ver conexões que foram enviadas ou recebidas por eles" 
ON member_connections
FOR SELECT
TO authenticated
USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS member_connections_new_request ON member_connections;
CREATE TRIGGER member_connections_new_request
AFTER INSERT ON member_connections
FOR EACH ROW
EXECUTE FUNCTION handle_new_connection_request();