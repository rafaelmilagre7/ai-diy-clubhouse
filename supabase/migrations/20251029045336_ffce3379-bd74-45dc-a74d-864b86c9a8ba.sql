-- ============================================
-- CORREÇÃO DEFINITIVA COM DROP CASCADE
-- Versão: 2025-10-29T04:52:00Z
-- ============================================

-- 1. DROPAR políticas que dependem das funções
DROP POLICY IF EXISTS forum_posts_secure_insert_v2 ON public.community_posts;

-- 2. DROPAR funções existentes
DROP FUNCTION IF EXISTS public.topic_allows_posts(uuid);
DROP FUNCTION IF EXISTS public.increment_topic_replies(uuid);
DROP FUNCTION IF EXISTS public.create_community_post_secure(uuid, text, uuid);

-- 3. RECRIAR topic_allows_posts COM SINTAXE CORRETA
CREATE FUNCTION public.topic_allows_posts(_topic_id uuid)
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

-- 4. RECRIAR increment_topic_replies COM SINTAXE CORRETA
CREATE FUNCTION public.increment_topic_replies(topic_id uuid)
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

-- 5. RECRIAR create_community_post_secure COM SINTAXE CORRETA E LOGS
CREATE FUNCTION public.create_community_post_secure(
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
  
  RAISE NOTICE '[RPC] Usuário: %, Tópico: %', v_user_id, p_topic_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  IF p_content IS NULL OR trim(p_content) = '' THEN
    RAISE EXCEPTION 'Conteúdo não pode estar vazio';
  END IF;
  
  -- Verificar se tópico existe
  IF NOT EXISTS (SELECT 1 FROM public.community_topics WHERE id = p_topic_id) THEN
    RAISE EXCEPTION 'Tópico não encontrado: %', p_topic_id;
  END IF;
  
  -- Verificar se tópico permite posts
  IF NOT topic_allows_posts(p_topic_id) THEN
    RAISE EXCEPTION 'Tópico está bloqueado para novos posts';
  END IF;
  
  RAISE NOTICE '[RPC] Inserindo post...';
  
  -- Inserir post
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

-- 6. RECRIAR política RLS com a função corrigida
CREATE POLICY forum_posts_secure_insert_v2
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND topic_allows_posts(topic_id)
);

-- 7. GARANTIR PERMISSÕES
GRANT EXECUTE ON FUNCTION public.topic_allows_posts TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.increment_topic_replies TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_community_post_secure TO authenticated;

-- 8. DOCUMENTAÇÃO
COMMENT ON FUNCTION public.topic_allows_posts IS 
'Verifica se um tópico permite novos posts (não está bloqueado)';

COMMENT ON FUNCTION public.increment_topic_replies IS 
'Incrementa o contador de respostas de um tópico';

COMMENT ON FUNCTION public.create_community_post_secure IS 
'Cria post na comunidade com SECURITY DEFINER. Sintaxe correta: SET search_path = public (sem TO, sem aspas)';