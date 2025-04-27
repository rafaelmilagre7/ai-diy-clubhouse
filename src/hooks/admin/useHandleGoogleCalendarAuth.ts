
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { secureStorage } from '@/utils/tokenEncryption';

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

const TOKEN_REFRESH_MARGIN = 5 * 60 * 1000; // 5 minutos em ms

export const useHandleGoogleCalendarAuth = () => {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<GoogleCalendarTokens | null>(null);

  // Verificar e renovar token periodicamente
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const storedTokens = secureStorage.getItem('google_calendar_auth', user.data.user.id) as GoogleCalendarTokens | null;
      const expiry = localStorage.getItem('google_calendar_expiry');

      if (!storedTokens || !expiry) return;

      const expiryTime = parseInt(expiry);
      const now = new Date().getTime();

      // Se o token vai expirar em breve ou já expirou
      if (now + TOKEN_REFRESH_MARGIN >= expiryTime) {
        console.log('Token próximo da expiração, renovando...');
        if (storedTokens.refresh_token) {
          try {
            const { data: newTokens, error: refreshError } = await supabase.functions.invoke<GoogleCalendarTokens>('google-calendar-auth', {
              body: { 
                refresh_token: storedTokens.refresh_token,
                grant_type: 'refresh_token'
              }
            });

            if (refreshError) throw refreshError;
            if (!newTokens) throw new Error('Tokens não retornados na renovação');

            const newExpiryTime = new Date().getTime() + (newTokens.expires_in * 1000);
            
            secureStorage.setItem('google_calendar_auth', newTokens, user.data.user.id);
            localStorage.setItem('google_calendar_expiry', newExpiryTime.toString());
            
            setTokens(newTokens);
            console.log('Token renovado com sucesso');
          } catch (error) {
            console.error('Erro ao renovar token:', error);
            // Se falhar a renovação, limpa os tokens e força reautenticação
            handleLogout();
            toast.error('Sessão expirada. Por favor, reconecte ao Google Calendar.');
          }
        } else {
          // Sem refresh_token disponível
          handleLogout();
          toast.error('Reconexão necessária ao Google Calendar.');
        }
      }
    };

    const interval = setInterval(checkAndRefreshToken, 60000); // Verifica a cada minuto
    checkAndRefreshToken(); // Verifica imediatamente

    return () => clearInterval(interval);
  }, []);

  const handleLogout = useCallback(() => {
    secureStorage.removeItem('google_calendar_auth');
    localStorage.removeItem('google_calendar_expiry');
    setTokens(null);
    setAuthError(null);
  }, []);

  // Processar código de autorização
  useEffect(() => {
    const processAuthCode = async () => {
      const code = searchParams.get('code');
      const receivedState = searchParams.get('state');
      const error = searchParams.get('error');
      const storedState = localStorage.getItem('google_auth_state');

      if (error) {
        console.error('Erro de autenticação retornado:', error);
        setAuthError(error);
        toast.error(`Falha na autenticação: ${error}`);
        return;
      }

      if (!code || !receivedState) {
        return;
      }

      // Validação do state para prevenir CSRF
      if (!storedState || storedState !== receivedState) {
        console.error('Estado inválido detectado:', { stored: storedState, received: receivedState });
        setAuthError('Erro de segurança: estado inválido');
        toast.error('Erro de segurança na autenticação. Tente novamente.');
        return;
      }

      localStorage.removeItem('google_auth_state'); // Limpa o state usado
      setIsProcessing(true);
      
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error('Usuário não autenticado');
        }

        console.log('Trocando código de autorização por token...');
        const { data: tokens, error: exchangeError } = await supabase.functions.invoke<GoogleCalendarTokens>('google-calendar-auth', {
          body: { code }
        });

        if (exchangeError) {
          throw new Error(`Erro ao obter token: ${exchangeError.message || 'Detalhes não disponíveis'}`);
        }

        if (!tokens || !tokens.access_token) {
          throw new Error('Token de acesso não retornado pela API');
        }

        // Armazena tokens de forma segura
        secureStorage.setItem('google_calendar_auth', tokens, user.data.user.id);
        const expiryTime = new Date().getTime() + (tokens.expires_in * 1000);
        localStorage.setItem('google_calendar_expiry', expiryTime.toString());

        setTokens(tokens);
        console.log('Token recebido e armazenado com sucesso');
        toast.success('Conectado ao Google Calendar!');
        
        return true;

      } catch (error) {
        console.error('Erro ao processar código de autorização:', error);
        setAuthError(error instanceof Error ? error.message : 'Erro desconhecido');
        toast.error('Não foi possível completar a autenticação. Por favor, tente novamente.');
        return false;
      } finally {
        setIsProcessing(false);
      }
    };

    processAuthCode();
  }, [searchParams]);

  return {
    isProcessing,
    authError,
    tokens,
    handleLogout,
    isAuthenticated: !!tokens
  };
};
