
import { FC, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { processUserProfile } from '@/hooks/auth/utils/authSessionUtils';
import { toast } from 'sonner';
import { redirectToDomain } from '@/utils/authUtils';
import { logger } from '@/utils/logger';

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  authError: Error | null;
}

interface AuthStateManagerProps {
  onStateChange: (newState: Partial<AuthState>) => void;
}

export const AuthStateManager: FC<AuthStateManagerProps> = ({ onStateChange }) => {
  useEffect(() => {
    let loadingTimeout: NodeJS.Timeout;
    let mounted = true;
    
    const setupAuthListener = () => {
      console.log("AuthStateManager: Configurando listener de autenticação");
      
      // Iniciar com carregando = true
      onStateChange({ isLoading: true });
      
      // Timeout de segurança mais agressivo
      loadingTimeout = setTimeout(() => {
        if (mounted) {
          console.warn("AuthStateManager: Timeout de carregamento atingido, forçando fim do loading");
          onStateChange({ isLoading: false });
        }
      }, 3000); // Reduzido para 3 segundos

      // Configurar listener para mudanças de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;
          
          console.log("AuthStateManager: Evento de autenticação", { event, userId: session?.user?.id });

          // Limpar timeout se temos uma resposta
          if (loadingTimeout) {
            clearTimeout(loadingTimeout);
          }

          if (event === 'SIGNED_IN') {
            onStateChange({ 
              session, 
              user: session?.user || null,
              isLoading: false // Importante: finalizar loading imediatamente
            });

            // Processar perfil em segundo plano de forma não-bloqueante
            if (session?.user) {
              setTimeout(async () => {
                if (!mounted) return;
                
                try {
                  const profile = await processUserProfile(
                    session.user.id,
                    session.user.email,
                    session.user.user_metadata?.name
                  );

                  if (mounted) {
                    onStateChange({
                      profile,
                      isAdmin: profile?.role === 'admin',
                      isFormacao: profile?.role === 'formacao'
                    });
                  }
                } catch (error) {
                  console.error("AuthStateManager: Erro ao processar perfil", error);
                  // Não bloquear a UI por erro de perfil
                }
              }, 0);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log("AuthStateManager: Usuário desconectado");
            onStateChange({
              session: null,
              user: null,
              profile: null,
              isAdmin: false,
              isFormacao: false,
              isLoading: false
            });
          } else if (event === 'TOKEN_REFRESHED') {
            console.log("AuthStateManager: Token atualizado");
            onStateChange({ 
              session, 
              user: session?.user || null 
            });
          }
        }
      );

      // Verificar sessão atual com timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Session check timeout")), 2000)
      );

      Promise.race([sessionPromise, timeoutPromise])
        .then(async (result: any) => {
          if (!mounted) return;
          
          const { data: { session } } = result;
          console.log("AuthStateManager: Verificando sessão atual", { userId: session?.user?.id });

          // Limpar timeout
          if (loadingTimeout) {
            clearTimeout(loadingTimeout);
          }

          onStateChange({ 
            session, 
            user: session?.user || null,
            isLoading: false // Sempre finalizar loading
          });

          // Processar perfil se houver sessão ativa
          if (session?.user) {
            setTimeout(async () => {
              if (!mounted) return;
              
              try {
                const profile = await processUserProfile(
                  session.user.id,
                  session.user.email,
                  session.user.user_metadata?.name
                );

                if (mounted) {
                  onStateChange({
                    profile,
                    isAdmin: profile?.role === 'admin',
                    isFormacao: profile?.role === 'formacao'
                  });
                }
              } catch (error) {
                console.error("AuthStateManager: Erro ao processar perfil inicial", error);
              }
            }, 0);
          }
        })
        .catch(error => {
          if (!mounted) return;
          
          console.error("AuthStateManager: Erro ao verificar sessão", error);
          
          // Limpar timeout e finalizar loading mesmo com erro
          if (loadingTimeout) {
            clearTimeout(loadingTimeout);
          }
          
          onStateChange({ 
            isLoading: false, 
            authError: error instanceof Error ? error : new Error('Erro desconhecido') 
          });
        });

      // Limpeza ao desmontar
      return () => {
        mounted = false;
        console.log("AuthStateManager: Limpando listener");
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }
        subscription.unsubscribe();
      };
    };

    return setupAuthListener();
  }, [onStateChange]);

  // Este componente não renderiza nada, apenas gerencia o estado
  return null;
};
