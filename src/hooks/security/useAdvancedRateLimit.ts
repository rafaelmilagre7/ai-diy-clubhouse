import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdvancedRateLimitConfig {
  maxAttempts?: number;
  windowMinutes?: number;
  identifier?: string;
  escalationFactor?: number; // Increase penalty for repeated violations
  blockDurationMinutes?: number; // How long to block after max attempts
}

interface RateLimitState {
  isBlocked: boolean;
  remainingAttempts: number | null;
  resetTime: Date | null;
  escalationLevel: number;
  blockReason: string | null;
}

export const useAdvancedRateLimit = () => {
  const [state, setState] = useState<RateLimitState>({
    isBlocked: false,
    remainingAttempts: null,
    resetTime: null,
    escalationLevel: 0,
    blockReason: null
  });

  const checkRateLimit = useCallback(async (
    actionType: string,
    config: AdvancedRateLimitConfig = {}
  ): Promise<boolean> => {
    const {
      maxAttempts = 5,
      windowMinutes = 15,
      identifier = getAdvancedFingerprint(),
      escalationFactor = 2,
      blockDurationMinutes = 30
    } = config;

    try {
      // Check current rate limit status
      const { data: rateLimitData, error } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .eq('action_type', actionType)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Rate limit check failed:', error);
        return true; // Allow on error
      }

      const now = new Date();
      const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

      // Get recent attempts
      const { data: recentAttempts } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .eq('action_type', actionType)
        .gte('created_at', windowStart.toISOString());

      const attemptCount = recentAttempts?.length || 0;
      
      // Check for escalation pattern (multiple violations)
      const { data: violationHistory } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .gte('attempt_count', maxAttempts);

      const escalationLevel = violationHistory?.length || 0;
      const adjustedMaxAttempts = Math.max(1, maxAttempts - escalationLevel);
      const adjustedBlockDuration = blockDurationMinutes * Math.pow(escalationFactor, escalationLevel);

      // Check if currently blocked
      if (rateLimitData && rateLimitData.attempt_count >= adjustedMaxAttempts) {
        const blockEnd = new Date(
          new Date(rateLimitData.created_at).getTime() + adjustedBlockDuration * 60 * 1000
        );
        
        if (now < blockEnd) {
          setState({
            isBlocked: true,
            remainingAttempts: 0,
            resetTime: blockEnd,
            escalationLevel,
            blockReason: escalationLevel > 0 
              ? `Bloqueio escalado devido a violações repetidas (nível ${escalationLevel})`
              : 'Limite de tentativas excedido'
          });
          return false;
        }
      }

      // Check if new attempt would exceed limit
      if (attemptCount >= adjustedMaxAttempts) {
        // Record the violation
        await supabase.from('rate_limits').insert({
          identifier,
          action_type: actionType,
          attempt_count: attemptCount + 1,
          created_at: now.toISOString()
        });

        const resetTime = new Date(now.getTime() + adjustedBlockDuration * 60 * 1000);
        
        setState({
          isBlocked: true,
          remainingAttempts: 0,
          resetTime,
          escalationLevel,
          blockReason: escalationLevel > 0 
            ? `Bloqueio escalado devido a violações repetidas (nível ${escalationLevel})`
            : 'Limite de tentativas excedido'
        });

        // Log security event for repeated violations
        if (escalationLevel > 0) {
          await supabase.from('audit_logs').insert({
            event_type: 'security_event',
            action: 'rate_limit_escalation',
            user_id: null,
            details: {
              action_type: actionType,
              escalation_level: escalationLevel,
              identifier: identifier.slice(0, 8) + '***', // Partial identifier for privacy
              block_duration_minutes: adjustedBlockDuration
            },
            severity: 'high'
          });
        }

        return false;
      }

      // Record successful check
      await supabase.from('rate_limits').insert({
        identifier,
        action_type: actionType,
        attempt_count: attemptCount + 1,
        created_at: now.toISOString()
      });

      setState({
        isBlocked: false,
        remainingAttempts: adjustedMaxAttempts - attemptCount - 1,
        resetTime: null,
        escalationLevel,
        blockReason: null
      });

      return true;

    } catch (error) {
      console.error('Advanced rate limit error:', error);
      return true; // Allow on error to prevent blocking legitimate users
    }
  }, []);

  const resetRateLimit = useCallback(async (actionType: string, identifier?: string) => {
    try {
      const targetIdentifier = identifier || getAdvancedFingerprint();
      
      await supabase
        .from('rate_limits')
        .delete()
        .eq('identifier', targetIdentifier)
        .eq('action_type', actionType);

      setState({
        isBlocked: false,
        remainingAttempts: null,
        resetTime: null,
        escalationLevel: 0,
        blockReason: null
      });

      return true;
    } catch (error) {
      console.error('Failed to reset rate limit:', error);
      return false;
    }
  }, []);

  return {
    checkRateLimit,
    resetRateLimit,
    ...state
  };
};

// Enhanced device fingerprinting
function getAdvancedFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Create a more sophisticated fingerprint
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Advanced fingerprint test 🔒', 2, 2);
  }
  
  const factors = [
    navigator.userAgent,
    navigator.language,
    navigator.languages?.join(',') || '',
    screen.width + 'x' + screen.height,
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || '',
    (navigator as any).deviceMemory?.toString() || '',
    canvas.toDataURL(),
    // Add more sophisticated factors
    navigator.cookieEnabled.toString(),
    navigator.doNotTrack || '',
    (window.devicePixelRatio || 1).toString()
  ];
  
  const combined = factors.join('|');
  
  // Create a hash using a simple algorithm
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36).slice(0, 32);
}