
-- FASE 2: CORREÇÃO DE ANONYMOUS ACCESS POLICIES CRÍTICAS
-- Remover acesso anônimo de tabelas administrativas e sensíveis

-- 1. CORRIGIR TABELAS ADMINISTRATIVAS (não devem ter acesso anônimo)
-- admin_communications
DROP POLICY IF EXISTS "Admins can manage communications" ON public.admin_communications;
CREATE POLICY "admin_communications_admin_only" ON public.admin_communications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- admin_settings  
DROP POLICY IF EXISTS "admin_settings_admin_access" ON public.admin_settings;
CREATE POLICY "admin_settings_authenticated_admin_only" ON public.admin_settings
FOR ALL USING (public.is_user_admin(auth.uid()));

-- 2. CORRIGIR TABELAS DE AUDITORIA (acesso apenas autenticado)
-- audit_logs
DROP POLICY IF EXISTS "Admins can read all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view their own logs" ON public.audit_logs;
CREATE POLICY "audit_logs_authenticated_access" ON public.audit_logs
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR public.is_user_admin(auth.uid())
  )
);

-- 3. CORRIGIR TABELAS DE CONVITES (acesso apenas admin autenticado)
-- invites
DROP POLICY IF EXISTS "Admins can manage all invites" ON public.invites;
CREATE POLICY "invites_authenticated_admin_only" ON public.invites
FOR ALL USING (
  auth.uid() IS NOT NULL AND public.is_user_admin(auth.uid())
);

-- invite_deliveries
DROP POLICY IF EXISTS "Admins can view all invite deliveries" ON public.invite_deliveries;
CREATE POLICY "invite_deliveries_authenticated_admin_only" ON public.invite_deliveries
FOR ALL USING (
  auth.uid() IS NOT NULL AND public.is_user_admin(auth.uid())
);

-- 4. CORRIGIR TABELAS DE EVENTOS (acesso apenas autenticado)
-- events
DROP POLICY IF EXISTS "events_secure_select_policy" ON public.events;
CREATE POLICY "events_authenticated_only" ON public.events
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 5. CORRIGIR TABELAS DE FORUM (acesso apenas autenticado)
-- forum_categories
DROP POLICY IF EXISTS "forum_categories_secure_select_policy" ON public.forum_categories;
CREATE POLICY "forum_categories_authenticated_only" ON public.forum_categories
FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- forum_topics
DROP POLICY IF EXISTS "forum_topics_secure_select_policy" ON public.forum_topics;
CREATE POLICY "forum_topics_authenticated_only" ON public.forum_topics
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 6. CORRIGIR BADGES (acesso apenas autenticado)
-- badges
DROP POLICY IF EXISTS "badges_secure_select_policy" ON public.badges;
CREATE POLICY "badges_authenticated_only" ON public.badges
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 7. CORRIGIR USER_ROLES (acesso apenas autenticado)
-- user_roles
DROP POLICY IF EXISTS "user_roles_authenticated_select" ON public.user_roles;
CREATE POLICY "user_roles_authenticated_access" ON public.user_roles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 8. CORRIGIR ALGUMAS TABELAS QUE PODEM MANTER ACESSO PÚBLICO MAS COM RESTRIÇÕES
-- solutions (manter público mas apenas published)
DROP POLICY IF EXISTS "solutions_select_policy" ON public.solutions;
CREATE POLICY "solutions_public_published_only" ON public.solutions
FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);

-- tools (manter público mas apenas active)
DROP POLICY IF EXISTS "tools_authenticated_select" ON public.tools;
CREATE POLICY "tools_public_active_only" ON public.tools
FOR SELECT USING (is_active = true);

-- 9. LOG DA FASE 2
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'security_hardening',
  'phase_2_anonymous_policies_fix',
  jsonb_build_object(
    'message', 'FASE 2 - Correção de políticas de acesso anônimo',
    'tables_secured', ARRAY[
      'admin_communications', 'admin_settings', 'audit_logs', 
      'invites', 'invite_deliveries', 'events', 'forum_categories',
      'forum_topics', 'badges', 'user_roles'
    ],
    'public_access_maintained', ARRAY['solutions', 'tools'],
    'timestamp', now()
  ),
  auth.uid()
);
