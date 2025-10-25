-- Fase 2: Proteger funções SQL contra namespace hijacking
-- Altera search_path de 'public' para '' (vazio) para máxima segurança

-- Funções críticas de segurança e permissões
ALTER FUNCTION public.has_role(role_name text) SET search_path = '';
ALTER FUNCTION public.check_admin_access() SET search_path = '';
ALTER FUNCTION public.check_admin_access_secure() SET search_path = '';
ALTER FUNCTION public.get_user_permissions(p_user_id uuid) SET search_path = '';

-- Funções de rate limiting
ALTER FUNCTION public.check_rate_limit_safe(p_action text, p_limit_per_hour integer, p_limit_per_minute integer, p_identifier text) SET search_path = '';
ALTER FUNCTION public.check_comment_rate_limit_secure(p_user_id uuid) SET search_path = '';
ALTER FUNCTION public.check_nps_rate_limit_secure(p_user_id uuid, p_lesson_id uuid) SET search_path = '';

-- Funções de auditoria
ALTER FUNCTION public.audit_role_assignments_secure() SET search_path = '';

-- Funções de acesso e conexões
ALTER FUNCTION public.can_view_connection_secure(target_connection_id uuid) SET search_path = '';