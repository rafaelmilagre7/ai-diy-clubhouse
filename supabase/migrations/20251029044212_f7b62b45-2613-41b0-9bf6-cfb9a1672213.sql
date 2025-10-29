-- ============================================
-- CORREÇÃO DEFINITIVA - COMMUNITY POSTS
-- Com schema explícito e logs de debug
-- ============================================

-- 1. Corrigir topic_allows_posts
CREATE OR REPLACE FUNCTION public.topic_allows_posts(_topic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_topics
    WHERE id = _topic_id
      AND NOT is_locked
  )
$$;

-- 2. Corrigir increment_topic_replies
CREATE OR REPLACE FUNCTION public.increment_topic_replies(topic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_topics
  SET reply_count = COALESCE(reply_count, 0) + 1,
      last_activity_at = now()
  WHERE id = topic_id;
END;
$$;

-- 3. Corrigir create_community_post_secure COM LOGS
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
  -- Pegar usuário autenticado
  v_user_id := auth.uid();
  
  RAISE NOTICE '[RPC] Usuário: %, Tópico: %', v_user_id, p_topic_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  IF p_content IS NULL OR trim(p_content) = '' THEN
    RAISE EXCEPTION 'Conteúdo não pode estar vazio';
  END IF;
  
  -- Verificar se tópico existe (com schema explícito)
  IF NOT EXISTS (SELECT 1 FROM public.community_topics WHERE id = p_topic_id) THEN
    RAISE EXCEPTION 'Tópico não encontrado: %', p_topic_id;
  END IF;
  
  -- Verificar se tópico permite posts
  IF NOT topic_allows_posts(p_topic_id) THEN
    RAISE EXCEPTION 'Tópico está bloqueado para novos posts';
  END IF;
  
  RAISE NOTICE '[RPC] Inserindo post...';
  
  -- Inserir post (com schema explícito)
  INSERT INTO public.community_posts (topic_id, user_id, content, parent_id)
  VALUES (p_topic_id, v_user_id, trim(p_content), p_parent_id)
  RETURNING * INTO v_post;
  
  RAISE NOTICE '[RPC] Post inserido: %', v_post.id;
  
  -- Incrementar contador
  PERFORM increment_topic_replies(p_topic_id);
  
  -- Atualizar última atividade
  UPDATE public.community_topics
  SET last_activity_at = now()
  WHERE id = p_topic_id;
  
  RAISE NOTICE '[RPC] Sucesso!';
  
  RETURN row_to_json(v_post);
END;
$$;

-- 4. Garantir permissões
GRANT EXECUTE ON FUNCTION public.topic_allows_posts TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.increment_topic_replies TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_community_post_secure TO authenticated;

-- 5. Comentários para documentação
COMMENT ON FUNCTION public.create_community_post_secure IS 
'Cria post na comunidade com SECURITY DEFINER. Schema explícito: public. Search path: public.';