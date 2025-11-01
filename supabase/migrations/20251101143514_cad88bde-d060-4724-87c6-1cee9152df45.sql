-- Criar função para atualizar last_active automaticamente
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_active = now()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger em direct_messages (atualizar ao enviar mensagem)
DROP TRIGGER IF EXISTS user_activity_messages_trigger ON direct_messages;
CREATE TRIGGER user_activity_messages_trigger
AFTER INSERT ON direct_messages
FOR EACH ROW
EXECUTE FUNCTION update_last_active();

-- Trigger em member_connections (atualizar ao conectar)
DROP TRIGGER IF EXISTS user_activity_connections_trigger ON member_connections;
CREATE TRIGGER user_activity_connections_trigger
AFTER INSERT OR UPDATE ON member_connections
FOR EACH ROW
EXECUTE FUNCTION update_last_active();

-- Trigger em community_topics (atualizar ao postar)
DROP TRIGGER IF EXISTS user_activity_topics_trigger ON community_topics;
CREATE TRIGGER user_activity_topics_trigger
AFTER INSERT ON community_topics
FOR EACH ROW
EXECUTE FUNCTION update_last_active();