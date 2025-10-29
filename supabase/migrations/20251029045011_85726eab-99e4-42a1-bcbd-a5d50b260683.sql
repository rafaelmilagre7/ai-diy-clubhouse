-- ============================================
-- CORREÇÃO FINAL - CREATE OR REPLACE FORÇADO
-- Timestamp: 2025-10-29T04:55:00Z
-- ============================================

-- 1. Recriar topic_allows_posts COM CREATE OR REPLACE
CREATE OR REPLACE FUNCTION public.topic_allows_posts(_topic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM community_topics
    WHERE id = _topic_id AND NOT is_locked
  )
$$;

-- 2. Recriar increment_topic_replies COM CREATE OR REPLACE
CREATE OR REPLACE FUNCTION public.increment_topic_replies(topic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE community_topics
  SET reply_count = COALESCE(reply_count, 0) + 1,
      last_activity_at = now()
  WHERE id = topic_id;
END;
$$;

-- 3. Recriar create_community_post_secure COM CREATE OR REPLACE E LOGS
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
  v_topic_exists boolean;
  v_topic_allows boolean;
BEGIN
  v_user_id := auth.uid();
  
  RAISE NOTICE '[RPC START] user=%, topic=%', v_user_id, p_topic_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  IF p_content IS NULL OR trim(p_content) = '' THEN
    RAISE EXCEPTION 'Conteúdo vazio';
  END IF;
  
  -- Debug: verificar se tópico existe
  SELECT EXISTS(SELECT 1 FROM community_topics WHERE id = p_topic_id) INTO v_topic_exists;
  RAISE NOTICE '[RPC CHECK] topic_exists=%', v_topic_exists;
  
  IF NOT v_topic_exists THEN
    RAISE EXCEPTION 'Tópico não encontrado: %', p_topic_id;
  END IF;
  
  -- Debug: verificar se permite posts
  SELECT topic_allows_posts(p_topic_id) INTO v_topic_allows;
  RAISE NOTICE '[RPC CHECK] topic_allows=%', v_topic_allows;
  
  IF NOT v_topic_allows THEN
    RAISE EXCEPTION 'Tópico bloqueado';
  END IF;
  
  RAISE NOTICE '[RPC INSERT] Iniciando...';
  
  INSERT INTO community_posts (topic_id, user_id, content, parent_id)
  VALUES (p_topic_id, v_user_id, trim(p_content), p_parent_id)
  RETURNING * INTO v_post;
  
  RAISE NOTICE '[RPC INSERT] Sucesso! post_id=%', v_post.id;
  
  PERFORM increment_topic_replies(p_topic_id);
  
  UPDATE community_topics
  SET last_activity_at = now()
  WHERE id = p_topic_id;
  
  RAISE NOTICE '[RPC END] Completo!';
  
  RETURN row_to_json(v_post);
END;
$$;

-- 4. Garantir permissões
GRANT EXECUTE ON FUNCTION public.topic_allows_posts TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.increment_topic_replies TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_community_post_secure TO authenticated;

-- 5. Comentários
COMMENT ON FUNCTION public.topic_allows_posts IS 
'v2: Verifica se tópico permite posts. FIX: search_path = public (sem TO, sem aspas)';

COMMENT ON FUNCTION public.create_community_post_secure IS 
'v2: Cria post com SECURITY DEFINER. FIX: search_path = public + logs detalhados';