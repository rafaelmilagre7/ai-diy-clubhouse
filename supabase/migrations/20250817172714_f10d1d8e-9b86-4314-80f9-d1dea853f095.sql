-- Corrigir função de deleção de tópico com parâmetro desambiguado
DROP FUNCTION IF EXISTS public.delete_community_topic(uuid);

CREATE OR REPLACE FUNCTION public.delete_community_topic(p_topic_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_topic_owner uuid;
  v_is_admin boolean := false;
  v_deleted_posts integer := 0;
BEGIN
  -- Obter ID do usuário atual
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não autenticado'
    );
  END IF;
  
  -- Verificar se o tópico existe e obter o proprietário
  SELECT user_id INTO v_topic_owner
  FROM public.community_topics
  WHERE id = p_topic_id;
  
  IF v_topic_owner IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Tópico não encontrado'
    );
  END IF;
  
  -- Verificar se é admin
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = v_user_id AND ur.name = 'admin'
  ) INTO v_is_admin;
  
  -- Verificar permissões: admin ou dono do tópico
  IF NOT v_is_admin AND v_user_id != v_topic_owner THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Sem permissão para deletar este tópico'
    );
  END IF;
  
  -- Deletar posts relacionados primeiro
  DELETE FROM public.community_posts 
  WHERE topic_id = p_topic_id;
  
  GET DIAGNOSTICS v_deleted_posts = ROW_COUNT;
  
  -- Deletar o tópico
  DELETE FROM public.community_topics 
  WHERE id = p_topic_id;
  
  -- Registrar no audit log
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    v_user_id,
    'moderation',
    'topic_deleted',
    jsonb_build_object(
      'topic_id', p_topic_id,
      'topic_owner', v_topic_owner,
      'deleted_posts', v_deleted_posts,
      'deleted_by_admin', v_is_admin
    ),
    'info'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Tópico deletado com sucesso',
    'deleted_posts', v_deleted_posts
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro interno ao deletar tópico: ' || SQLERRM
    );
END;
$$;