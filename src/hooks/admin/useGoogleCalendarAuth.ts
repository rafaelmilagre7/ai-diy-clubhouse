
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { secureStorage } from '@/utils/tokenEncryption';

export interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: {
    conferenceId: string;
    conferenceSolution: {
      name: string;
      key: {
        type: string;
      };
    };
    entryPoints: {
      entryPointType: string;
      uri: string;
      label?: string;
    }[];
  };
}

interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  user_info: {
    email: string;
    name: string;
    picture: string;
  };
}

export const useGoogleCalendarAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; name: string; picture: string } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isAuthInitiating, setIsAuthInitiating] = useState(false);

  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) return;

        const storedTokens = secureStorage.getItem('google_calendar_auth', user.data.user.id) as GoogleCalendarTokens | null;
        const expiryString = localStorage.getItem('google_calendar_expiry');

        if (storedTokens && expiryString) {
          // Convertendo explicitamente para number usando parseInt com base 10
          const expiryTime = parseInt(expiryString, 10);
          const now = new Date().getTime();
          
          if (now < expiryTime) {
            setAccessToken(storedTokens.access_token);
            setUserInfo(storedTokens.user_info);
            setIsAuthenticated(true);
            console.log('Sessão do Google Calendar restaurada');
          } else {
            console.log('Token expirado, removendo...');
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Erro ao verificar token armazenado:', error);
        handleLogout();
      }
    };

    checkStoredAuth();
  }, []);

  const initiateLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsAuthInitiating(true);
      setLastError(null);
      
      const state = crypto.randomUUID();
      localStorage.setItem('google_auth_state', state);
      
      console.log('Iniciando autenticação do Google Calendar com state:', state);
      
      const { data, error } = await supabase.functions.invoke<{url: string}>('google-calendar-auth', {
        body: {}
      });
      
      if (error) throw error;
      if (!data?.url) throw new Error('URL de autorização não retornada');
      
      console.log('URL de autorização gerada:', data.url);
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Erro ao iniciar autenticação:', error);
      setLastError(error instanceof Error ? error.message : 'Erro desconhecido na autenticação');
      toast.error('Não foi possível conectar ao Google Calendar. Por favor, tente novamente.');
      setIsLoading(false);
      setIsAuthInitiating(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        secureStorage.removeItem('google_calendar_auth');
      } else {
        // Fallback caso não consiga obter usuário
        secureStorage.removeItem('google_calendar_auth');
      }
      
      localStorage.removeItem('google_calendar_expiry');
      setAccessToken(null);
      setUserInfo(null);
      setIsAuthenticated(false);
      setLastError(null);
      toast.success('Desconectado do Google Calendar');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao desconectar do Google Calendar');
    }
  }, []);

  return {
    isLoading,
    isAuthenticated,
    userInfo,
    lastError,
    isAuthInitiating,
    accessToken, // Exportando explicitamente o accessToken
    initiateLogin,
    handleLogout
  };
};
