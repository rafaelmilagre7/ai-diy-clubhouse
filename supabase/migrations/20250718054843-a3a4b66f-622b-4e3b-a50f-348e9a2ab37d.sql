-- FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA (VERSÃO FINAL)
-- =======================================================

-- 1. REMOVER FUNÇÕES CONFLITANTES
-- ===============================

DROP FUNCTION IF EXISTS public.validate_admin_access() CASCADE;
DROP FUNCTION IF EXISTS public.validate_admin_access(uuid) CASCADE;

-- 2. ATUALIZAR FUNÇÕES COM SEARCH_PATH SEGURO
-- ===========================================

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  )
  WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT ur.name 
    FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid()
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_owner(resource_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT auth.uid() = resource_user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(get_user_role() = 'admin', false);
$$;

-- 3. CRIAR NOVA FUNÇÃO DE VALIDAÇÃO ADMIN
-- =======================================

CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_is_admin boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT ur.name INTO v_user_role
  FROM profiles p
  INNER JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid();
  
  v_is_admin := (v_user_role = 'admin');
  
  -- Log apenas se usuário autenticado existir
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      auth.uid(), 'admin_access_check', 'check_admin_access',
      jsonb_build_object('user_role', v_user_role, 'access_granted', v_is_admin),
      CASE WHEN v_is_admin THEN 'info' ELSE 'warning' END
    );
  END IF;
  
  RETURN v_is_admin;
END;
$$;

-- 4. CRIAR TABELA DE RATE LIMITING
-- ================================

CREATE TABLE IF NOT EXISTS public.rate_limit_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  blocked_until timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action)
);

ALTER TABLE public.rate_limit_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limit_blocks_admin_only" ON public.rate_limit_blocks
  FOR ALL USING (is_admin());

-- 5. FUNÇÃO DE RATE LIMITING SEGURA
-- =================================

CREATE OR REPLACE FUNCTION public.check_rate_limit_safe(
  p_action text, 
  p_limit_per_hour integer DEFAULT 60,
  p_limit_per_minute integer DEFAULT 10,
  p_identifier text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_identifier text;
  v_count_hour integer := 0;
  v_count_minute integer := 0;
  v_blocked_until timestamp;
BEGIN
  v_user_id := auth.uid();
  v_identifier := COALESCE(p_identifier, v_user_id::text, 'anonymous');
  
  -- Verificar bloqueio ativo
  SELECT blocked_until INTO v_blocked_until
  FROM rate_limit_blocks 
  WHERE identifier = v_identifier 
  AND action = p_action 
  AND blocked_until > NOW()
  LIMIT 1;
  
  IF v_blocked_until IS NOT NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', v_blocked_until,
      'reason', 'temporarily_blocked'
    );
  END IF;
  
  -- Contar tentativas
  SELECT COUNT(*) INTO v_count_hour
  FROM audit_logs
  WHERE (user_id = v_user_id OR details->>'identifier' = v_identifier)
    AND action = p_action
    AND timestamp > NOW() - INTERVAL '1 hour';
  
  SELECT COUNT(*) INTO v_count_minute
  FROM audit_logs
  WHERE (user_id = v_user_id OR details->>'identifier' = v_identifier)
    AND action = p_action
    AND timestamp > NOW() - INTERVAL '1 minute';
  
  -- Verificar limites
  IF v_count_hour >= p_limit_per_hour OR v_count_minute >= p_limit_per_minute THEN
    INSERT INTO rate_limit_blocks (identifier, action, blocked_until)
    VALUES (v_identifier, p_action, NOW() + INTERVAL '1 hour')
    ON CONFLICT (identifier, action) 
    DO UPDATE SET blocked_until = NOW() + INTERVAL '1 hour';
    
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', NOW() + INTERVAL '1 hour',
      'reason', 'rate_limit_exceeded'
    );
  END IF;
  
  -- Registrar tentativa apenas se usuário autenticado
  IF v_user_id IS NOT NULL THEN
    INSERT INTO audit_logs (user_id, event_type, action, details) VALUES (
      v_user_id, 'rate_limit_check', p_action,
      jsonb_build_object(
        'identifier', v_identifier,
        'count_hour', v_count_hour + 1, 
        'count_minute', v_count_minute + 1,
        'limit_hour', p_limit_per_hour,
        'limit_minute', p_limit_per_minute
      )
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining_hour', p_limit_per_hour - v_count_hour - 1,
    'remaining_minute', p_limit_per_minute - v_count_minute - 1
  );
END;
$$;

-- 6. FUNÇÃO PARA BUSCAR PERFIL SEGURO
-- ===================================

CREATE OR REPLACE FUNCTION public.get_profile_safe(target_user_id uuid DEFAULT auth.uid())
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF target_user_id = auth.uid() OR check_admin_access() THEN
    RETURN QUERY SELECT p.* FROM profiles p WHERE p.id = target_user_id;
  ELSE
    -- Log apenas se usuário autenticado
    IF auth.uid() IS NOT NULL THEN
      INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
        auth.uid(), 'security_violation', 'unauthorized_profile_access',
        jsonb_build_object('target_user_id', target_user_id, 'current_user_id', auth.uid()),
        'high'
      );
    END IF;
  END IF;
  RETURN;
END;
$$;

-- 7. ÍNDICES PARA PERFORMANCE
-- ===========================

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_time 
ON public.audit_logs (user_id, action, timestamp);

CREATE INDEX IF NOT EXISTS idx_profiles_role_id 
ON public.profiles (role_id);

CREATE INDEX IF NOT EXISTS idx_rate_limit_blocks_identifier_action 
ON public.rate_limit_blocks (identifier, action);

-- 8. CORRIGIR VIEW ANALYTICS
-- ==========================

DROP VIEW IF EXISTS public.admin_analytics_overview CASCADE;

CREATE VIEW public.admin_analytics_overview AS
WITH user_stats AS (
  SELECT 
    COUNT(*)::bigint as total_users,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::bigint as new_users_30d,
    COUNT(*) FILTER (WHERE onboarding_completed = true)::bigint as completed_onboarding,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::bigint as active_users_7d
  FROM public.profiles
),
lesson_stats AS (
  SELECT COUNT(*)::bigint as total_lessons 
  FROM public.learning_lessons
),
learning_stats AS (
  SELECT COUNT(DISTINCT user_id)::bigint as active_learners
  FROM public.learning_progress 
  WHERE updated_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  u.total_users,
  u.new_users_30d,
  u.completed_onboarding,
  u.active_users_7d,
  0::integer as total_solutions,
  0::integer as new_solutions_30d,
  l.total_lessons,
  ls.active_learners,
  CASE 
    WHEN u.total_users > 0 
    THEN (u.active_users_7d::numeric / u.total_users * 100)
    ELSE 0::numeric 
  END as growth_rate,
  CASE 
    WHEN u.total_users > 0 
    THEN (u.completed_onboarding::numeric / u.total_users * 100)
    ELSE 0::numeric 
  END as completion_rate
FROM user_stats u
CROSS JOIN lesson_stats l
CROSS JOIN learning_stats ls;

-- 9. COMENTÁRIOS
-- ==============

COMMENT ON FUNCTION public.check_admin_access IS 'Validação segura de acesso administrativo com logging';
COMMENT ON FUNCTION public.check_rate_limit_safe IS 'Rate limiting com bloqueios temporários';
COMMENT ON FUNCTION public.get_profile_safe IS 'Busca segura de perfil com controle de acesso';
COMMENT ON TABLE public.rate_limit_blocks IS 'Bloqueios temporários para controle de rate limiting';