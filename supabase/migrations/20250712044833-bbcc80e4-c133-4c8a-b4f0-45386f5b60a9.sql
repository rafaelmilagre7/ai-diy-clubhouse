-- Security Enhancement Phase 1: Rate Limiting & Session Management (Fixed)
-- ========================================================================

-- 1. Rate Limiting Infrastructure
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP address, user ID, etc.
  action_type TEXT NOT NULL, -- 'login', 'registration', 'password_reset', etc.
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for efficient rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON public.rate_limits(identifier, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start);

-- 2. Session Management Enhancement
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Index for session management
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active, expires_at);

-- 3. Security Violations Enhancement
CREATE TABLE IF NOT EXISTS public.security_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  violation_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  resource_accessed TEXT,
  additional_data JSONB DEFAULT '{}',
  auto_blocked BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for security violations
CREATE INDEX IF NOT EXISTS idx_security_violations_user_id ON public.security_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_security_violations_type ON public.security_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_security_violations_severity ON public.security_violations(severity);
CREATE INDEX IF NOT EXISTS idx_security_violations_created_at ON public.security_violations(created_at);

-- 4. Enable RLS on new tables
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_violations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for rate_limits
CREATE POLICY "Admins can view all rate limits" ON public.rate_limits
  FOR SELECT USING (is_admin());

CREATE POLICY "System can manage rate limits" ON public.rate_limits
  FOR ALL USING (true); -- System operations need full access

-- 6. RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT USING (is_admin());

-- 7. RLS Policies for security_violations
CREATE POLICY "Users can view their own violations" ON public.security_violations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all violations" ON public.security_violations
  FOR ALL USING (is_admin());

CREATE POLICY "System can create violations" ON public.security_violations
  FOR INSERT WITH CHECK (true);

-- 8. Security Functions

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_attempts INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Clean up old rate limit records
  DELETE FROM public.rate_limits 
  WHERE window_start < (now() - interval '1 hour');
  
  -- Get current window start
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Check current attempts in window
  SELECT COALESCE(SUM(attempt_count), 0) INTO current_attempts
  FROM public.rate_limits
  WHERE identifier = p_identifier 
    AND action_type = p_action_type
    AND window_start >= window_start
    AND (blocked_until IS NULL OR blocked_until < now());
  
  -- If within limits, record attempt and allow
  IF current_attempts < p_max_attempts THEN
    INSERT INTO public.rate_limits (identifier, action_type, attempt_count, window_start)
    VALUES (p_identifier, p_action_type, 1, now())
    ON CONFLICT (identifier, action_type) 
    DO UPDATE SET 
      attempt_count = rate_limits.attempt_count + 1,
      updated_at = now();
    
    RETURN TRUE;
  ELSE
    -- Block for additional time
    UPDATE public.rate_limits 
    SET blocked_until = now() + (p_window_minutes || ' minutes')::interval
    WHERE identifier = p_identifier AND action_type = p_action_type;
    
    RETURN FALSE;
  END IF;
END;
$$;

-- Session management function
CREATE OR REPLACE FUNCTION public.manage_user_session(
  p_user_id UUID,
  p_session_token TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id UUID;
  max_sessions INTEGER := 3; -- Maximum concurrent sessions per user
BEGIN
  -- Clean up expired sessions
  DELETE FROM public.user_sessions 
  WHERE expires_at < now() OR user_id = p_user_id;
  
  -- Check session limit
  IF (SELECT COUNT(*) FROM public.user_sessions WHERE user_id = p_user_id AND is_active = true) >= max_sessions THEN
    -- Deactivate oldest session
    UPDATE public.user_sessions 
    SET is_active = false 
    WHERE user_id = p_user_id 
      AND is_active = true 
      AND id = (
        SELECT id FROM public.user_sessions 
        WHERE user_id = p_user_id AND is_active = true 
        ORDER BY last_activity ASC 
        LIMIT 1
      );
  END IF;
  
  -- Create new session
  INSERT INTO public.user_sessions (user_id, session_token, ip_address, user_agent)
  VALUES (p_user_id, p_session_token, p_ip_address, p_user_agent)
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;