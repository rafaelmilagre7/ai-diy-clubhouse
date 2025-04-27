
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

export const useHandleGoogleCalendarAuth = () => {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const processAuthCode = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        console.error('Erro de autenticação retornado:', error);
        setAuthError(error);
        toast.error(`Falha na autenticação: ${error}`);
        return;
      }

      if (!code || !state) {
        return;
      }

      setIsProcessing(true);
      
      try {
        console.log('Trocando código de autorização por token...');
        const { data: tokens, error: exchangeError } = await supabase.functions.invoke<GoogleCalendarTokens>('google-calendar-auth', {
          body: { code }
        });

        if (exchangeError) {
          console.error('Erro ao trocar código por token:', exchangeError);
          throw new Error(`Erro ao obter token: ${exchangeError.message || 'Detalhes não disponíveis'}`);
        }

        if (!tokens || !tokens.access_token) {
          console.error('Resposta inválida:', tokens);
          throw new Error('Token de acesso não retornado pela API');
        }

        // Armazenar tokens e informações do usuário
        localStorage.setItem('google_calendar_auth', JSON.stringify(tokens));
        const expiryTime = new Date().getTime() + (tokens.expires_in * 1000);
        localStorage.setItem('google_calendar_expiry', expiryTime.toString());

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
    authError
  };
};
