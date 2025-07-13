-- ===================================================
-- SECURITY HARDENING - ENHANCED MONITORING & RATE LIMITING
-- ===================================================

-- 1. Create rate limiting table for sensitive operations
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, operation_type, window_start)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limiting policies
CREATE POLICY "Users can view their own rate limits"
  ON public.rate_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Rate limits insert policy"
  ON public.rate_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all rate limits"
  ON public.rate_limits FOR ALL
  USING (is_user_admin(auth.uid()));

-- 2. Create security events table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Security events policies
CREATE POLICY "Admins can manage all security events"
  ON public.security_events FOR ALL
  USING (is_user_admin(auth.uid()));

-- Users can only view their own non-critical events
CREATE POLICY "Users can view their own security events"
  ON public.security_events FOR SELECT
  USING (auth.uid() = user_id AND severity IN ('low', 'medium'));

-- 3. Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_operation_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_window TIMESTAMP WITH TIME ZONE;
  current_attempts INTEGER := 0;
  is_limited BOOLEAN := FALSE;
BEGIN
  -- Calculate current window start
  current_window := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::INTEGER / p_window_minutes) * 
    (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get current attempts in this window
  SELECT COALESCE(attempts, 0) INTO current_attempts
  FROM public.rate_limits
  WHERE user_id = p_user_id 
    AND operation_type = p_operation_type
    AND window_start = current_window;
  
  -- Check if limit exceeded
  is_limited := current_attempts >= p_max_attempts;
  
  -- Insert or update rate limit record
  INSERT INTO public.rate_limits (
    user_id, 
    operation_type, 
    attempts, 
    window_start
  )
  VALUES (
    p_user_id, 
    p_operation_type, 
    1, 
    current_window
  )
  ON CONFLICT (user_id, operation_type, window_start) 
  DO UPDATE SET 
    attempts = rate_limits.attempts + 1,
    updated_at = now();
  
  -- Log security event if rate limited
  IF is_limited THEN
    INSERT INTO public.security_events (
      event_type,
      severity,
      user_id,
      event_data
    )
    VALUES (
      'rate_limit_exceeded',
      'medium',
      p_user_id,
      jsonb_build_object(
        'operation', p_operation_type,
        'attempts', current_attempts + 1,
        'window_start', current_window,
        'max_attempts', p_max_attempts
      )
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', NOT is_limited,
    'current_attempts', current_attempts + 1,
    'max_attempts', p_max_attempts,
    'window_start', current_window,
    'reset_at', current_window + (p_window_minutes || ' minutes')::INTERVAL
  );
END;
$$;

-- 4. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_severity TEXT DEFAULT 'low',
  p_user_id UUID DEFAULT auth.uid(),
  p_event_data JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    event_type,
    severity,
    user_id,
    event_data,
    ip_address,
    user_agent
  )
  VALUES (
    p_event_type,
    p_severity,
    p_user_id,
    p_event_data,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO event_id;
  
  -- If critical event, also log to audit_logs
  IF p_severity = 'critical' THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      severity,
      details
    )
    VALUES (
      p_user_id,
      'security_incident',
      p_event_type,
      p_severity,
      p_event_data
    );
  END IF;
  
  RETURN event_id;
END;
$$;

-- 5. Enhanced secure_assign_role function with rate limiting
CREATE OR REPLACE FUNCTION public.secure_assign_role(
  target_user_id UUID,
  new_role_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  admin_user_id UUID;
  rate_limit_result JSONB;
  old_role_id UUID;
  result JSONB;
BEGIN
  admin_user_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT is_user_admin(admin_user_id) THEN
    PERFORM log_security_event(
      'unauthorized_role_change',
      'high',
      admin_user_id,
      jsonb_build_object(
        'target_user', target_user_id,
        'attempted_role', new_role_id
      )
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Unauthorized: Admin access required'
    );
  END IF;
  
  -- Check rate limit for role changes
  SELECT check_rate_limit(admin_user_id, 'role_change', 10, 60) INTO rate_limit_result;
  
  IF NOT (rate_limit_result->>'allowed')::BOOLEAN THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Rate limit exceeded for role changes',
      'rate_limit', rate_limit_result
    );
  END IF;
  
  -- Get current role for logging
  SELECT role_id INTO old_role_id
  FROM public.profiles
  WHERE id = target_user_id;
  
  -- Perform role update
  UPDATE public.profiles
  SET role_id = new_role_id,
      updated_at = now()
  WHERE id = target_user_id;
  
  -- Log successful role change
  PERFORM log_security_event(
    'role_change_success',
    'medium',
    admin_user_id,
    jsonb_build_object(
      'target_user', target_user_id,
      'old_role', old_role_id,
      'new_role', new_role_id
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Role updated successfully',
    'old_role', old_role_id,
    'new_role', new_role_id
  );
END;
$$;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_operation 
  ON public.rate_limits(user_id, operation_type, window_start);

CREATE INDEX IF NOT EXISTS idx_security_events_user_severity 
  ON public.security_events(user_id, severity, created_at);

CREATE INDEX IF NOT EXISTS idx_security_events_type_severity 
  ON public.security_events(event_type, severity, created_at);

-- 7. Create triggers for automatic cleanup
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete rate limit records older than 24 hours
  DELETE FROM public.rate_limits
  WHERE created_at < now() - INTERVAL '24 hours';
  
  RETURN NULL;
END;
$$;

-- Create trigger to cleanup old rate limits periodically
DROP TRIGGER IF EXISTS trigger_cleanup_rate_limits ON public.rate_limits;
CREATE TRIGGER trigger_cleanup_rate_limits
  AFTER INSERT ON public.rate_limits
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.cleanup_old_rate_limits();

-- Add audit log for security hardening completion
INSERT INTO public.audit_logs (
  event_type,
  action,
  severity,
  details
) VALUES (
  'security_hardening',
  'enhanced_monitoring_deployed',
  'info',
  jsonb_build_object(
    'features', ARRAY[
      'rate_limiting',
      'security_events_monitoring', 
      'enhanced_role_validation',
      'automated_cleanup'
    ],
    'timestamp', now(),
    'version', '1.0'
  )
);