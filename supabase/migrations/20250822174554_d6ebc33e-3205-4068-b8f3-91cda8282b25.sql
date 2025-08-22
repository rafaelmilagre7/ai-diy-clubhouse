-- Adicionar campo para rastreamento de resposta do admin na tabela learning_comments
ALTER TABLE public.learning_comments 
ADD COLUMN admin_replied boolean DEFAULT false;

-- Adicionar índice para melhor performance nas consultas de comentários do admin
CREATE INDEX idx_learning_comments_admin_replied ON public.learning_comments(admin_replied);

-- Criar função para obter estatísticas de comentários para admin
CREATE OR REPLACE FUNCTION public.get_admin_comment_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_comments integer;
  replied_comments integer;
  pending_comments integer;
  stats jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_safe(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado - apenas administradores');
  END IF;
  
  -- Contar total de comentários
  SELECT COUNT(*) INTO total_comments
  FROM public.learning_comments;
  
  -- Contar comentários respondidos
  SELECT COUNT(*) INTO replied_comments
  FROM public.learning_comments
  WHERE admin_replied = true;
  
  -- Contar comentários pendentes
  SELECT COUNT(*) INTO pending_comments
  FROM public.learning_comments
  WHERE admin_replied = false;
  
  stats := jsonb_build_object(
    'total_comments', total_comments,
    'replied_comments', replied_comments,
    'pending_comments', pending_comments,
    'reply_rate', CASE 
      WHEN total_comments > 0 
      THEN ROUND((replied_comments::numeric / total_comments::numeric) * 100, 1)
      ELSE 0 
    END
  );
  
  RETURN stats;
END;
$function$;

-- Criar função para obter comentários com dados enriquecidos para admin
CREATE OR REPLACE FUNCTION public.get_admin_learning_comments(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_course_id uuid DEFAULT NULL,
  p_lesson_id uuid DEFAULT NULL,
  p_status text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  content text,
  user_id uuid,
  lesson_id uuid,
  parent_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  admin_replied boolean,
  user_name text,
  user_avatar_url text,
  lesson_title text,
  module_title text,
  course_title text,
  replies_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;
  
  RETURN QUERY
  SELECT 
    lc.id,
    lc.content,
    lc.user_id,
    lc.lesson_id,
    lc.parent_id,
    lc.created_at,
    lc.updated_at,
    lc.admin_replied,
    p.name as user_name,
    p.avatar_url as user_avatar_url,
    ll.title as lesson_title,
    lm.title as module_title,
    lcourse.title as course_title,
    COUNT(replies.id) as replies_count
  FROM public.learning_comments lc
  LEFT JOIN public.profiles p ON lc.user_id = p.id
  LEFT JOIN public.learning_lessons ll ON lc.lesson_id = ll.id
  LEFT JOIN public.learning_modules lm ON ll.module_id = lm.id
  LEFT JOIN public.learning_courses lcourse ON lm.course_id = lcourse.id
  LEFT JOIN public.learning_comments replies ON replies.parent_id = lc.id
  WHERE 
    (p_course_id IS NULL OR lcourse.id = p_course_id)
    AND (p_lesson_id IS NULL OR lc.lesson_id = p_lesson_id)
    AND (p_status IS NULL OR 
         (p_status = 'replied' AND lc.admin_replied = true) OR
         (p_status = 'pending' AND lc.admin_replied = false))
    AND lc.parent_id IS NULL -- Apenas comentários principais
  GROUP BY lc.id, p.name, p.avatar_url, ll.title, lm.title, lcourse.title
  ORDER BY lc.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;

-- Criar função para marcar comentário como respondido
CREATE OR REPLACE FUNCTION public.mark_comment_as_replied(p_comment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_safe(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado - apenas administradores');
  END IF;
  
  -- Atualizar o comentário
  UPDATE public.learning_comments
  SET admin_replied = true, updated_at = now()
  WHERE id = p_comment_id;
  
  -- Log da ação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    auth.uid(),
    'admin_action',
    'comment_marked_replied',
    jsonb_build_object(
      'comment_id', p_comment_id,
      'timestamp', now()
    )
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Comentário marcado como respondido');
END;
$function$;