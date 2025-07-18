-- FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA (CORRIGIDA)
-- =====================================================

-- 1. REMOVER FUNÇÃO DUPLICADA PRIMEIRO
-- ====================================

DROP FUNCTION IF EXISTS public.validate_admin_access() CASCADE;

-- 2. CORRIGIR VIEWS COM SECURITY DEFINER PROBLEMÁTICAS
-- =====================================================

DROP VIEW IF EXISTS public.admin_analytics_overview CASCADE;

-- Recriar view sem SECURITY DEFINER
CREATE VIEW public.admin_analytics_overview AS
WITH user_stats AS (
  SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
    COUNT(*) FILTER (WHERE onboarding_completed = true) as completed_onboarding,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as active_users_7d
  FROM public.profiles
),
solution_stats AS (
  SELECT 
    COUNT(*) as total_solutions,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_solutions_30d
  FROM public.solutions
),
lesson_stats AS (
  SELECT COUNT(*) as total_lessons FROM public.learning_lessons
),
learning_stats AS (
  SELECT COUNT(DISTINCT user_id) as active_learners
  FROM public.learning_progress 
  WHERE updated_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  u.total_users,
  u.new_users_30d,
  u.completed_onboarding,
  u.active_users_7d,
  u.active_users_7d::numeric / NULLIF(u.total_users, 0) * 100 as growth_rate,
  u.completed_onboarding::numeric / NULLIF(u.total_users, 0) * 100 as completion_rate,
  s.total_solutions,
  s.new_solutions_30d,
  l.total_lessons,
  ls.active_learners
FROM user_stats u, solution_stats s, lesson_stats l, learning_stats ls;

-- 3. ATUALIZAR FUNÇÕES COM SEARCH_PATH CORRETO
-- ============================================

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

-- 4. CRIAR FUNÇÃO SEGURA PARA VALIDAÇÃO DE ADMIN
-- ==============================================

CREATE FUNCTION public.validate_admin_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT ur.name INTO v_user_role
  FROM profiles p
  INNER JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid();
  
  INSERT INTO audit_logs (
    user_id, event_type, action, details, severity
  ) VALUES (
    auth.uid(), 'admin_access_check', 'validate_admin_access',
    jsonb_build_object('user_role', v_user_role, 'access_granted', (v_user_role = 'admin')),
    CASE WHEN v_user_role = 'admin' THEN 'info' ELSE 'warning' END
  );
  
  RETURN (v_user_role = 'admin');
END;
$$;

-- 5. IMPLEMENTAR RATE LIMITING AVANÇADO
-- =====================================

CREATE OR REPLACE FUNCTION public.check_rate_limit_advanced(
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
  v_count_hour integer;
  v_count_minute integer;
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
  
  -- Registrar tentativa
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
  
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining_hour', p_limit_per_hour - v_count_hour - 1,
    'remaining_minute', p_limit_per_minute - v_count_minute - 1
  );
END;
$$;

-- 6. FUNÇÃO PARA BUSCAR PERFIL SEGURO
-- ===================================

CREATE FUNCTION public.get_user_profile_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF target_user_id = auth.uid() OR validate_admin_access() THEN
    RETURN QUERY SELECT p.* FROM profiles p WHERE p.id = target_user_id;
  ELSE
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      auth.uid(), 'security_violation', 'unauthorized_profile_access',
      jsonb_build_object('target_user_id', target_user_id, 'current_user_id', auth.uid()),
      'high'
    );
  END IF;
  RETURN;
END;
$$;

-- 7. CRIAR TABELA DE BLOQUEIOS
-- ============================

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
  FOR ALL USING (validate_admin_access());

-- 8. ÍNDICES PARA PERFORMANCE
-- ===========================

CREATE INDEX IF NOT EXISTS idx_audit_logs_rate_limiting 
ON public.audit_logs (user_id, action, timestamp) 
WHERE event_type = 'rate_limit_check';

CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles (role_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_blocks_lookup ON public.rate_limit_blocks (identifier, action, blocked_until);

-- 9. DOCUMENTAÇÃO
-- ===============

COMMENT ON FUNCTION public.check_rate_limit_advanced IS 'Rate limiting avançado com bloqueios temporários';
COMMENT ON FUNCTION public.validate_admin_access IS 'Validação segura de acesso administrativo com logging';
COMMENT ON FUNCTION public.get_user_profile_secure IS 'Busca segura de perfil de usuário com controle de acesso';
COMMENT ON TABLE public.rate_limit_blocks IS 'Bloqueios temporários para rate limiting';

-- Log da aplicação das correções
INSERT INTO audit_logs (user_id, event_type, action, details) VALUES (
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  'system_maintenance', 'security_corrections_phase_1_completed',
  jsonb_build_object(
    'completed_at', NOW(),
    'corrections_applied', ARRAY[
      'duplicate_function_removed',
      'views_security_definer_corrected',
      'functions_search_path_secured',
      'rate_limiting_implemented',
      'admin_validation_secured',
      'profile_access_secured',
      'indexes_optimized'
    ]
  )
);