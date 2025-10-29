-- Corrigir função topic_allows_posts com search_path correto
CREATE OR REPLACE FUNCTION public.topic_allows_posts(_topic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM community_topics
    WHERE id = _topic_id
      AND NOT is_locked
  )
$$;

-- Corrigir função create_community_post_secure com search_path correto
CREATE OR REPLACE FUNCTION public.create_community_post_secure(
  p_topic_id uuid,
  p_content text,
  p_parent_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_post record;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  IF p_content IS NULL OR trim(p_content) = '' THEN
    RAISE EXCEPTION 'Conteúdo não pode estar vazio';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM community_topics WHERE id = p_topic_id) THEN
    RAISE EXCEPTION 'Tópico não encontrado';
  END IF;
  
  IF NOT topic_allows_posts(p_topic_id) THEN
    RAISE EXCEPTION 'Tópico está bloqueado para novos posts';
  END IF;
  
  INSERT INTO community_posts (topic_id, user_id, content, parent_id)
  VALUES (p_topic_id, v_user_id, trim(p_content), p_parent_id)
  RETURNING * INTO v_post;
  
  PERFORM increment_topic_replies(p_topic_id);
  
  UPDATE community_topics
  SET last_activity_at = now()
  WHERE id = p_topic_id;
  
  RETURN row_to_json(v_post);
END;
$$;

-- Garantir permissões de execução
GRANT EXECUTE ON FUNCTION public.topic_allows_posts TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.create_community_post_secure TO authenticated;