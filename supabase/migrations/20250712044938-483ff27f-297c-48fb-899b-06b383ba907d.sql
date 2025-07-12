-- Security Enhancement Phase 2: Additional Functions & Improvements
-- ========================================================================

-- Security violation logging function
CREATE OR REPLACE FUNCTION public.log_security_violation(
  p_user_id UUID DEFAULT NULL,
  p_violation_type TEXT DEFAULT 'unknown',
  p_severity TEXT DEFAULT 'medium',
  p_description TEXT DEFAULT 'Security violation detected',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_resource_accessed TEXT DEFAULT NULL,
  p_additional_data JSONB DEFAULT '{}',
  p_auto_block BOOLEAN DEFAULT false
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  violation_id UUID;
BEGIN
  INSERT INTO public.security_violations (
    user_id, violation_type, severity, description, 
    ip_address, user_agent, resource_accessed, 
    additional_data, auto_blocked
  )
  VALUES (
    p_user_id, p_violation_type, p_severity, p_description,
    p_ip_address, p_user_agent, p_resource_accessed,
    p_additional_data, p_auto_block
  )
  RETURNING id INTO violation_id;
  
  -- Auto-block for critical violations
  IF p_severity = 'critical' AND p_auto_block AND p_user_id IS NOT NULL THEN
    -- Log additional audit entry
    INSERT INTO public.audit_logs (user_id, event_type, action, details, severity)
    VALUES (p_user_id, 'security_auto_block', 'user_blocked', 
            jsonb_build_object('violation_id', violation_id, 'reason', p_description), 
            'critical');
  END IF;
  
  RETURN violation_id;
END;
$$;

-- Enhanced audit trigger for profile changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log profile changes with detailed information
  INSERT INTO public.audit_logs (
    user_id, event_type, action, details, severity
  )
  VALUES (
    COALESCE(NEW.id, OLD.id),
    'profile_change',
    TG_OP,
    jsonb_build_object(
      'old_values', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
      'new_values', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
      'changed_fields', CASE 
        WHEN TG_OP = 'UPDATE' THEN (
          SELECT jsonb_object_agg(key, value)
          FROM jsonb_each(to_jsonb(NEW))
          WHERE to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key
        )
        ELSE NULL
      END
    ),
    CASE 
      WHEN TG_OP = 'DELETE' THEN 'medium'
      WHEN TG_OP = 'UPDATE' AND OLD.role_id IS DISTINCT FROM NEW.role_id THEN 'high'
      ELSE 'low'
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit trigger to profiles table
DROP TRIGGER IF EXISTS trigger_audit_profile_changes ON public.profiles;
CREATE TRIGGER trigger_audit_profile_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_changes();

-- Input validation enhancement function
CREATE OR REPLACE FUNCTION public.validate_input_security(
  p_input TEXT,
  p_type TEXT DEFAULT 'general'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Null check
  IF p_input IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Basic XSS prevention
  IF p_input ~ '<[^>]*script' OR p_input ~ 'javascript:' OR p_input ~ 'vbscript:' THEN
    RETURN FALSE;
  END IF;
  
  -- SQL injection patterns
  IF p_input ~* '(union|select|insert|update|delete|drop|create|alter)\s' THEN
    RETURN FALSE;
  END IF;
  
  -- Type-specific validations
  CASE p_type
    WHEN 'email' THEN
      RETURN p_input ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
    WHEN 'url' THEN
      RETURN p_input ~* '^https?://[^\s/$.?#].[^\s]*$';
    WHEN 'phone' THEN
      RETURN p_input ~ '^\+?[1-9]\d{1,14}$';
    ELSE
      RETURN length(p_input) <= 1000; -- General length limit
  END CASE;
END;
$$;

-- Security metrics function
CREATE OR REPLACE FUNCTION public.get_security_metrics(
  p_user_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 7
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  total_violations INTEGER;
  critical_violations INTEGER;
  recent_violations INTEGER;
  top_violation_types JSONB;
BEGIN
  -- Total violations
  SELECT COUNT(*) INTO total_violations
  FROM public.security_violations
  WHERE (p_user_id IS NULL OR user_id = p_user_id);
  
  -- Critical violations
  SELECT COUNT(*) INTO critical_violations
  FROM public.security_violations
  WHERE (p_user_id IS NULL OR user_id = p_user_id)
    AND severity = 'critical';
  
  -- Recent violations
  SELECT COUNT(*) INTO recent_violations
  FROM public.security_violations
  WHERE (p_user_id IS NULL OR user_id = p_user_id)
    AND created_at >= (now() - (p_days || ' days')::interval);
  
  -- Top violation types
  SELECT jsonb_agg(
    jsonb_build_object(
      'type', violation_type,
      'count', count
    )
  ) INTO top_violation_types
  FROM (
    SELECT violation_type, COUNT(*) as count
    FROM public.security_violations
    WHERE (p_user_id IS NULL OR user_id = p_user_id)
      AND created_at >= (now() - (p_days || ' days')::interval)
    GROUP BY violation_type
    ORDER BY count DESC
    LIMIT 5
  ) t;
  
  -- Build result
  result := jsonb_build_object(
    'total_violations', total_violations,
    'critical_violations', critical_violations,
    'recent_violations', recent_violations,
    'top_violation_types', COALESCE(top_violation_types, '[]'::jsonb),
    'period_days', p_days,
    'generated_at', now()
  );
  
  RETURN result;
END;
$$;

-- Session cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions_enhanced()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired sessions
  WITH deleted AS (
    DELETE FROM public.user_sessions 
    WHERE expires_at < now() OR (is_active = false AND created_at < now() - interval '7 days')
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  -- Clean old rate limits
  DELETE FROM public.rate_limits 
  WHERE window_start < (now() - interval '24 hours');
  
  -- Log cleanup activity
  INSERT INTO public.audit_logs (event_type, action, details)
  VALUES ('system_maintenance', 'session_cleanup', 
          jsonb_build_object('sessions_deleted', deleted_count, 'timestamp', now()));
  
  RETURN deleted_count;
END;
$$;