
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
  // Configurar listener de mudanças de estado de autenticação
  useEffect(() => {
    const setupAuthListener = async () => {
      // Iniciar com carregando = true
      onStateChange({ isLoading: true });

      logger.debug("Configurando listener de autenticação");
      console.log("[AuthStateManager] Iniciando configuração de autenticação");

      // Configurar listener para mudanças de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          logger.debug("Evento de autenticação", { event, userId: session?.user?.id });
          console.log("[AuthStateManager] Evento de auth:", event, session?.user?.id);

          if (event === 'SIGNED_IN') {
            onStateChange({ session, user: session?.user || null });

            // Verificar se é um login inicial ou apenas uma atualização de sessão
            const isInitialLogin = !localStorage.getItem('lastAuthRoute');
            
            // Apenas redirecionar para o domínio correto em logins iniciais
            if (isInitialLogin) {
              const currentOrigin = window.location.origin;
              const targetDomain = 'https://app.viverdeia.ai';

              // Redirecionar apenas se for um domínio de produção diferente do alvo
              if (!currentOrigin.includes('localhost') && currentOrigin !== targetDomain) {
                toast.info("Redirecionando para o domínio principal...");
                const currentPath = window.location.pathname;
                redirectToDomain(currentPath);
                return;
              }
            }

            // Processar perfil do usuário imediatamente (sem timeout)
            if (session?.user) {
              try {
                console.log("[AuthStateManager] Processando profile para:", session.user.id);
                const profile = await processUserProfile(
                  session.user.id,
                  session.user.email,
                  session.user.user_metadata?.name
                );

                console.log("[AuthStateManager] Profile processado:", profile);
                onStateChange({
                  profile,
                  isAdmin: profile?.role === 'admin',
                  isFormacao: profile?.role === 'formacao',
                  isLoading: false
                });
              } catch (error) {
                logger.error("Erro ao processar perfil", error);
                console.error("[AuthStateManager] Erro ao processar profile:", error);
                onStateChange({ isLoading: false });
              }
            } else {
              onStateChange({ isLoading: false });
            }
          } else if (event === 'SIGNED_OUT') {
            logger.debug("Usuário desconectado, limpando estado");
            console.log("[AuthStateManager] Usuário desconectado");
            onStateChange({
              session: null,
              user: null,
              profile: null,
              isAdmin: false,
              isFormacao: false,
              isLoading: false
            });
          } else if (event === 'USER_UPDATED') {
            logger.debug("Dados do usuário atualizados");
            onStateChange({ session, user: session?.user || null });
          }
        }
      );

      // Verificar sessão atual imediatamente
      try {
        console.log("[AuthStateManager] Verificando sessão atual");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[AuthStateManager] Erro ao verificar sessão:", error);
          onStateChange({ isLoading: false, authError: error });
          return;
        }

        logger.debug("Verificando sessão atual", { userId: session?.user?.id });
        console.log("[AuthStateManager] Sessão atual:", session?.user?.id);

        onStateChange({ session, user: session?.user || null });

        // Processar perfil do usuário se houver sessão ativa
        if (session?.user) {
          try {
            console.log("[AuthStateManager] Processando profile na inicialização para:", session.user.id);
            const profile = await processUserProfile(
              session.user.id,
              session.user.email,
              session.user.user_metadata?.name
            );

            console.log("[AuthStateManager] Profile carregado na inicialização:", profile);
            onStateChange({
              profile,
              isAdmin: profile?.role === 'admin',
              isFormacao: profile?.role === 'formacao',
              isLoading: false
            });
          } catch (error) {
            logger.error("Erro ao processar perfil na inicialização", error);
            console.error("[AuthStateManager] Erro ao processar profile na inicialização:", error);
            onStateChange({ isLoading: false });
          }
        } else {
          console.log("[AuthStateManager] Nenhuma sessão ativa, finalizando loading");
          onStateChange({ isLoading: false });
        }
      } catch (error) {
        logger.error("Erro ao verificar sessão", error);
        console.error("[AuthStateManager] Erro crítico ao verificar sessão:", error);
        onStateChange({ isLoading: false, authError: error instanceof Error ? error : new Error('Erro desconhecido') });
      }

      // Limpeza ao desmontar
      return () => {
        logger.debug("Limpando listener de autenticação");
        subscription.unsubscribe();
      };
    };

    // Inicializar listener
    const cleanup = setupAuthListener();
    
    return () => {
      cleanup.then(cleanupFn => {
        if (cleanupFn) cleanupFn();
      });
    };
  }, [onStateChange]);

  // Este componente não renderiza nada, apenas gerencia o estado
  return null;
};
