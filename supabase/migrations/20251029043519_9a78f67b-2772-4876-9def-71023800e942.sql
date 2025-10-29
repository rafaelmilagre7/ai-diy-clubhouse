-- Criar função RPC segura para criar posts na comunidade
-- Esta função usa SECURITY DEFINER para bypass de problemas de permissão

CREATE OR REPLACE FUNCTION public.create_community_post_secure(
  p_topic_id uuid,
  p_content text,
  p_parent_id uuid DEFAULT NULL
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
  v_post record;
BEGIN
  -- Pegar usuário da sessão atual
  v_user_id := auth.uid();
  
  -- Validar autenticação
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Validar conteúdo
  IF p_content IS NULL OR trim(p_content) = '' THEN
    RAISE EXCEPTION 'Conteúdo não pode estar vazio';
  END IF;
  
  -- Verificar se tópico existe e permite posts
  IF NOT EXISTS (SELECT 1 FROM public.community_topics WHERE id = p_topic_id) THEN
    RAISE EXCEPTION 'Tópico não encontrado';
  END IF;
  
  IF NOT topic_allows_posts(p_topic_id) THEN
    RAISE EXCEPTION 'Tópico está bloqueado para novos posts';
  END IF;
  
  -- Inserir post com privilégios elevados
  INSERT INTO public.community_posts (topic_id, user_id, content, parent_id)
  VALUES (p_topic_id, v_user_id, trim(p_content), p_parent_id)
  RETURNING * INTO v_post;
  
  -- Incrementar contador de respostas
  PERFORM increment_topic_replies(p_topic_id);
  
  -- Atualizar última atividade do tópico
  UPDATE public.community_topics
  SET last_activity_at = now()
  WHERE id = p_topic_id;
  
  -- Retornar post criado
  RETURN row_to_json(v_post);
END;
$$;

-- Dar permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.create_community_post_secure(uuid, text, uuid) TO authenticated;

-- Adicionar comentário explicativo
COMMENT ON FUNCTION public.create_community_post_secure IS 'Função segura para criar posts na comunidade. Usa SECURITY DEFINER para bypass de problemas de permissão, mas mantém validações de segurança.';