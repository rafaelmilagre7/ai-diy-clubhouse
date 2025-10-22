-- ============================================
-- FASE 4: NOTIFICAÇÕES DE FERRAMENTAS/SOLUÇÕES
-- ============================================

-- ============================================
-- TRIGGER: Nova ferramenta publicada
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_tool_published()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas se a ferramenta foi de não publicada para publicada
  IF (OLD.published = false AND NEW.published = true) OR (OLD.published IS NULL AND NEW.published = true) THEN
    -- Notificar todos os usuários ativos
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    SELECT 
      p.id,
      'tool_new_published',
      'Nova ferramenta disponível!',
      'A ferramenta "' || NEW.name || '" acabou de ser publicada.',
      jsonb_build_object(
        'tool_id', NEW.id,
        'tool_name', NEW.name,
        'category', NEW.category
      )
    FROM public.profiles p
    WHERE p.status = 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_tool_published ON public.tools;
CREATE TRIGGER trigger_new_tool_published
  AFTER UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_tool_published();

-- ============================================
-- TRIGGER: Ferramenta atualizada (para quem favoritou)
-- ============================================
CREATE OR REPLACE FUNCTION notify_tool_updated()
RETURNS TRIGGER AS $$
BEGIN
  -- Detectar mudanças significativas
  IF (OLD.description IS DISTINCT FROM NEW.description) OR 
     (OLD.features IS DISTINCT FROM NEW.features) OR
     (OLD.url IS DISTINCT FROM NEW.url) THEN
    
    -- Notificar usuários que favoritaram esta ferramenta
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    SELECT 
      tf.user_id,
      'tool_updated',
      'Ferramenta atualizada!',
      'A ferramenta "' || NEW.name || '" que você favoritou foi atualizada.',
      jsonb_build_object(
        'tool_id', NEW.id,
        'tool_name', NEW.name,
        'category', NEW.category
      )
    FROM public.tool_favorites tf
    WHERE tf.tool_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tool_updated ON public.tools;
CREATE TRIGGER trigger_tool_updated
  AFTER UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION notify_tool_updated();

-- ============================================
-- TRIGGER: Novo comentário em ferramenta
-- ============================================
CREATE OR REPLACE FUNCTION notify_tool_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  tool_record RECORD;
BEGIN
  -- Apenas se não for uma resposta (parent_id IS NULL)
  IF NEW.parent_id IS NULL THEN
    
    -- Buscar informações da ferramenta
    SELECT name, created_by INTO tool_record
    FROM public.tools
    WHERE id = NEW.tool_id;

    -- Notificar o criador da ferramenta (se não for ele mesmo comentando)
    IF tool_record.created_by IS NOT NULL AND tool_record.created_by != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, title, message, metadata)
      VALUES (
        tool_record.created_by,
        'tool_new_comment',
        'Novo comentário na sua ferramenta',
        'Alguém comentou na ferramenta "' || tool_record.name || '".',
        jsonb_build_object(
          'tool_id', NEW.tool_id,
          'tool_name', tool_record.name,
          'comment_id', NEW.id
        )
      );
    END IF;

    -- Notificar usuários que favoritaram (exceto o autor do comentário)
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    SELECT 
      tf.user_id,
      'tool_new_comment',
      'Novo comentário em ferramenta favorita',
      'Novo comentário na ferramenta "' || tool_record.name || '" que você favoritou.',
      jsonb_build_object(
        'tool_id', NEW.tool_id,
        'tool_name', tool_record.name,
        'comment_id', NEW.id
      )
    FROM public.tool_favorites tf
    WHERE tf.tool_id = NEW.tool_id
      AND tf.user_id != NEW.user_id
      AND tf.user_id != tool_record.created_by; -- Evitar duplicata com notificação do criador
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tool_new_comment ON public.tool_comments;
CREATE TRIGGER trigger_tool_new_comment
  AFTER INSERT ON public.tool_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_tool_new_comment();

-- ============================================
-- TRIGGER: Resposta a comentário em ferramenta
-- ============================================
CREATE OR REPLACE FUNCTION notify_tool_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  parent_comment_record RECORD;
  tool_record RECORD;
BEGIN
  -- Apenas se for uma resposta (tem parent_id)
  IF NEW.parent_id IS NOT NULL THEN
    
    -- Buscar comentário original
    SELECT user_id INTO parent_comment_record
    FROM public.tool_comments
    WHERE id = NEW.parent_id;

    -- Não notificar se o usuário está respondendo a si mesmo
    IF parent_comment_record.user_id != NEW.user_id THEN
      
      -- Buscar informações da ferramenta
      SELECT name INTO tool_record
      FROM public.tools
      WHERE id = NEW.tool_id;

      INSERT INTO public.notifications (user_id, type, title, message, metadata)
      VALUES (
        parent_comment_record.user_id,
        'tool_comment_reply',
        'Nova resposta ao seu comentário',
        'Alguém respondeu seu comentário na ferramenta "' || tool_record.name || '".',
        jsonb_build_object(
          'tool_id', NEW.tool_id,
          'tool_name', tool_record.name,
          'comment_id', NEW.id,
          'parent_comment_id', NEW.parent_id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tool_comment_reply ON public.tool_comments;
CREATE TRIGGER trigger_tool_comment_reply
  AFTER INSERT ON public.tool_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_tool_comment_reply();

-- ============================================
-- TRIGGER: Ferramenta aprovada (para o criador)
-- ============================================
CREATE OR REPLACE FUNCTION notify_tool_approved()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a ferramenta foi aprovada agora
  IF (OLD.status = 'pending' AND NEW.status = 'approved') THEN
    
    -- Notificar o criador
    IF NEW.created_by IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, metadata)
      VALUES (
        NEW.created_by,
        'tool_approved',
        'Ferramenta aprovada!',
        'Sua ferramenta "' || NEW.name || '" foi aprovada e está disponível na plataforma.',
        jsonb_build_object(
          'tool_id', NEW.id,
          'tool_name', NEW.name,
          'category', NEW.category
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tool_approved ON public.tools;
CREATE TRIGGER trigger_tool_approved
  AFTER UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION notify_tool_approved();

-- ============================================
-- TRIGGER: Ferramenta rejeitada (para o criador)
-- ============================================
CREATE OR REPLACE FUNCTION notify_tool_rejected()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a ferramenta foi rejeitada agora
  IF (OLD.status = 'pending' AND NEW.status = 'rejected') THEN
    
    -- Notificar o criador
    IF NEW.created_by IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, metadata)
      VALUES (
        NEW.created_by,
        'tool_rejected',
        'Ferramenta não aprovada',
        'Sua ferramenta "' || NEW.name || '" não foi aprovada. Verifique os motivos e tente novamente.',
        jsonb_build_object(
          'tool_id', NEW.id,
          'tool_name', NEW.name,
          'rejection_reason', NEW.rejection_reason
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tool_rejected ON public.tools;
CREATE TRIGGER trigger_tool_rejected
  AFTER UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION notify_tool_rejected();

-- ============================================
-- RPC: Recomendar ferramentas baseadas em uso
-- ============================================
CREATE OR REPLACE FUNCTION recommend_tools_for_user(p_user_id UUID)
RETURNS TABLE(
  tool_id UUID,
  tool_name TEXT,
  category TEXT,
  relevance_score INTEGER
) AS $$
BEGIN
  -- Encontrar ferramentas populares na mesma categoria das favoritas do usuário
  -- que ele ainda não favoritou
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.category,
    COUNT(tf2.id)::INTEGER as relevance_score
  FROM public.tools t
  LEFT JOIN public.tool_favorites tf2 ON t.id = tf2.tool_id
  WHERE t.published = true
    AND t.category IN (
      SELECT DISTINCT t2.category
      FROM public.tool_favorites tf1
      JOIN public.tools t2 ON tf1.tool_id = t2.id
      WHERE tf1.user_id = p_user_id
    )
    AND t.id NOT IN (
      SELECT tool_id FROM public.tool_favorites WHERE user_id = p_user_id
    )
  GROUP BY t.id, t.name, t.category
  ORDER BY relevance_score DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC: Notificar recomendações semanais
-- ============================================
CREATE OR REPLACE FUNCTION process_tool_recommendations()
RETURNS TABLE(
  user_id UUID,
  recommendations_count INTEGER
) AS $$
DECLARE
  user_record RECORD;
  recommendation_record RECORD;
  tool_list JSONB;
  rec_count INTEGER;
BEGIN
  -- Para cada usuário ativo que tem favoritos
  FOR user_record IN
    SELECT DISTINCT p.id
    FROM public.profiles p
    WHERE p.status = 'active'
      AND EXISTS (
        SELECT 1 FROM public.tool_favorites tf WHERE tf.user_id = p.id
      )
      -- Não notificou nas últimas 7 dias
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n
        WHERE n.user_id = p.id
          AND n.type = 'tool_recommendations'
          AND n.created_at > now() - interval '7 days'
      )
  LOOP
    -- Buscar recomendações
    tool_list := '[]'::jsonb;
    rec_count := 0;
    
    FOR recommendation_record IN
      SELECT * FROM recommend_tools_for_user(user_record.id)
    LOOP
      tool_list := tool_list || jsonb_build_object(
        'tool_id', recommendation_record.tool_id,
        'tool_name', recommendation_record.tool_name,
        'category', recommendation_record.category
      );
      rec_count := rec_count + 1;
    END LOOP;

    -- Se houver recomendações, criar notificação
    IF rec_count > 0 THEN
      INSERT INTO public.notifications (user_id, type, title, message, metadata)
      VALUES (
        user_record.id,
        'tool_recommendations',
        'Ferramentas recomendadas para você',
        'Encontramos ' || rec_count || ' ferramentas que você pode gostar baseadas nos seus interesses.',
        jsonb_build_object(
          'recommendations', tool_list,
          'count', rec_count
        )
      );

      user_id := user_record.id;
      recommendations_count := rec_count;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;