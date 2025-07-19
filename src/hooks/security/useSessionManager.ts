
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

/**
 * useSessionManager - Hook otimizado para gerenciamento de sessões
 * 
 * MELHORIAS DA FASE 2:
 * - Retry logic para operações falhas
 * - Cache local para evitar chamadas desnecessárias
 * - Session validation inteligente
 */
export const useSessionManager = () => {
  const { user, session } = useAuth();

  // Cache local para evitar chamadas desnecessárias
  const sessionCache = {
    lastActivity: 0,
    sessionToken: '',
    initialized: false
  };

  // Initialize session tracking com retry logic
  useEffect(() => {
    if (user && session && !sessionCache.initialized) {
      initializeSession();
      sessionCache.initialized = true;
    }
  }, [user, session]);

  // Update activity timestamp com throttling inteligente
  useEffect(() => {
    const updateActivity = () => {
      const now = Date.now();
      // Throttling: só atualizar se passou mais de 30 segundos
      if (user && session && (now - sessionCache.lastActivity > 30000)) {
        updateSessionActivity();
        sessionCache.lastActivity = now;
      }
    };

    // Update on user activity (menos eventos para melhor performance)
    const events = ['mousedown', 'keydown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Update every 10 minutes (menos frequente)
    const interval = setInterval(updateActivity, 10 * 60 * 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [user, session]);

  // Função com retry logic
  const executeWithRetry = async (operation: () => Promise<any>, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`[SESSION-MANAGER] Tentativa ${attempt}/${maxRetries} falhou:`, error);
        if (attempt === maxRetries) {
          console.error('[SESSION-MANAGER] Todas as tentativas falharam:', error);
          return null;
        }
        // Backoff exponencial
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  const initializeSession = useCallback(async () => {
    if (!user || !session) return;

    return executeWithRetry(async () => {
      await supabase.rpc('manage_user_session', {
        p_user_id: user.id,
        p_session_token: session.access_token.slice(-16),
        p_ip_address: await getClientIP(),
        p_user_agent: navigator.userAgent
      });
      console.log('[SESSION-MANAGER] Sessão inicializada com sucesso');
    });
  }, [user, session]);

  const updateSessionActivity = useCallback(async () => {
    if (!user || !session) return;

    return executeWithRetry(async () => {
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('session_token', session.access_token.slice(-16));
    });
  }, [user, session]);

  const invalidateAllSessions = useCallback(async () => {
    if (!user) return;

    return executeWithRetry(async () => {
      // Mark all sessions as inactive
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      console.log('[SESSION-MANAGER] Todas as sessões invalidadas');
    });
  }, [user]);

  const getUserSessions = useCallback(async () => {
    if (!user) return [];

    return executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      return data || [];
    }) || [];
  }, [user]);

  return {
    initializeSession,
    updateSessionActivity,
    invalidateAllSessions,
    getUserSessions
  };
};

// Get client IP address com fallback robusto
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      timeout: 5000 // 5 segundos de timeout
    } as any);
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}
