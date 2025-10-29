-- ============================================
-- FIX: create_notification_preferences_for_new_user()
-- ============================================
-- PROBLEMA: search_path vazio impede acesso à tabela notification_preferences
-- SOLUÇÃO: Definir search_path = 'public' explicitamente
-- ============================================

CREATE OR REPLACE FUNCTION public.create_notification_preferences_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.notification_preferences (
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
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;