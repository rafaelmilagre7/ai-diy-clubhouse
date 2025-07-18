import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

export const useSessionManager = () => {
  const { user, session } = useAuth();

  // Initialize session tracking
  useEffect(() => {
    if (user && session) {
      initializeSession();
    }
  }, [user, session]);

  // Update activity timestamp
  useEffect(() => {
    const updateActivity = () => {
      if (user && session) {
        updateSessionActivity();
      }
    };

    // Update on user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Update every 5 minutes
    const interval = setInterval(updateActivity, 5 * 60 * 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [user, session]);

  const initializeSession = useCallback(async () => {
    if (!user || !session) return;

    try {
      await supabase.rpc('manage_user_session', {
        p_user_id: user.id,
        p_session_token: session.access_token.slice(-16), // Last 16 chars as identifier
        p_ip_address: await getClientIP(),
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }, [user, session]);

  const updateSessionActivity = useCallback(async () => {
    if (!user || !session) return;

    try {
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('session_token', session.access_token.slice(-16));
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }, [user, session]);

  const invalidateAllSessions = useCallback(async () => {
    if (!user) return;

    try {
      // Mark all sessions as inactive
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error('Failed to invalidate sessions:', error);
    }
  }, [user]);

  const getUserSessions = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }, [user]);

  return {
    initializeSession,
    updateSessionActivity,
    invalidateAllSessions,
    getUserSessions
  };
};

// Get client IP address (approximate)
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}