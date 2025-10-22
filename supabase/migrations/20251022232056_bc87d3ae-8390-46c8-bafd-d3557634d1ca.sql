-- =============================================================================
-- POPULAR PREFERÊNCIAS DE NOTIFICAÇÃO PARA TODOS OS USUÁRIOS
-- Garantir que os 1000+ usuários existentes tenham todas as preferências ativadas
-- =============================================================================

-- Inserir preferências para todos os usuários que ainda não têm
-- Com todas as opções ativadas (TRUE) por padrão
INSERT INTO notification_preferences (
  user_id,
  email_enabled,
  in_app_enabled,
  whatsapp_enabled,
  suggestions_new_suggestion,
  suggestions_status_changed,
  suggestions_new_comment,
  suggestions_comment_reply,
  suggestions_upvoted,
  suggestions_milestone,
  solutions_new_solution,
  solutions_updated,
  solutions_new_comment,
  solutions_reply,
  solutions_access_granted,
  solutions_weekly_digest,
  events_new_event,
  events_reminder,
  events_registration_confirmed,
  events_updated,
  events_cancelled,
  events_starting_soon,
  system_maintenance,
  system_new_feature,
  system_security_alert,
  admin_broadcast,
  admin_direct_message,
  user_role_changed,
  user_achievement,
  community_new_topic,
  community_topic_reply,
  community_post_reply,
  community_topic_solved,
  community_topic_pinned,
  community_mention,
  community_post_liked,
  community_moderated,
  community_weekly_digest,
  community_achievement,
  digest_frequency,
  quiet_hours_enabled,
  quiet_hours_start,
  quiet_hours_end
)
SELECT 
  p.id as user_id,
  TRUE, -- email_enabled
  TRUE, -- in_app_enabled
  FALSE, -- whatsapp_enabled (ainda não disponível)
  TRUE, -- suggestions_new_suggestion
  TRUE, -- suggestions_status_changed
  TRUE, -- suggestions_new_comment
  TRUE, -- suggestions_comment_reply
  TRUE, -- suggestions_upvoted
  TRUE, -- suggestions_milestone
  TRUE, -- solutions_new_solution
  TRUE, -- solutions_updated
  TRUE, -- solutions_new_comment
  TRUE, -- solutions_reply
  TRUE, -- solutions_access_granted
  TRUE, -- solutions_weekly_digest
  TRUE, -- events_new_event
  TRUE, -- events_reminder
  TRUE, -- events_registration_confirmed
  TRUE, -- events_updated
  TRUE, -- events_cancelled
  TRUE, -- events_starting_soon
  TRUE, -- system_maintenance
  TRUE, -- system_new_feature
  TRUE, -- system_security_alert
  TRUE, -- admin_broadcast
  TRUE, -- admin_direct_message
  TRUE, -- user_role_changed
  TRUE, -- user_achievement
  TRUE, -- community_new_topic
  TRUE, -- community_topic_reply
  TRUE, -- community_post_reply
  TRUE, -- community_topic_solved
  TRUE, -- community_topic_pinned
  TRUE, -- community_mention
  TRUE, -- community_post_liked
  TRUE, -- community_moderated
  TRUE, -- community_weekly_digest
  TRUE, -- community_achievement
  'instant', -- digest_frequency
  FALSE, -- quiet_hours_enabled
  '22:00'::TIME, -- quiet_hours_start
  '08:00'::TIME -- quiet_hours_end
FROM profiles p
LEFT JOIN notification_preferences np ON p.id = np.user_id
WHERE np.user_id IS NULL; -- Apenas usuários que ainda não têm preferências

-- Criar trigger para automaticamente criar preferências para novos usuários
CREATE OR REPLACE FUNCTION create_notification_preferences_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notification_preferences (
    user_id,
    email_enabled,
    in_app_enabled,
    whatsapp_enabled,
    suggestions_new_suggestion,
    suggestions_status_changed,
    suggestions_new_comment,
    suggestions_comment_reply,
    suggestions_upvoted,
    suggestions_milestone,
    solutions_new_solution,
    solutions_updated,
    solutions_new_comment,
    solutions_reply,
    solutions_access_granted,
    solutions_weekly_digest,
    events_new_event,
    events_reminder,
    events_registration_confirmed,
    events_updated,
    events_cancelled,
    events_starting_soon,
    system_maintenance,
    system_new_feature,
    system_security_alert,
    admin_broadcast,
    admin_direct_message,
    user_role_changed,
    user_achievement,
    community_new_topic,
    community_topic_reply,
    community_post_reply,
    community_topic_solved,
    community_topic_pinned,
    community_mention,
    community_post_liked,
    community_moderated,
    community_weekly_digest,
    community_achievement,
    digest_frequency,
    quiet_hours_enabled,
    quiet_hours_start,
    quiet_hours_end
  ) VALUES (
    NEW.id,
    TRUE, TRUE, FALSE, -- Canais
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, -- Sugestões
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, -- Soluções
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, -- Eventos
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, -- Sistema
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, -- Comunidade
    'instant', FALSE, '22:00'::TIME, '08:00'::TIME -- Avançadas
  )
  ON CONFLICT (user_id) DO NOTHING; -- Evitar erro se já existir
  
  RETURN NEW;
END;
$$;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS create_notification_preferences_on_profile_creation ON profiles;

-- Criar trigger no INSERT de profiles
CREATE TRIGGER create_notification_preferences_on_profile_creation
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_notification_preferences_for_new_user();

-- Verificar quantos usuários foram criados
DO $$
DECLARE
  v_total_users INTEGER;
  v_users_with_prefs INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_users FROM profiles;
  SELECT COUNT(*) INTO v_users_with_prefs FROM notification_preferences;
  
  RAISE NOTICE '✅ Migration concluída!';
  RAISE NOTICE '📊 Total de usuários: %', v_total_users;
  RAISE NOTICE '📊 Usuários com preferências: %', v_users_with_prefs;
  RAISE NOTICE '🎉 Todos os usuários agora têm notificações ativadas por padrão!';
END $$;