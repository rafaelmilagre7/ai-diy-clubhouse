-- ==========================================
-- FASE 2: NOTIFICAÇÕES DE ENGAGEMENT
-- ==========================================

-- ==========================================
-- 1. NOTIFICAÇÃO: NOVO MÓDULO EM CURSO INSCRITO
-- ==========================================
CREATE OR REPLACE FUNCTION notify_new_module_in_enrolled_course()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
  course_record record;
BEGIN
  -- Buscar informações do curso
  SELECT * INTO course_record FROM learning_courses WHERE id = NEW.course_id;
  
  -- Apenas notificar se o curso estiver publicado
  IF course_record.published = true THEN
    -- Notificar usuários que já têm progresso neste curso
    FOR user_record IN 
      SELECT DISTINCT lp.user_id
      FROM learning_progress lp
      JOIN learning_lessons ll ON ll.id = lp.lesson_id
      JOIN learning_modules lm ON lm.id = ll.module_id
      WHERE lm.course_id = course_record.id
    LOOP
      PERFORM create_notification(
        user_record.user_id,
        'new_module',
        '📂 Novo Módulo Adicionado!',
        'Um novo módulo "' || NEW.title || '" foi adicionado ao curso "' || course_record.title || '".',
        'learning',
        'normal',
        '/learning/courses/' || course_record.id,
        jsonb_build_object(
          'entity_id', NEW.id,
          'entity_type', 'module',
          'module_title', NEW.title,
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

-- Trigger para novo módulo
DROP TRIGGER IF EXISTS trigger_notify_new_module ON learning_modules;
CREATE TRIGGER trigger_notify_new_module
  AFTER INSERT ON learning_modules
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_module_in_enrolled_course();

-- ==========================================
-- 2. NOTIFICAÇÃO: COMENTÁRIO OFICIAL EM SUGESTÃO
-- ==========================================
CREATE OR REPLACE FUNCTION notify_official_suggestion_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suggestion_record record;
  commenter_name text;
  commenter_is_admin boolean;
BEGIN
  -- Verificar se o comentador é admin
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = NEW.user_id AND ur.name = 'admin'
  ) INTO commenter_is_admin;
  
  -- Apenas notificar se for comentário oficial de admin
  IF commenter_is_admin THEN
    -- Buscar informações da sugestão
    SELECT * INTO suggestion_record FROM suggestions WHERE id = NEW.suggestion_id;
    
    -- Buscar nome do comentador
    SELECT name INTO commenter_name FROM profiles WHERE id = NEW.user_id;
    
    -- Notificar o autor da sugestão (se não for ele mesmo)
    IF suggestion_record.user_id != NEW.user_id THEN
      PERFORM create_notification(
        suggestion_record.user_id,
        'official_suggestion_comment',
        '📢 Resposta Oficial na Sua Sugestão!',
        'A equipe respondeu sua sugestão "' || suggestion_record.title || '".',
        'suggestions',
        'high',
        '/suggestions/' || suggestion_record.id,
        jsonb_build_object(
          'entity_id', NEW.id,
          'entity_type', 'suggestion_comment',
          'suggestion_title', suggestion_record.title,
          'suggestion_id', suggestion_record.id,
          'commenter_name', commenter_name,
          'preview', COALESCE(substring(NEW.content from 1 for 100), '')
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para comentário oficial em sugestão
DROP TRIGGER IF EXISTS trigger_notify_official_comment ON suggestion_comments;
CREATE TRIGGER trigger_notify_official_comment
  AFTER INSERT ON suggestion_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_official_suggestion_comment();

-- ==========================================
-- 3. NOTIFICAÇÃO: MENÇÃO NA COMUNIDADE
-- ==========================================
CREATE OR REPLACE FUNCTION notify_community_mention()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mentioned_user_id uuid;
  mentioned_username text;
  topic_record record;
  author_name text;
BEGIN
  -- Buscar informações do tópico
  SELECT * INTO topic_record FROM community_topics WHERE id = NEW.topic_id;
  
  -- Buscar nome do autor
  SELECT name INTO author_name FROM profiles WHERE id = NEW.user_id;
  
  -- Procurar menções no formato @username no conteúdo
  -- Extrair todos os @mentions do conteúdo
  FOR mentioned_username IN
    SELECT DISTINCT regexp_matches[1]
    FROM regexp_matches(NEW.content, '@([a-zA-Z0-9_]+)', 'g') AS regexp_matches
  LOOP
    -- Buscar ID do usuário mencionado pelo nome
    SELECT id INTO mentioned_user_id 
    FROM profiles 
    WHERE LOWER(name) = LOWER(mentioned_username)
    LIMIT 1;
    
    -- Se encontrou o usuário e não é o autor do post
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.user_id THEN
      PERFORM create_notification(
        mentioned_user_id,
        'community_mention',
        '👤 Você Foi Mencionado!',
        author_name || ' mencionou você em "' || topic_record.title || '".',
        'community',
        'normal',
        '/community/topics/' || topic_record.id,
        jsonb_build_object(
          'entity_id', NEW.id,
          'entity_type', 'community_post',
          'topic_title', topic_record.title,
          'topic_id', topic_record.id,
          'author_name', author_name,
          'preview', COALESCE(substring(NEW.content from 1 for 100), '')
        )
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger para menções na comunidade
DROP TRIGGER IF EXISTS trigger_notify_mention ON community_posts;
CREATE TRIGGER trigger_notify_mention
  AFTER INSERT ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_community_mention();

-- ==========================================
-- 4. NOTIFICAÇÃO: CERTIFICADO DISPONÍVEL
-- ==========================================
CREATE OR REPLACE FUNCTION notify_certificate_available()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  solution_title text;
BEGIN
  -- Buscar título da solução
  SELECT title INTO solution_title FROM solutions WHERE id = NEW.solution_id;
  
  -- Notificar o usuário que o certificado está disponível
  PERFORM create_notification(
    NEW.user_id,
    'certificate_available',
    '🎖️ Seu Certificado Está Pronto!',
    'Parabéns! Seu certificado de "' || solution_title || '" está disponível para download.',
    'certificates',
    'high',
    '/certificates/' || NEW.id,
    jsonb_build_object(
      'entity_id', NEW.id,
      'entity_type', 'certificate',
      'solution_title', solution_title,
      'solution_id', NEW.solution_id,
      'validation_code', NEW.validation_code
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger para certificado disponível
DROP TRIGGER IF EXISTS trigger_notify_certificate ON solution_certificates;
CREATE TRIGGER trigger_notify_certificate
  AFTER INSERT ON solution_certificates
  FOR EACH ROW
  EXECUTE FUNCTION notify_certificate_available();

-- ==========================================
-- 5. TABELA PARA CONTROLE DE LEMBRETES DE EVENTOS
-- ==========================================
CREATE TABLE IF NOT EXISTS event_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type IN ('24h', '1h')),
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, user_id, reminder_type)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_event_reminders_event 
  ON event_reminders(event_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_event_reminders_pending 
  ON event_reminders(user_id, sent_at) 
  WHERE sent_at IS NULL;

-- RLS para event_reminders
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS event_reminders_user_access ON event_reminders;
CREATE POLICY event_reminders_user_access ON event_reminders
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==========================================
-- 6. FUNÇÃO PARA CRIAR LEMBRETES AUTOMÁTICOS
-- ==========================================
CREATE OR REPLACE FUNCTION create_event_reminders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
BEGIN
  -- Criar lembretes para todos os usuários (exceto o criador se ele não quiser)
  FOR user_record IN 
    SELECT DISTINCT id FROM profiles WHERE id IS NOT NULL
  LOOP
    -- Criar lembretes de 24h e 1h antes
    INSERT INTO event_reminders (event_id, user_id, reminder_type)
    VALUES 
      (NEW.id, user_record.id, '24h'),
      (NEW.id, user_record.id, '1h')
    ON CONFLICT (event_id, user_id, reminder_type) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger para criar lembretes quando evento é criado
DROP TRIGGER IF EXISTS trigger_create_event_reminders ON events;
CREATE TRIGGER trigger_create_event_reminders
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION create_event_reminders();

-- ==========================================
-- FUNÇÃO PARA PROCESSAR LEMBRETES PENDENTES
-- (Será chamada por Edge Function periodicamente)
-- ==========================================
CREATE OR REPLACE FUNCTION process_event_reminders()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reminder_record record;
  event_record record;
  processed_count integer := 0;
  notification_id uuid;
BEGIN
  -- Processar lembretes de 24h antes
  FOR reminder_record IN
    SELECT er.*, e.title, e.start_time, e.location_link, e.physical_location
    FROM event_reminders er
    JOIN events e ON e.id = er.event_id
    WHERE er.sent_at IS NULL
      AND er.reminder_type = '24h'
      AND e.start_time <= (now() + interval '24 hours 5 minutes')
      AND e.start_time > (now() + interval '23 hours 55 minutes')
  LOOP
    -- Criar notificação
    notification_id := create_notification(
      reminder_record.user_id,
      'event_reminder_24h',
      '📅 Evento Amanhã!',
      'Lembrete: "' || reminder_record.title || '" acontece amanhã às ' || 
        to_char(reminder_record.start_time, 'HH24:MI') || '.',
      'events',
      'normal',
      '/events/' || reminder_record.event_id,
      jsonb_build_object(
        'entity_id', reminder_record.event_id,
        'entity_type', 'event',
        'event_title', reminder_record.title,
        'start_time', reminder_record.start_time,
        'location_link', reminder_record.location_link,
        'physical_location', reminder_record.physical_location
      )
    );
    
    -- Marcar lembrete como enviado
    UPDATE event_reminders 
    SET sent_at = now() 
    WHERE id = reminder_record.id;
    
    processed_count := processed_count + 1;
  END LOOP;
  
  -- Processar lembretes de 1h antes
  FOR reminder_record IN
    SELECT er.*, e.title, e.start_time, e.location_link, e.physical_location
    FROM event_reminders er
    JOIN events e ON e.id = er.event_id
    WHERE er.sent_at IS NULL
      AND er.reminder_type = '1h'
      AND e.start_time <= (now() + interval '1 hour 5 minutes')
      AND e.start_time > (now() + interval '55 minutes')
  LOOP
    -- Criar notificação
    notification_id := create_notification(
      reminder_record.user_id,
      'event_reminder_1h',
      '⏰ Evento em 1 Hora!',
      '"' || reminder_record.title || '" começa em 1 hora!',
      'events',
      'high',
      '/events/' || reminder_record.event_id,
      jsonb_build_object(
        'entity_id', reminder_record.event_id,
        'entity_type', 'event',
        'event_title', reminder_record.title,
        'start_time', reminder_record.start_time,
        'location_link', reminder_record.location_link,
        'physical_location', reminder_record.physical_location
      )
    );
    
    -- Marcar lembrete como enviado
    UPDATE event_reminders 
    SET sent_at = now() 
    WHERE id = reminder_record.id;
    
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'processed_count', processed_count,
    'timestamp', now()
  );
END;
$$;