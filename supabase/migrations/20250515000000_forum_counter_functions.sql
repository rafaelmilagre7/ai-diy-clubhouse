
-- Função para incrementar o contador de visualizações de um tópico
CREATE OR REPLACE FUNCTION increment_topic_views(topic_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_topics
  SET view_count = view_count + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar o contador de respostas de um tópico
CREATE OR REPLACE FUNCTION increment_topic_replies(topic_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_topics
  SET reply_count = reply_count + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar suporte a notificações em tempo real para as tabelas do fórum
ALTER PUBLICATION supabase_realtime ADD TABLE forum_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_reactions;

-- Adicionar trigger para atualizar o timestamp last_activity_at quando houver nova atividade
CREATE OR REPLACE FUNCTION update_forum_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_topics
  SET last_activity_at = NOW()
  WHERE id = NEW.topic_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forum_topic_activity
AFTER INSERT ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_forum_last_activity();
