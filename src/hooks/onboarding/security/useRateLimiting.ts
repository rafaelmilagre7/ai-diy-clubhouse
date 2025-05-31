
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RateLimitResult {
  allowed: boolean;
  attemptsRemaining?: number;
  blockedUntil?: string;
  reason?: string;
}

export const useRateLimiting = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkRateLimit = useCallback(async (userId: string): Promise<RateLimitResult> => {
    setIsChecking(true);
    
    try {
      const { data, error } = await supabase.rpc('check_onboarding_rate_limit', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Erro ao verificar rate limit:', error);
        // Em caso de erro na verificação, permitir por segurança
        return { allowed: true };
      }

      const result = data as RateLimitResult;

      if (!result.allowed) {
        const blockedUntil = new Date(result.blockedUntil || '');
        const timeRemaining = Math.ceil((blockedUntil.getTime() - Date.now()) / 60000);
        
        toast.error('Muitas tentativas detectadas', {
          description: `Aguarde ${timeRemaining} minutos antes de tentar novamente.`
        });
      }

      return result;
    } catch (error: any) {
      console.error('❌ Exceção ao verificar rate limit:', error);
      // Em caso de erro, permitir por segurança
      return { allowed: true };
    } finally {
      setIsChecking(false);
    }
  }, []);

  const recordAttempt = useCallback(async (userId: string) => {
    try {
      await supabase
        .from('onboarding_rate_limits')
        .upsert({
          user_id: userId,
          attempt_count: 1,
          last_attempt_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('❌ Erro ao registrar tentativa:', error);
    }
  }, []);

  return {
    checkRateLimit,
    recordAttempt,
    isChecking
  };
};
