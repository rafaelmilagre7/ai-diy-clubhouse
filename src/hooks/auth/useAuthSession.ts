
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { processUserProfile } from './utils/authSessionUtils';

export const useAuthSession = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const maxRetries = 3;

  useEffect(() => {
    const initSession = async () => {
      try {
        console.info('Inicializando sessão de autenticação...');
        
        // Configurar o listener de alterações de autenticação primeiro
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log(`Evento de autenticação: ${event}`, newSession?.user?.id || 'sem usuário');
            
            setSession(newSession);
            setUser(newSession?.user || null);
            
            if (newSession?.user) {
              // Processar perfil do usuário quando houver alteração na sessão
              try {
                const userId = newSession.user.id;
                const email = newSession.user.email;
                const name = newSession.user.user_metadata?.name || newSession.user.user_metadata?.full_name;
                await processUserProfile(userId, email, name);
              } catch (profileError) {
                console.error('Erro ao processar perfil após mudança de estado:', profileError);
              }
            }
          }
        );
        
        // Em seguida, obter a sessão existente
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
          setSession(session);
          setUser(session.user);
          
          // Processar perfil do usuário
          await processUserProfile(userId, email, name);
        } else {
          console.info('Nenhuma sessão ativa encontrada');
          setSession(null);
          setUser(null);
        }
        
        setIsInitializing(false);
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
          setIsInitializing(false);
        }
      }
    };

    if (isInitializing) {
      initSession();
    }

    return () => {
      // Limpar subscription se necessário
    };
  }, [isInitializing, retryCount, maxRetries, authError]);

  return {
    isInitializing,
    authError,
    retryCount,
    maxRetries,
    user,
    session,
    setRetryCount,
    setIsInitializing,
    setAuthError
  };
};
