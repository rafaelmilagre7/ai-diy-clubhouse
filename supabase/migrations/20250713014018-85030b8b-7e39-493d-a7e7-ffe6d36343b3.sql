-- ===================================================
-- SECURITY HARDENING - ENHANCED MONITORING (FINAL)
-- ===================================================

-- 1. Create security events table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
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

-- 2. Create function to log security events
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
      'high',
      p_event_data
    );
  END IF;
  
  RETURN event_id;
END;
$$;

-- 3. Enhanced secure_assign_role function with better logging
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

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_user_severity 
  ON public.security_events(user_id, severity, created_at);

CREATE INDEX IF NOT EXISTS idx_security_events_type_severity 
  ON public.security_events(event_type, severity, created_at);

-- Log completion of security hardening (using valid severity)
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'security_hardening',
  'enhanced_monitoring_deployed',
  jsonb_build_object(
    'features', ARRAY[
      'security_events_monitoring', 
      'enhanced_role_validation',
      'improved_audit_logging'
    ],
    'timestamp', now(),
    'version', '2.0'
  )
);