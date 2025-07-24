-- Corrigir problemas críticos de segurança identificados

-- 1. Fixar funções críticas adicionando search_path seguro
DROP FUNCTION IF EXISTS public.update_solution_ratings_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_solution_ratings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.update_implementation_tab_progress_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_implementation_tab_progress_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.update_certificate_files_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_certificate_files_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.handle_learning_comment_like_change() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_learning_comment_like_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador quando curtida é adicionada
    UPDATE learning_comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador quando curtida é removida
    UPDATE learning_comments 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

DROP FUNCTION IF EXISTS public.update_topic_reply_count() CASCADE;
CREATE OR REPLACE FUNCTION public.update_topic_reply_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador quando post é criado
    UPDATE community_topics
    SET reply_count = reply_count + 1,
        last_activity_at = NOW()
    WHERE id = NEW.topic_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador quando post é deletado
    UPDATE community_topics
    SET reply_count = GREATEST(reply_count - 1, 0),
        last_activity_at = NOW()
    WHERE id = OLD.topic_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

DROP FUNCTION IF EXISTS public.update_category_topic_count() CASCADE;
CREATE OR REPLACE FUNCTION public.update_category_topic_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador quando tópico é criado
    UPDATE community_categories
    SET topic_count = topic_count + 1
    WHERE id = NEW.category_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador quando tópico é deletado
    UPDATE community_categories
    SET topic_count = GREATEST(topic_count - 1, 0)
    WHERE id = OLD.category_id;
    
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
    -- Atualizar contadores quando tópico muda de categoria
    UPDATE community_categories
    SET topic_count = GREATEST(topic_count - 1, 0)
    WHERE id = OLD.category_id;
    
    UPDATE community_categories
    SET topic_count = topic_count + 1
    WHERE id = NEW.category_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.notify_topic_author_on_reply() CASCADE;
CREATE OR REPLACE FUNCTION public.notify_topic_author_on_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  topic_author_id uuid;
  topic_title text;
  poster_name text;
BEGIN
  -- Buscar autor do tópico e título
  SELECT user_id, title INTO topic_author_id, topic_title
  FROM community_topics
  WHERE id = NEW.topic_id;
  
  -- Buscar nome de quem postou
  SELECT name INTO poster_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Só notificar se não for o próprio autor respondendo
  IF topic_author_id != NEW.user_id THEN
    PERFORM create_community_notification(
      topic_author_id,
      'Nova resposta no seu tópico',
      poster_name || ' respondeu no tópico "' || topic_title || '"',
      'community_reply',
      jsonb_build_object(
        'topic_id', NEW.topic_id,
        'post_id', NEW.id,
        'responder_id', NEW.user_id,
        'responder_name', poster_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. Corrigir funções com problemas de rate limiting
DROP FUNCTION IF EXISTS public.log_security_access CASCADE;
CREATE OR REPLACE FUNCTION public.log_security_access(
  p_table_name text,
  p_operation text,
  p_resource_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Rate limiting: máximo 100 logs por usuário por hora para evitar spam
  IF (
    SELECT COUNT(*) 
    FROM audit_logs 
    WHERE user_id = auth.uid() 
    AND timestamp > NOW() - INTERVAL '1 hour'
  ) > 100 THEN
    -- Silenciosamente ignorar se exceder rate limit
    RETURN;
  END IF;

  -- Inserir log de segurança
  INSERT INTO audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'security_access',
    p_operation,
    p_resource_id,
    jsonb_build_object(
      'table_name', p_table_name,
      'operation', p_operation,
      'resource_id', p_resource_id,
      'timestamp', NOW()
    ),
    'info'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Falhar silenciosamente para não quebrar operações normais
    NULL;
END;
$function$;

-- 3. Criar função para limpar timers não utilizados
CREATE OR REPLACE FUNCTION public.cleanup_stale_sessions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cleanup_count integer := 0;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Admin access required'
    );
  END IF;
  
  -- Limpar sessões antigas de rate limiting (mais de 24h)
  DELETE FROM rate_limits 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'cleaned_records', cleanup_count,
    'cleanup_time', NOW()
  );
END;
$function$;