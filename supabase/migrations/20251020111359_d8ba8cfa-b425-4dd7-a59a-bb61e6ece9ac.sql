-- ============================================
-- FASE 2: Sistema de Notificações Automáticas
-- ============================================

-- Adicionar colunas extras na tabela notifications se não existirem
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'social';

-- ============================================
-- FUNÇÃO: Notificar quando comentário recebe like
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_comment_liked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  comment_author_id UUID;
  liker_name TEXT;
  comment_content TEXT;
  table_prefix TEXT;
  comment_url TEXT;
BEGIN
  -- Determinar prefixo da tabela para buscar o comentário correto
  table_prefix := CASE 
    WHEN TG_TABLE_NAME = 'tool_comment_likes' THEN 'tool_comments'
    WHEN TG_TABLE_NAME = 'learning_comment_likes' THEN 'learning_comments'
    WHEN TG_TABLE_NAME = 'solution_comment_likes' THEN 'solution_comments'
  END;

  -- Buscar autor do comentário e conteúdo
  EXECUTE format(
    'SELECT user_id, content FROM %I WHERE id = $1',
    table_prefix
  ) USING NEW.comment_id
  INTO comment_author_id, comment_content;

  -- Não notificar se o usuário curtiu o próprio comentário
  IF comment_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Buscar nome de quem curtiu
  SELECT name INTO liker_name 
  FROM profiles 
  WHERE id = NEW.user_id;

  -- Definir URL de ação (simplificado, pode ser melhorado)
  comment_url := '/comments/' || NEW.comment_id;

  -- Criar notificação
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data,
    priority,
    action_url,
    category,
    created_at
  ) VALUES (
    comment_author_id,
    'comment_liked',
    'Novo like no seu comentário',
    liker_name || ' curtiu seu comentário',
    jsonb_build_object(
      'comment_id', NEW.comment_id,
      'liker_id', NEW.user_id,
      'liker_name', liker_name,
      'comment_preview', LEFT(comment_content, 100)
    ),
    3, -- Prioridade média
    comment_url,
    'social',
    NOW()
  );

  RETURN NEW;
END;
$$;

-- ============================================
-- FUNÇÃO: Notificar quando comentário recebe resposta
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_comment_replied()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_author_id UUID;
  replier_name TEXT;
  reply_content TEXT;
  comment_url TEXT;
BEGIN
  -- Só processar se for uma resposta (tem parent_id)
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Buscar autor do comentário pai
  EXECUTE format(
    'SELECT user_id FROM %I WHERE id = $1',
    TG_TABLE_NAME
  ) USING NEW.parent_id
  INTO parent_author_id;

  -- Não notificar se o usuário respondeu a si mesmo
  IF parent_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Buscar nome de quem respondeu
  SELECT name INTO replier_name 
  FROM profiles 
  WHERE id = NEW.user_id;

  -- Definir URL de ação
  comment_url := '/comments/' || NEW.parent_id;

  -- Criar notificação
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data,
    priority,
    action_url,
    category,
    created_at
  ) VALUES (
    parent_author_id,
    'comment_replied',
    'Nova resposta no seu comentário',
    replier_name || ' respondeu seu comentário',
    jsonb_build_object(
      'comment_id', NEW.id,
      'parent_id', NEW.parent_id,
      'replier_id', NEW.user_id,
      'replier_name', replier_name,
      'reply_preview', LEFT(NEW.content, 100)
    ),
    4, -- Prioridade alta (respostas são mais importantes que likes)
    comment_url,
    'social',
    NOW()
  );

  RETURN NEW;
END;
$$;

-- ============================================
-- APLICAR TRIGGERS EM TODAS AS TABELAS
-- ============================================

-- Triggers para LIKES
DROP TRIGGER IF EXISTS trigger_notify_tool_comment_liked ON public.tool_comment_likes;
CREATE TRIGGER trigger_notify_tool_comment_liked
  AFTER INSERT ON public.tool_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment_liked();

DROP TRIGGER IF EXISTS trigger_notify_learning_comment_liked ON public.learning_comment_likes;
CREATE TRIGGER trigger_notify_learning_comment_liked
  AFTER INSERT ON public.learning_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment_liked();

DROP TRIGGER IF EXISTS trigger_notify_solution_comment_liked ON public.solution_comment_likes;
CREATE TRIGGER trigger_notify_solution_comment_liked
  AFTER INSERT ON public.solution_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment_liked();

-- Triggers para RESPOSTAS
DROP TRIGGER IF EXISTS trigger_notify_tool_comment_replied ON public.tool_comments;
CREATE TRIGGER trigger_notify_tool_comment_replied
  AFTER INSERT ON public.tool_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment_replied();

DROP TRIGGER IF EXISTS trigger_notify_learning_comment_replied ON public.learning_comments;
CREATE TRIGGER trigger_notify_learning_comment_replied
  AFTER INSERT ON public.learning_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment_replied();

DROP TRIGGER IF EXISTS trigger_notify_solution_comment_replied ON public.solution_comments;
CREATE TRIGGER trigger_notify_solution_comment_replied
  AFTER INSERT ON public.solution_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment_replied();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON FUNCTION public.notify_comment_liked() IS 
'Cria notificação automática quando um comentário recebe like. Funciona para tool, learning e solution comments.';

COMMENT ON FUNCTION public.notify_comment_replied() IS 
'Cria notificação automática quando um comentário recebe resposta. Funciona para tool, learning e solution comments.';
