import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface RateLimitConfig {
  maxAttempts?: number;
  windowMinutes?: number;
  identifier?: string;
}

export const useRateLimit = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [resetTime, setResetTime] = useState<Date | null>(null);

  const checkRateLimit = useCallback(async (
    actionType: string,
    config: RateLimitConfig = {}
  ): Promise<boolean> => {
    const {
      maxAttempts = 5,
      windowMinutes = 15,
      identifier = getDeviceFingerprint()
    } = config;

    try {
      // CORREÇÃO: Usar função mais permissiva para convites
      const functionName = actionType.includes('invite') ? 'check_invite_rate_limit' : 'check_rate_limit';
      const { data: allowed, error } = await supabase.rpc(functionName, {
        p_action_type: actionType,
        p_identifier: identifier,
        p_max_attempts: maxAttempts,
        p_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return true; // Allow on error to prevent blocking legitimate users
      }

      setIsBlocked(!allowed);
      
      if (!allowed) {
        setResetTime(new Date(Date.now() + windowMinutes * 60 * 1000));
        setRemainingAttempts(0);
      } else {
        // Get current attempt count
        const { data: rateData } = await supabase
          .from('rate_limits')
          .select('attempt_count')
          .eq('identifier', identifier)
          .eq('action_type', actionType)
          .single();

        if (rateData) {
          setRemainingAttempts(maxAttempts - rateData.attempt_count);
        }
      }

      return allowed;
    } catch (error) {
      console.error('Rate limit error:', error);
      return true; // Allow on error
    }
  }, []);

  return {
    checkRateLimit,
    isBlocked,
    remainingAttempts,
    resetTime
  };
};

// Generate a simple device fingerprint
function getDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('fingerprint', 10, 10);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  return btoa(fingerprint).slice(0, 32);
}