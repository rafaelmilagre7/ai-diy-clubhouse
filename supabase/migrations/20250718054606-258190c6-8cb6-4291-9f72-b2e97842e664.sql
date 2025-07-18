-- FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA (FINAL)
-- ================================================

-- 1. REMOVER TODAS AS VERSÕES DE FUNÇÕES CONFLITANTES
-- ===================================================

DROP FUNCTION IF EXISTS public.validate_admin_access() CASCADE;
DROP FUNCTION IF EXISTS public.validate_admin_access(uuid) CASCADE;

-- 2. IMPLEMENTAR SISTEMA DE AUTENTICAÇÃO SEGURO
-- =============================================

-- Atualizar função is_user_admin
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

-- Atualizar função get_user_role
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

-- Função is_owner segura
CREATE OR REPLACE FUNCTION public.is_owner(resource_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT auth.uid() = resource_user_id;
$$;

-- Função is_admin otimizada
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(get_user_role() = 'admin', false);
$$;

-- 3. CRIAR NOVA FUNÇÃO DE VALIDAÇÃO ADMIN SEGURA
-- ==============================================

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
  -- Verificar autenticação
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Buscar role do usuário
  SELECT ur.name INTO v_user_role
  FROM profiles p
  INNER JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid();
  
  v_is_admin := (v_user_role = 'admin');
  
  -- Log de tentativa de acesso
  INSERT INTO audit_logs (
    user_id, event_type, action, details, severity
  ) VALUES (
    auth.uid(), 
    'admin_access_check', 
    'check_admin_access',
    jsonb_build_object(
      'user_role', v_user_role, 
      'access_granted', v_is_admin,
      'timestamp', NOW()
    ),
    CASE WHEN v_is_admin THEN 'info' ELSE 'warning' END
  );
  
  RETURN v_is_admin;
END;
$$;

-- 4. SISTEMA DE RATE LIMITING ROBUSTO
-- ===================================

-- Criar tabela de bloqueios primeiro
CREATE TABLE IF NOT EXISTS public.rate_limit_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  blocked_until timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action)
);

-- Habilitar RLS
ALTER TABLE public.rate_limit_blocks ENABLE ROW LEVEL SECURITY;

-- Política RLS para rate_limit_blocks (usando função existente is_admin)
CREATE POLICY "rate_limit_blocks_admin_only" ON public.rate_limit_blocks
  FOR ALL USING (is_admin());

-- Função de rate limiting avançado
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
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
  
  -- Contar tentativas na última hora
  SELECT COUNT(*) INTO v_count_hour
  FROM audit_logs
  WHERE (user_id = v_user_id OR details->>'identifier' = v_identifier)
    AND action = p_action
    AND timestamp > NOW() - INTERVAL '1 hour';
  
  -- Contar tentativas no último minuto
  SELECT COUNT(*) INTO v_count_minute
  FROM audit_logs
  WHERE (user_id = v_user_id OR details->>'identifier' = v_identifier)
    AND action = p_action
    AND timestamp > NOW() - INTERVAL '1 minute';
  
  -- Verificar se excedeu limites
  IF v_count_hour >= p_limit_per_hour OR v_count_minute >= p_limit_per_minute THEN
    -- Criar bloqueio temporário
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
    v_user_id, 
    'rate_limit_check', 
    p_action,
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

-- 5. FUNÇÃO PARA BUSCAR PERFIL SEGURO
-- ===================================

CREATE OR REPLACE FUNCTION public.get_profile_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se pode acessar o perfil
  IF target_user_id = auth.uid() OR check_admin_access() THEN
    RETURN QUERY SELECT p.* FROM profiles p WHERE p.id = target_user_id;
  ELSE
    -- Log de tentativa não autorizada
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      auth.uid(), 
      'security_violation', 
      'unauthorized_profile_access',
      jsonb_build_object(
        'target_user_id', target_user_id, 
        'current_user_id', auth.uid()
      ),
      'high'
    );
  END IF;
  
  RETURN;
END;
$$;

-- 6. OTIMIZAÇÃO DE PERFORMANCE
-- ============================

-- Índices otimizados
CREATE INDEX IF NOT EXISTS idx_audit_logs_rate_limiting 
ON public.audit_logs (user_id, action, timestamp) 
WHERE event_type = 'rate_limit_check';

CREATE INDEX IF NOT EXISTS idx_profiles_role_lookup 
ON public.profiles (id, role_id);

CREATE INDEX IF NOT EXISTS idx_rate_limit_blocks_active 
ON public.rate_limit_blocks (identifier, action, blocked_until) 
WHERE blocked_until > NOW();

-- 7. CORRIGIR VIEW ANALYTICS
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
    THEN (u.active_users_7d::numeric / u.total_users * 100)::numeric
    ELSE 0::numeric 
  END as growth_rate,
  CASE 
    WHEN u.total_users > 0 
    THEN (u.completed_onboarding::numeric / u.total_users * 100)::numeric
    ELSE 0::numeric 
  END as completion_rate
FROM user_stats u, lesson_stats l, learning_stats ls;

-- 8. DOCUMENTAÇÃO E LOGS
-- ======================

COMMENT ON FUNCTION public.check_admin_access IS 'Validação segura de acesso administrativo';
COMMENT ON FUNCTION public.check_rate_limit_enhanced IS 'Rate limiting avançado com bloqueios';
COMMENT ON FUNCTION public.get_profile_secure IS 'Busca segura de perfil com controle de acesso';
COMMENT ON TABLE public.rate_limit_blocks IS 'Bloqueios temporários para rate limiting';

-- Log final das correções
INSERT INTO audit_logs (user_id, event_type, action, details) VALUES (
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  'system_maintenance', 
  'security_phase_1_complete',
  jsonb_build_object(
    'timestamp', NOW(),
    'corrections', ARRAY[
      'conflicting_functions_removed',
      'secure_admin_validation_implemented',
      'enhanced_rate_limiting_created',
      'secure_profile_access_implemented',
      'performance_indexes_added',
      'analytics_view_corrected'
    ],
    'next_phase', 'frontend_optimization'
  )
);