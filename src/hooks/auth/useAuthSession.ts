
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { processUserProfile } from './utils/authSessionUtils';

export const useAuthSession = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const initSession = async () => {
      try {
        console.info('Inicializando sessão de autenticação...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        console.info('Verificando sessão atual');
        
        if (session) {
          const userId = session.user.id;
          const email = session.user.email;
          const name = session.user.user_metadata?.name || session.user.user_metadata?.full_name;
          
          console.info(`Sessão ativa encontrada: ${userId}`);
          
          // Processar perfil do usuário
          await processUserProfile(userId, email, name);
        } else {
          console.info('Nenhuma sessão ativa encontrada');
        }
        
      } catch (error: any) {
        console.error('Erro ao inicializar sessão:', error);
        setAuthError(error);
        
        // Tentativa automática de reinicialização
        if (retryCount < maxRetries) {
          console.warn(`Tentando reinicializar sessão (${retryCount + 1}/${maxRetries})...`);
          setRetryCount(prev => prev + 1);
          return;
        } else {
          toast("Erro de autenticação. Tente fazer login novamente.");
        }
      } finally {
        // Marcar inicialização como concluída apenas se não estiver tentando novamente
        if (retryCount >= maxRetries || !authError) {
          setIsInitializing(false);
        }
      }
    };

    if (isInitializing) {
      initSession();
    }
  }, [isInitializing, retryCount, maxRetries, authError]);

  return {
    isInitializing,
    authError,
    retryCount,
    maxRetries,
    setRetryCount,
    setIsInitializing,
    setAuthError
  };
};
