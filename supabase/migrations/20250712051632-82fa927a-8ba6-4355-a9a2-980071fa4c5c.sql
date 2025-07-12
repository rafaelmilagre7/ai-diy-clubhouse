-- Create rate_limits table for advanced rate limiting (if not exists)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action_type TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'rate_limits' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON public.rate_limits(identifier, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON public.rate_limits(created_at);

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;
CREATE POLICY "System can manage rate limits" ON public.rate_limits
FOR ALL USING (true);

-- Create or replace the rate limit check function
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
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_attempt_count INTEGER;
BEGIN
  -- Calculate window start time
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count attempts in the current window
  SELECT COUNT(*)
  INTO v_attempt_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND created_at >= v_window_start;
  
  -- Check if limit exceeded
  IF v_attempt_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.update_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_rate_limits_updated_at ON public.rate_limits;
CREATE TRIGGER trigger_update_rate_limits_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rate_limits_updated_at();