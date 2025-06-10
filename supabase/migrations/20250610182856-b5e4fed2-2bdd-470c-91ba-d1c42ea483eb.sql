
-- Migration: Fix critical rate limiter vulnerability (CORRECTED)
-- Create persistent table for rate limiting instead of in-memory cache

CREATE TABLE IF NOT EXISTS public.rate_limit_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  first_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block_until TIMESTAMP WITH TIME ZONE,
  block_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(identifier)
);

-- Performance indexes (fixed - removed NOW() from predicates)
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier ON public.rate_limit_attempts(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limit_block_until ON public.rate_limit_attempts(block_until) WHERE block_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rate_limit_last_attempt ON public.rate_limit_attempts(last_attempt);

-- Enable RLS
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only the system can access rate limit data
CREATE POLICY "rate_limit_system_only" ON public.rate_limit_attempts
  FOR ALL USING (false) WITH CHECK (false);

-- Function to clean old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove records older than 24 hours that are not blocked
  DELETE FROM public.rate_limit_attempts 
  WHERE last_attempt < NOW() - INTERVAL '24 hours'
    AND (block_until IS NULL OR block_until < NOW());
  
  -- Log cleanup action
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'system_maintenance',
    'rate_limit_cleanup',
    jsonb_build_object(
      'cleaned_at', NOW(),
      'type', 'rate_limit_cleanup'
    )
  );
END;
$$;
