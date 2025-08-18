-- =======================
-- CORREÇÕES DE SEGURANÇA RLS
-- =======================

-- 1. ADMIN_SETTINGS: Apenas admins podem acessar
CREATE POLICY "admin_settings_admin_only" ON public.admin_settings
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        INNER JOIN public.user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
);

-- 2. EMAIL_QUEUE: Service role + admins
CREATE POLICY "email_queue_service_and_admin" ON public.email_queue
FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        INNER JOIN public.user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
);

-- 3. SECURITY_LOGS: Service role + admins
CREATE POLICY "security_logs_service_and_admin" ON public.security_logs
FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        INNER JOIN public.user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
);

-- 4. USER_SESSIONS: Usuários podem ver suas próprias sessões + admins
CREATE POLICY "user_sessions_own_and_admin" ON public.user_sessions
FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        INNER JOIN public.user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
);

CREATE POLICY "user_sessions_own_insert" ON public.user_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_own_update" ON public.user_sessions
FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        INNER JOIN public.user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
);

CREATE POLICY "user_sessions_own_delete" ON public.user_sessions
FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        INNER JOIN public.user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
);

-- 5. RATE_LIMITS: Service role + sistema
CREATE POLICY "rate_limits_system_only" ON public.rate_limits
FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        INNER JOIN public.user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
);

-- 6. RATE_LIMIT_ATTEMPTS: Service role + sistema
CREATE POLICY "rate_limit_attempts_system_only" ON public.rate_limit_attempts
FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        INNER JOIN public.user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
);

-- =======================
-- CORREÇÃO FUNCTION SEARCH PATH
-- =======================

-- Corrigir função get_networking_contacts para ter search_path seguro
CREATE OR REPLACE FUNCTION public.get_networking_contacts(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  company_name text,
  current_position text,
  avatar_url text,
  compatibility_score numeric,
  match_type text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.company_name,
    p.current_position,
    p.avatar_url,
    nm.compatibility_score,
    nm.match_type
  FROM public.profiles p
  INNER JOIN public.network_matches nm ON p.id = nm.matched_user_id
  WHERE nm.user_id = p_user_id 
    AND nm.status = 'pending'
  ORDER BY nm.compatibility_score DESC;
END;
$$;

-- =======================
-- LOGS DE AUDITORIA
-- =======================

-- Inserir log da correção de segurança
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_enhancement',
  'rls_policies_applied',
  jsonb_build_object(
    'tables_protected', ARRAY[
      'admin_settings', 
      'email_queue', 
      'security_logs', 
      'user_sessions', 
      'rate_limits', 
      'rate_limit_attempts'
    ],
    'functions_fixed', ARRAY['get_networking_contacts'],
    'applied_at', now()
  ),
  'info'
);