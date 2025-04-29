
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { processUserProfile } from './utils/authSessionUtils';

export const useAuthSession = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const initSession = async () => {
      try {
        console.info('Initializing authentication session...');
        
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
        }
        
      } catch (error: any) {
        console.error('Erro ao inicializar sessão:', error);
        setAuthError(error);
        
        // Tentativa automática de reinicialização
        if (retryCount < maxRetries) {
          console.warn(`Tentando reinicializar sessão (${retryCount + 1}/${maxRetries})...`);
          setRetryCount(prev => prev + 1);
          // Não definir isInitializing como false ainda, para tentar novamente
          return;
        } else {
          toast({
            title: 'Erro de autenticação',
            description: 'Não foi possível inicializar sua sessão. Por favor, tente novamente mais tarde.',
            variant: 'destructive',
          });
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
