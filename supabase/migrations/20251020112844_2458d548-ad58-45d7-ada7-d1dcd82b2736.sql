-- ==========================================
-- FASE 1: SISTEMA DE NOTIFICAÇÕES AUTOMÁTICAS
-- ==========================================

-- Função auxiliar para criar notificações
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_category text DEFAULT 'general',
  p_priority text DEFAULT 'normal',
  p_action_url text DEFAULT NULL,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    category,
    priority,
    action_url,
    data,
    is_read,
    created_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_category,
    p_priority,
    p_action_url,
    p_data,
    false,
    now()
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- ==========================================
-- 1. NOTIFICAÇÃO: NOVO CURSO PUBLICADO
-- ==========================================
CREATE OR REPLACE FUNCTION notify_new_course()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
BEGIN
  -- Apenas notificar quando um curso for publicado (não em draft)
  IF NEW.published = true AND (OLD.published IS NULL OR OLD.published = false) THEN
    -- Notificar todos os usuários autenticados
    FOR user_record IN 
      SELECT DISTINCT id FROM profiles WHERE id IS NOT NULL
    LOOP
      PERFORM create_notification(
        user_record.id,
        'new_course',
        '🎓 Novo Curso Disponível!',
        'O curso "' || NEW.title || '" acabou de ser publicado.',
        'learning',
        'high',
        '/learning/courses/' || NEW.id,
        jsonb_build_object(
          'entity_id', NEW.id,
          'entity_type', 'course',
          'course_title', NEW.title,
          'preview', COALESCE(substring(NEW.description from 1 for 100), '')
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para novo curso
DROP TRIGGER IF EXISTS trigger_notify_new_course ON learning_courses;
CREATE TRIGGER trigger_notify_new_course
  AFTER INSERT OR UPDATE OF published ON learning_courses
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_course();

-- ==========================================
-- 2. NOTIFICAÇÃO: NOVA AULA EM CURSO INSCRITO
-- ==========================================
CREATE OR REPLACE FUNCTION notify_new_lesson_in_enrolled_course()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
  course_record record;
  module_record record;
BEGIN
  -- Buscar informações do módulo e curso
  SELECT * INTO module_record FROM learning_modules WHERE id = NEW.module_id;
  SELECT * INTO course_record FROM learning_courses WHERE id = module_record.course_id;
  
  -- Apenas notificar se o curso estiver publicado
  IF course_record.published = true THEN
    -- Notificar usuários que já têm progresso neste curso
    FOR user_record IN 
      SELECT DISTINCT lp.user_id, p.name
      FROM learning_progress lp
      JOIN profiles p ON p.id = lp.user_id
      WHERE lp.lesson_id IN (
        SELECT ll.id 
        FROM learning_lessons ll
        JOIN learning_modules lm ON lm.id = ll.module_id
        WHERE lm.course_id = course_record.id
      )
    LOOP
      PERFORM create_notification(
        user_record.user_id,
        'new_lesson',
        '📚 Nova Aula Adicionada!',
        'Uma nova aula "' || NEW.title || '" foi adicionada ao curso "' || course_record.title || '".',
        'learning',
        'normal',
        '/learning/lessons/' || NEW.id,
        jsonb_build_object(
          'entity_id', NEW.id,
          'entity_type', 'lesson',
          'lesson_title', NEW.title,
          'course_title', course_record.title,
          'course_id', course_record.id,
          'preview', COALESCE(substring(NEW.description from 1 for 100), '')
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para nova aula
DROP TRIGGER IF EXISTS trigger_notify_new_lesson ON learning_lessons;
CREATE TRIGGER trigger_notify_new_lesson
  AFTER INSERT ON learning_lessons
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lesson_in_enrolled_course();

-- ==========================================
-- 3. NOTIFICAÇÃO: NOVA SOLUÇÃO CADASTRADA
-- ==========================================
CREATE OR REPLACE FUNCTION notify_new_solution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
BEGIN
  -- Apenas notificar se a solução estiver ativa
  IF NEW.is_active = true THEN
    -- Notificar todos os usuários
    FOR user_record IN 
      SELECT DISTINCT id FROM profiles WHERE id IS NOT NULL
    LOOP
      PERFORM create_notification(
        user_record.id,
        'new_solution',
        '💡 Nova Solução Disponível!',
        'A solução "' || NEW.title || '" acabou de ser cadastrada na categoria ' || NEW.category || '.',
        'solutions',
        'high',
        '/solutions/' || NEW.id,
        jsonb_build_object(
          'entity_id', NEW.id,
          'entity_type', 'solution',
          'solution_title', NEW.title,
          'category', NEW.category,
          'preview', COALESCE(substring(NEW.description from 1 for 100), '')
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para nova solução
DROP TRIGGER IF EXISTS trigger_notify_new_solution ON solutions;
CREATE TRIGGER trigger_notify_new_solution
  AFTER INSERT ON solutions
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_solution();

-- ==========================================
-- 4. NOTIFICAÇÃO: MUDANÇA DE STATUS EM SUGESTÃO
-- ==========================================
CREATE OR REPLACE FUNCTION notify_suggestion_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status_labels jsonb;
  status_label text;
  user_name text;
BEGIN
  -- Apenas notificar se o status realmente mudou
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Mapear status para labels amigáveis
    status_labels := '{
      "new": "Nova",
      "under_review": "Em Análise",
      "in_development": "Em Desenvolvimento",
      "completed": "Implementada",
      "declined": "Recusada"
    }'::jsonb;
    
    status_label := COALESCE(status_labels->>NEW.status, NEW.status);
    
    -- Buscar nome do usuário
    SELECT name INTO user_name FROM profiles WHERE id = NEW.user_id;
    
    -- Notificar o autor da sugestão
    PERFORM create_notification(
      NEW.user_id,
      'suggestion_status_change',
      '📋 Sua Sugestão Mudou de Status!',
      'Sua sugestão "' || NEW.title || '" agora está: ' || status_label || '.',
      'suggestions',
      CASE 
        WHEN NEW.status IN ('completed', 'in_development') THEN 'high'
        ELSE 'normal'
      END,
      '/suggestions/' || NEW.id,
      jsonb_build_object(
        'entity_id', NEW.id,
        'entity_type', 'suggestion',
        'suggestion_title', NEW.title,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'status_label', status_label,
        'preview', COALESCE(substring(NEW.description from 1 for 100), '')
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para mudança de status em sugestão
DROP TRIGGER IF EXISTS trigger_notify_suggestion_status ON suggestions;
CREATE TRIGGER trigger_notify_suggestion_status
  AFTER UPDATE OF status ON suggestions
  FOR EACH ROW
  EXECUTE FUNCTION notify_suggestion_status_change();

-- ==========================================
-- 5. NOTIFICAÇÃO: TÓPICO DA COMUNIDADE RESOLVIDO
-- ==========================================
CREATE OR REPLACE FUNCTION notify_topic_solved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  solver_name text;
BEGIN
  -- Apenas notificar quando tópico for marcado como resolvido
  IF NEW.is_solved = true AND (OLD.is_solved IS NULL OR OLD.is_solved = false) THEN
    -- Buscar nome de quem resolveu (se houver um post marcado como solution)
    SELECT p.name INTO solver_name
    FROM community_posts cp
    JOIN profiles p ON p.id = cp.user_id
    WHERE cp.topic_id = NEW.id AND cp.is_solution = true
    LIMIT 1;
    
    -- Notificar o autor do tópico
    PERFORM create_notification(
      NEW.user_id,
      'topic_solved',
      '✅ Seu Tópico Foi Resolvido!',
      'Seu tópico "' || NEW.title || '" foi marcado como resolvido' || 
      CASE 
        WHEN solver_name IS NOT NULL THEN ' por ' || solver_name || '!'
        ELSE '!'
      END,
      'community',
      'high',
      '/community/topics/' || NEW.id,
      jsonb_build_object(
        'entity_id', NEW.id,
        'entity_type', 'topic',
        'topic_title', NEW.title,
        'solver_name', solver_name,
        'preview', COALESCE(substring(NEW.content from 1 for 100), '')
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para tópico resolvido
DROP TRIGGER IF EXISTS trigger_notify_topic_solved ON community_topics;
CREATE TRIGGER trigger_notify_topic_solved
  AFTER UPDATE OF is_solved ON community_topics
  FOR EACH ROW
  EXECUTE FUNCTION notify_topic_solved();

-- ==========================================
-- ÍNDICES PARA PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_category 
  ON notifications(user_id, category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, is_read, created_at DESC) 
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_type_created 
  ON notifications(type, created_at DESC);