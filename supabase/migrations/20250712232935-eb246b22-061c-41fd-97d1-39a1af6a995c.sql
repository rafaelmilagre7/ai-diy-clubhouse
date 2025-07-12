-- CORREÇÃO CRÍTICA DE SEGURANÇA: Políticas RLS inseguras
-- Corrigir políticas com condições NULL que permitem acesso irrestrito

-- 1. Analytics - Remover política insegura e manter apenas as seguras
DROP POLICY IF EXISTS "Admins can insert analytics" ON public.analytics;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios eventos de análise" ON public.analytics;
DROP POLICY IF EXISTS "Usuários só podem inserir analytics para si mesmos" ON public.analytics;

-- Política consolidada e segura para INSERT em analytics
CREATE POLICY "analytics_secure_insert_policy" ON public.analytics
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 2. Audit Logs - Corrigir política de inserção
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "audit_logs_secure_insert_policy" ON public.audit_logs
  FOR INSERT 
  WITH CHECK (
    -- Apenas sistema autenticado ou serviços podem inserir logs
    auth.role() = 'service_role' OR 
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- 3. Badges - Remover políticas inseguras  
DROP POLICY IF EXISTS "Only admins can insert badges" ON public.badges;
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode ver badges" ON public.badges;

-- Política segura para inserção de badges
CREATE POLICY "badges_secure_insert_policy" ON public.badges
  FOR INSERT 
  WITH CHECK (is_user_admin(auth.uid()));

-- 4. Benefit Access Control - Corrigir política de inserção
DROP POLICY IF EXISTS "benefit_access_control_admin_insert" ON public.benefit_access_control;

CREATE POLICY "benefit_access_control_secure_insert" ON public.benefit_access_control
  FOR INSERT 
  WITH CHECK (is_user_admin(auth.uid()));

-- 5. Benefit Clicks - Corrigir política de inserção
DROP POLICY IF EXISTS "Usuários autenticados podem registrar cliques" ON public.benefit_clicks;

CREATE POLICY "benefit_clicks_secure_insert" ON public.benefit_clicks
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 6. Communication Preferences - Corrigir política de inserção
DROP POLICY IF EXISTS "Users can insert their own communication preferences" ON public.communication_preferences;

CREATE POLICY "communication_preferences_secure_insert" ON public.communication_preferences
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 7. Community Reports - Corrigir política de inserção
DROP POLICY IF EXISTS "users_can_create_reports" ON public.community_reports;

CREATE POLICY "community_reports_secure_insert" ON public.community_reports
  FOR INSERT 
  WITH CHECK (reporter_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 8. Conversations - Corrigir políticas de inserção
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Usuários podem criar conversas" ON public.conversations;

CREATE POLICY "conversations_secure_insert" ON public.conversations
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
  );

-- 9. Direct Messages - Corrigir políticas de inserção
DROP POLICY IF EXISTS "Users can send messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Usuários podem enviar mensagens" ON public.direct_messages;

CREATE POLICY "direct_messages_secure_insert" ON public.direct_messages
  FOR INSERT 
  WITH CHECK (sender_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 10. Event Access Control - Corrigir política de inserção
DROP POLICY IF EXISTS "event_access_control_admin_insert" ON public.event_access_control;

CREATE POLICY "event_access_control_secure_insert" ON public.event_access_control
  FOR INSERT 
  WITH CHECK (is_user_admin(auth.uid()));

-- 11. Events - Corrigir políticas de inserção
DROP POLICY IF EXISTS "Only admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Permitir inserção apenas para administradores" ON public.events;

CREATE POLICY "events_secure_insert" ON public.events
  FOR INSERT 
  WITH CHECK (is_user_admin(auth.uid()));

-- 12. Forum Posts e Topics - Corrigir políticas de inserção
DROP POLICY IF EXISTS "forum_posts_insert_policy" ON public.forum_posts;

CREATE POLICY "forum_posts_secure_insert" ON public.forum_posts
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "forum_topics_insert_policy" ON public.forum_topics;

CREATE POLICY "forum_topics_secure_insert" ON public.forum_topics
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 13. Implementation Trails - Corrigir política de inserção
DROP POLICY IF EXISTS "users_can_create_own_trails" ON public.implementation_trails;

CREATE POLICY "implementation_trails_secure_insert" ON public.implementation_trails
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 14. Learning Comments - Corrigir políticas de inserção
DROP POLICY IF EXISTS "Users can manage own comments" ON public.learning_comments;
DROP POLICY IF EXISTS "Usuários podem criar comentários" ON public.learning_comments;

CREATE POLICY "learning_comments_secure_insert" ON public.learning_comments
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 15. Learning Courses - Corrigir política de inserção
DROP POLICY IF EXISTS "Only admins can manage courses" ON public.learning_courses;

CREATE POLICY "learning_courses_secure_insert" ON public.learning_courses
  FOR INSERT 
  WITH CHECK (is_user_admin(auth.uid()));

-- 16. Learning Lesson NPS - Corrigir política de inserção
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias avaliações NPS" ON public.learning_lesson_nps;

CREATE POLICY "learning_lesson_nps_secure_insert" ON public.learning_lesson_nps
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 17. Learning Certificates - Corrigir política de inserção
DROP POLICY IF EXISTS "System can create certificates" ON public.learning_certificates;

CREATE POLICY "learning_certificates_secure_insert" ON public.learning_certificates
  FOR INSERT 
  WITH CHECK (
    -- Apenas sistema ou admins podem criar certificados
    auth.role() = 'service_role' OR is_user_admin(auth.uid())
  );

-- 18. Learning Comment Likes - Corrigir política de inserção  
DROP POLICY IF EXISTS "Usuários podem curtir" ON public.learning_comment_likes;

CREATE POLICY "learning_comment_likes_secure_insert" ON public.learning_comment_likes
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 19. Member Connections - Corrigir política de inserção
DROP POLICY IF EXISTS "Usuários podem criar solicitações de conexão" ON public.member_connections;

CREATE POLICY "member_connections_secure_insert" ON public.member_connections
  FOR INSERT 
  WITH CHECK (requester_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 20. Network Connections - Corrigir política de inserção
DROP POLICY IF EXISTS "Usuários podem inserir novas conexões apenas como solicitante" ON public.network_connections;

CREATE POLICY "network_connections_secure_insert" ON public.network_connections
  FOR INSERT 
  WITH CHECK (requester_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 21. Network Matches - Corrigir política de inserção
DROP POLICY IF EXISTS "System can create matches" ON public.network_matches;

CREATE POLICY "network_matches_secure_insert" ON public.network_matches
  FOR INSERT 
  WITH CHECK (
    -- Apenas sistema ou admins podem criar matches
    auth.role() = 'service_role' OR is_user_admin(auth.uid())
  );

-- 22. Networking Analytics - Corrigir política de inserção
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias analytics" ON public.networking_analytics;

CREATE POLICY "networking_analytics_secure_insert" ON public.networking_analytics
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 23. Networking Meetings - Corrigir política de inserção
DROP POLICY IF EXISTS "Usuários podem criar reuniões" ON public.networking_meetings;

CREATE POLICY "networking_meetings_secure_insert" ON public.networking_meetings
  FOR INSERT 
  WITH CHECK (organizer_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 24. Networking Preferences - Corrigir política de inserção
DROP POLICY IF EXISTS "Usuários podem inserir apenas suas próprias preferências" ON public.networking_preferences;

CREATE POLICY "networking_preferences_secure_insert" ON public.networking_preferences
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 25. Notification Preferences - Corrigir política de inserção
DROP POLICY IF EXISTS "Usuários podem inserir suas preferências" ON public.notification_preferences;

CREATE POLICY "notification_preferences_secure_insert" ON public.notification_preferences
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 26. Notifications - Corrigir políticas de inserção
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Sistema pode criar notificações" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "notifications_secure_insert" ON public.notifications
  FOR INSERT 
  WITH CHECK (
    -- Apenas sistema, admins ou notificações direcionadas ao próprio usuário
    auth.role() = 'service_role' OR 
    is_user_admin(auth.uid()) OR 
    user_id = auth.uid()
  );

-- 27. Onboarding - Corrigir múltiplas políticas de inserção inseguras
DROP POLICY IF EXISTS "Users can create their own onboarding data" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can create their own onboarding final" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can insert their own onboarding" ON public.onboarding_final;

CREATE POLICY "onboarding_final_secure_insert" ON public.onboarding_final
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 28. Onboarding Abandonment Points - Corrigir política de inserção
DROP POLICY IF EXISTS "System can insert abandonment points" ON public.onboarding_abandonment_points;

CREATE POLICY "onboarding_abandonment_secure_insert" ON public.onboarding_abandonment_points
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role' OR is_user_admin(auth.uid()));

-- 29. Onboarding Backups - Corrigir política de inserção
DROP POLICY IF EXISTS "System can create backups" ON public.onboarding_backups;

CREATE POLICY "onboarding_backups_secure_insert" ON public.onboarding_backups
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role' OR is_user_admin(auth.uid()));

-- 30. Onboarding Step Tracking - Corrigir política de inserção
DROP POLICY IF EXISTS "System can insert onboarding tracking" ON public.onboarding_step_tracking;

CREATE POLICY "onboarding_tracking_secure_insert" ON public.onboarding_step_tracking
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role' OR user_id = auth.uid());

-- 31. Onboarding Sync - Corrigir política de inserção
DROP POLICY IF EXISTS "Users can insert own onboarding sync data" ON public.onboarding_sync;

CREATE POLICY "onboarding_sync_secure_insert" ON public.onboarding_sync
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 32. Onboarding Users - Corrigir política de inserção
DROP POLICY IF EXISTS "Usuários inserem seus próprios dados" ON public.onboarding_users;

CREATE POLICY "onboarding_users_secure_insert" ON public.onboarding_users
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 33. Permission Audit Logs - Corrigir política de inserção
DROP POLICY IF EXISTS "System can create audit logs" ON public.permission_audit_logs;

CREATE POLICY "permission_audit_logs_secure_insert" ON public.permission_audit_logs
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role' OR is_user_admin(auth.uid()));

-- 34. Profiles - Corrigir política de inserção
DROP POLICY IF EXISTS "profiles_consolidated_insert" ON public.profiles;

CREATE POLICY "profiles_secure_insert" ON public.profiles
  FOR INSERT 
  WITH CHECK (id = auth.uid() AND auth.uid() IS NOT NULL);

-- 35. Progress - Corrigir política de inserção
DROP POLICY IF EXISTS "progress_insert_policy" ON public.progress;

CREATE POLICY "progress_secure_insert" ON public.progress
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 36. Referrals - Corrigir política de inserção
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;

CREATE POLICY "referrals_secure_insert" ON public.referrals
  FOR INSERT 
  WITH CHECK (referrer_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 37. Security Violations - Corrigir política de inserção
DROP POLICY IF EXISTS "System can create violations" ON public.security_violations;

CREATE POLICY "security_violations_secure_insert" ON public.security_violations
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role' OR is_user_admin(auth.uid()));

-- 38. Solution Certificates - Corrigir política de inserção
DROP POLICY IF EXISTS "Users can create their own solution certificates" ON public.solution_certificates;

CREATE POLICY "solution_certificates_secure_insert" ON public.solution_certificates
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND auth.uid() IS NOT NULL AND
    -- Verificar elegibilidade através de função específica
    (auth.role() = 'service_role' OR is_user_admin(auth.uid()))
  );

-- 39. Solution Comment Likes - Corrigir política de inserção
DROP POLICY IF EXISTS "Usuários autenticados podem curtir comentários de soluções" ON public.solution_comment_likes;

CREATE POLICY "solution_comment_likes_secure_insert" ON public.solution_comment_likes
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 40. Solution Comments - Corrigir política de inserção
DROP POLICY IF EXISTS "Authenticated users can insert solution comments" ON public.solution_comments;

CREATE POLICY "solution_comments_secure_insert" ON public.solution_comments
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 41. Solution Resources - Corrigir política de inserção
DROP POLICY IF EXISTS "Only admins can manage solution resources" ON public.solution_resources;

CREATE POLICY "solution_resources_secure_insert" ON public.solution_resources
  FOR INSERT 
  WITH CHECK (is_user_admin(auth.uid()));

-- 42. Solution Tools - Corrigir política de inserção
DROP POLICY IF EXISTS "Authenticated users can insert solution_tools" ON public.solution_tools;

CREATE POLICY "solution_tools_secure_insert" ON public.solution_tools
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND is_user_admin(auth.uid()));

-- 43. Solutions - Corrigir política de inserção
DROP POLICY IF EXISTS "solutions_insert_policy" ON public.solutions;

CREATE POLICY "solutions_secure_insert" ON public.solutions
  FOR INSERT 
  WITH CHECK (is_user_admin(auth.uid()));

-- 44. Suggestion Comments - Corrigir políticas de inserção
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.suggestion_comments;
DROP POLICY IF EXISTS "Usuários autenticados podem comentar" ON public.suggestion_comments;

CREATE POLICY "suggestion_comments_secure_insert" ON public.suggestion_comments
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 45. Suggestion Notifications - Corrigir política de inserção
DROP POLICY IF EXISTS "System can create suggestion notifications" ON public.suggestion_notifications;

CREATE POLICY "suggestion_notifications_secure_insert" ON public.suggestion_notifications
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role' OR is_user_admin(auth.uid()));

-- 46. Suggestions - Corrigir política de inserção
DROP POLICY IF EXISTS "suggestions_insert_policy" ON public.suggestions;

CREATE POLICY "suggestions_secure_insert" ON public.suggestions
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 47. Tool Comment Likes - Corrigir política de inserção
DROP POLICY IF EXISTS "Usuários autenticados podem curtir" ON public.tool_comment_likes;

CREATE POLICY "tool_comment_likes_secure_insert" ON public.tool_comment_likes
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 48. Tool Comments - Corrigir política de inserção
DROP POLICY IF EXISTS "Usuários autenticados podem criar comentários" ON public.tool_comments;

CREATE POLICY "tool_comments_secure_insert" ON public.tool_comments
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 49. Tools - Corrigir políticas de inserção
DROP POLICY IF EXISTS "Admins can insert tools" ON public.tools;
DROP POLICY IF EXISTS "Apenas administradores podem inserir ferramentas" ON public.tools;

CREATE POLICY "tools_secure_insert" ON public.tools
  FOR INSERT 
  WITH CHECK (is_user_admin(auth.uid()));

-- 50. User Checklists - Corrigir política de inserção
DROP POLICY IF EXISTS "Users can create their own checklists" ON public.user_checklists;

CREATE POLICY "user_checklists_secure_insert" ON public.user_checklists
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 51. User Onboarding - Corrigir políticas de inserção
DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can insert their own onboarding data" ON public.user_onboarding;

CREATE POLICY "user_onboarding_secure_insert" ON public.user_onboarding
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- 52. User Sessions - Corrigir política de inserção
DROP POLICY IF EXISTS "System can manage sessions" ON public.user_sessions;

CREATE POLICY "user_sessions_secure_insert" ON public.user_sessions
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'service_role' OR 
    (user_id = auth.uid() AND auth.uid() IS NOT NULL)
  );

-- Log da correção de segurança
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_event',
  'rls_policy_security_fix',
  jsonb_build_object(
    'description', 'Correção crítica de políticas RLS inseguras',
    'policies_fixed', 52,
    'timestamp', now()
  ),
  'high'
);