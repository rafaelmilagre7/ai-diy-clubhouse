
-- Função para buscar estatísticas do fórum de forma otimizada
CREATE OR REPLACE FUNCTION get_forum_statistics()
RETURNS json AS $$
DECLARE
  topic_count integer;
  post_count integer;
  active_user_count integer;
BEGIN
  -- Contar tópicos
  SELECT COUNT(*) INTO topic_count FROM forum_topics;
  
  -- Contar posts
  SELECT COUNT(*) INTO post_count FROM forum_posts;
  
  -- Contar usuários distintos que contribuíram (limitado aos últimos 90 dias)
  SELECT COUNT(DISTINCT user_id) INTO active_user_count
  FROM (
    SELECT user_id FROM forum_topics 
    WHERE created_at > NOW() - INTERVAL '90 days'
    UNION
    SELECT user_id FROM forum_posts 
    WHERE created_at > NOW() - INTERVAL '90 days'
  ) AS active_users;
  
  -- Retornar JSON com os resultados
  RETURN json_build_object(
    'topic_count', topic_count,
    'post_count', post_count,
    'active_user_count', active_user_count
  );
END;
$$ LANGUAGE plpgsql;

-- Função para contar usuários distintos que contribuíram no fórum
CREATE OR REPLACE FUNCTION count_distinct_forum_users()
RETURNS integer AS $$
DECLARE
  user_count integer;
BEGIN
  -- Contar usuários distintos que contribuíram (limitado aos últimos 90 dias)
  SELECT COUNT(DISTINCT user_id) INTO user_count
  FROM (
    SELECT user_id FROM forum_topics 
    WHERE created_at > NOW() - INTERVAL '90 days'
    UNION
    SELECT user_id FROM forum_posts 
    WHERE created_at > NOW() - INTERVAL '90 days'
  ) AS active_users;
  
  RETURN user_count;
END;
$$ LANGUAGE plpgsql;
