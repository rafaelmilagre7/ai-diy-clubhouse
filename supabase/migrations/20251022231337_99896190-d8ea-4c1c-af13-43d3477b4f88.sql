-- =============================================================================
-- PREFERÊNCIAS DE NOTIFICAÇÕES - SISTEMA COMPLETO
-- Adiciona colunas para controlar todas as 34 notificações implementadas
-- Por padrão, TUDO vem ATIVADO (TRUE)
-- =============================================================================

-- Adicionar colunas de preferências por categoria (todas TRUE por padrão)

-- === FASE 1: SUGESTÕES ===
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS suggestions_new_suggestion BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS suggestions_status_changed BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS suggestions_new_comment BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS suggestions_comment_reply BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS suggestions_upvoted BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS suggestions_milestone BOOLEAN DEFAULT TRUE;

-- === FASE 2: SOLUÇÕES ===
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS solutions_new_solution BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS solutions_updated BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS solutions_new_comment BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS solutions_reply BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS solutions_access_granted BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS solutions_weekly_digest BOOLEAN DEFAULT TRUE;

-- === FASE 3: EVENTOS ===
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS events_new_event BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS events_reminder BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS events_registration_confirmed BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS events_updated BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS events_cancelled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS events_starting_soon BOOLEAN DEFAULT TRUE;

-- === FASE 4: SISTEMA & ADMIN ===
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS system_maintenance BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS system_new_feature BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS system_security_alert BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS admin_broadcast BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS admin_direct_message BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS user_role_changed BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS user_achievement BOOLEAN DEFAULT TRUE;

-- === FASE 5: COMUNIDADE ===
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS community_new_topic BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS community_topic_reply BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS community_post_reply BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS community_topic_solved BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS community_topic_pinned BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS community_mention BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS community_post_liked BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS community_moderated BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS community_weekly_digest BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS community_achievement BOOLEAN DEFAULT TRUE;

-- === CANAIS DE ENTREGA ===
-- Garantir que os canais existem e estão ativados por padrão
ALTER TABLE notification_preferences
ALTER COLUMN email_enabled SET DEFAULT TRUE,
ALTER COLUMN whatsapp_enabled SET DEFAULT TRUE,
ALTER COLUMN admin_communications_email SET DEFAULT TRUE,
ALTER COLUMN admin_communications_inapp SET DEFAULT TRUE;

-- Adicionar coluna para notificações in-app (se não existir)
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS in_app_enabled BOOLEAN DEFAULT TRUE;

-- === CONFIGURAÇÕES AVANÇADAS ===
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS digest_frequency TEXT DEFAULT 'instant',
ADD COLUMN IF NOT EXISTS quiet_hours_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '22:00',
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '08:00';

-- Atualizar registros existentes para garantir que tudo está ativado
UPDATE notification_preferences
SET 
  -- Fase 1: Sugestões
  suggestions_new_suggestion = COALESCE(suggestions_new_suggestion, TRUE),
  suggestions_status_changed = COALESCE(suggestions_status_changed, TRUE),
  suggestions_new_comment = COALESCE(suggestions_new_comment, TRUE),
  suggestions_comment_reply = COALESCE(suggestions_comment_reply, TRUE),
  suggestions_upvoted = COALESCE(suggestions_upvoted, TRUE),
  suggestions_milestone = COALESCE(suggestions_milestone, TRUE),
  
  -- Fase 2: Soluções
  solutions_new_solution = COALESCE(solutions_new_solution, TRUE),
  solutions_updated = COALESCE(solutions_updated, TRUE),
  solutions_new_comment = COALESCE(solutions_new_comment, TRUE),
  solutions_reply = COALESCE(solutions_reply, TRUE),
  solutions_access_granted = COALESCE(solutions_access_granted, TRUE),
  solutions_weekly_digest = COALESCE(solutions_weekly_digest, TRUE),
  
  -- Fase 3: Eventos
  events_new_event = COALESCE(events_new_event, TRUE),
  events_reminder = COALESCE(events_reminder, TRUE),
  events_registration_confirmed = COALESCE(events_registration_confirmed, TRUE),
  events_updated = COALESCE(events_updated, TRUE),
  events_cancelled = COALESCE(events_cancelled, TRUE),
  events_starting_soon = COALESCE(events_starting_soon, TRUE),
  
  -- Fase 4: Sistema & Admin
  system_maintenance = COALESCE(system_maintenance, TRUE),
  system_new_feature = COALESCE(system_new_feature, TRUE),
  system_security_alert = COALESCE(system_security_alert, TRUE),
  admin_broadcast = COALESCE(admin_broadcast, TRUE),
  admin_direct_message = COALESCE(admin_direct_message, TRUE),
  user_role_changed = COALESCE(user_role_changed, TRUE),
  user_achievement = COALESCE(user_achievement, TRUE),
  
  -- Fase 5: Comunidade
  community_new_topic = COALESCE(community_new_topic, TRUE),
  community_topic_reply = COALESCE(community_topic_reply, TRUE),
  community_post_reply = COALESCE(community_post_reply, TRUE),
  community_topic_solved = COALESCE(community_topic_solved, TRUE),
  community_topic_pinned = COALESCE(community_topic_pinned, TRUE),
  community_mention = COALESCE(community_mention, TRUE),
  community_post_liked = COALESCE(community_post_liked, TRUE),
  community_moderated = COALESCE(community_moderated, TRUE),
  community_weekly_digest = COALESCE(community_weekly_digest, TRUE),
  community_achievement = COALESCE(community_achievement, TRUE),
  
  -- Canais
  email_enabled = COALESCE(email_enabled, TRUE),
  in_app_enabled = COALESCE(in_app_enabled, TRUE),
  admin_communications_email = COALESCE(admin_communications_email, TRUE),
  admin_communications_inapp = COALESCE(admin_communications_inapp, TRUE),
  
  -- Configurações avançadas
  digest_frequency = COALESCE(digest_frequency, 'instant'),
  quiet_hours_enabled = COALESCE(quiet_hours_enabled, FALSE)
WHERE TRUE;

-- Comentários para documentação
COMMENT ON COLUMN notification_preferences.suggestions_new_suggestion IS 'Notificar quando uma nova sugestão é criada';
COMMENT ON COLUMN notification_preferences.suggestions_status_changed IS 'Notificar quando o status de uma sugestão muda';
COMMENT ON COLUMN notification_preferences.community_mention IS 'Notificar quando você é mencionado (@username) na comunidade';
COMMENT ON COLUMN notification_preferences.digest_frequency IS 'Frequência de resumos: instant, hourly, daily, weekly';
COMMENT ON COLUMN notification_preferences.quiet_hours_enabled IS 'Se TRUE, não enviar notificações durante o horário de silêncio';