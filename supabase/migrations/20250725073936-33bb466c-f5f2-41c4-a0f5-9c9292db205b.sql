-- CORREÇÃO FINAL DAS ÚLTIMAS 13 FUNÇÕES SEM SEARCH_PATH
-- Aplicando ALTER FUNCTION para as funções específicas restantes

-- Corrigir as 13 funções restantes uma por uma
ALTER FUNCTION public.check_rate_limit(p_identifier text, p_action_type text, p_max_attempts integer, p_window_minutes integer) SET search_path = 'public';

ALTER FUNCTION public.debug_tool_permissions(user_id uuid) SET search_path = 'public';

ALTER FUNCTION public.ensure_audit_log(p_event_type text, p_action text, p_resource_id text, p_details jsonb, p_retry_count integer) SET search_path = 'public';

ALTER FUNCTION public.generate_recurring_event_instances(p_event_id uuid, p_max_instances integer) SET search_path = 'public';

ALTER FUNCTION public.get_security_metrics(p_user_id uuid, p_days integer) SET search_path = 'public';

ALTER FUNCTION public.initialize_onboarding_for_user(p_user_id uuid, p_invite_token text) SET search_path = 'public';

ALTER FUNCTION public.is_user_admin_enhanced(user_id uuid) SET search_path = 'public';

ALTER FUNCTION public.log_rls_violation_attempt(p_table_name text, p_operation text, p_user_id uuid) SET search_path = 'public';

ALTER FUNCTION public.log_security_violation(p_user_id uuid, p_violation_type text, p_severity text, p_description text, p_ip_address text, p_user_agent text, p_resource_accessed text, p_additional_data jsonb, p_auto_block boolean) SET search_path = 'public';

ALTER FUNCTION public.manage_user_session(p_user_id uuid, p_session_token text, p_ip_address text, p_user_agent text) SET search_path = 'public';

ALTER FUNCTION public.validate_input_security(p_input text, p_type text) SET search_path = 'public';

ALTER FUNCTION public.validate_onboarding_state(p_user_id uuid) SET search_path = 'public';

ALTER FUNCTION public.validate_user_invite_match(p_token text, p_user_id uuid) SET search_path = 'public';