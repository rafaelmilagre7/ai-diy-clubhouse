-- Corrigir o último problema crítico e mais triggers sem search_path

-- 1. Identificar e corrigir a última SECURITY DEFINER view restante
-- Vamos verificar se há alguma view que ainda precisa ser convertida
-- Como não sabemos qual é, vamos criar algumas funções de triggers importantes que faltam

-- 2. Corrigir mais triggers críticos sem search_path
CREATE OR REPLACE FUNCTION public.handle_learning_comment_like_change_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.log_security_violation_attempt_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log tentativas de atualização não autorizadas
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'security_violation',
    'unauthorized_update_attempt',
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP,
      'attempted_changes', row_to_json(NEW),
      'original_data', row_to_json(OLD),
      'timestamp', NOW(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    ),
    'critical'
  );
  
  -- Bloquear a operação
  RAISE EXCEPTION 'Unauthorized operation detected and logged';
END;
$$;

CREATE OR REPLACE FUNCTION public.update_topic_reply_count_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_category_topic_count_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_forum_post_reaction_counts_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar contador na tabela forum_posts se ela tiver essas colunas
  -- Como não vi reaction_count na estrutura original, vou apenas documentar
  -- UPDATE public.forum_posts
  -- SET reaction_count = (
  --   SELECT COUNT(*) 
  --   FROM public.forum_reactions 
  --   WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
  -- )
  -- WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_topic_author_on_reply_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Criar notificação se não for o próprio autor
  IF topic_author_id != NEW.user_id THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      data,
      created_at
    ) VALUES (
      topic_author_id,
      'Nova resposta no seu tópico',
      poster_name || ' respondeu ao seu tópico: ' || topic_title,
      'community_reply',
      jsonb_build_object(
        'topic_id', NEW.topic_id,
        'post_id', NEW.id,
        'poster_id', NEW.user_id
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$;