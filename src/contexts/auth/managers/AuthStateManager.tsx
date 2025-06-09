
import { FC, useEffect, useRef } from 'react';
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

// Cache de perfil para evitar re-fetch desnecessários
const profileCache = new Map<string, { profile: UserProfile | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const AuthStateManager: FC<AuthStateManagerProps> = ({ onStateChange }) => {
  const isInitializing = useRef(false);
  
  // Função otimizada para buscar perfil com cache
  const getCachedProfile = async (userId: string, email?: string | null, name?: string): Promise<UserProfile | null> => {
    const cached = profileCache.get(userId);
    const now = Date.now();
    
    // Retornar cache se válido
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.profile;
    }
    
    try {
      // Buscar perfil com timeout de 2 segundos
      const profilePromise = processUserProfile(userId, email, name);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 2000)
      );
      
      const profile = await Promise.race([profilePromise, timeoutPromise]) as UserProfile | null;
      
      // Cachear resultado
      profileCache.set(userId, { profile, timestamp: now });
      
      return profile;
    } catch (error) {
      logger.warn("Erro ao buscar perfil, usando fallback", {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        component: 'AUTH_STATE_MANAGER'
      });
      
      // Fallback: criar perfil mínimo para não bloquear o login
      const fallbackProfile: UserProfile = {
        id: userId,
        email: email || '',
        name: name || 'Usuário',
        role: 'membro_club',
        avatar_url: null,
        company_name: null,
        industry: null,
        created_at: new Date().toISOString(),
        onboarding_completed: false,
        onboarding_completed_at: null
      };
      
      profileCache.set(userId, { profile: fallbackProfile, timestamp: now });
      return fallbackProfile;
    }
  };

  useEffect(() => {
    const setupAuthListener = async () => {
      if (isInitializing.current) return;
      isInitializing.current = true;
      
      // Iniciar com carregando = true
      onStateChange({ isLoading: true });

      // Configurar listener para mudanças de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (process.env.NODE_ENV === 'development') {
            logger.debug("Evento de autenticação", { 
              event, 
              hasUser: !!session?.user,
              component: 'AUTH_STATE_MANAGER'
            });
          }

          if (event === 'SIGNED_IN' && session?.user) {
            // Atualizar estado imediatamente
            onStateChange({ 
              session, 
              user: session.user,
              isLoading: true // Manter loading até perfil carregar
            });

            // Verificar se é um login inicial
            const isInitialLogin = !localStorage.getItem('lastAuthRoute');
            
            // Redirecionar apenas se necessário
            if (isInitialLogin) {
              const currentOrigin = window.location.origin;
              const targetDomain = 'https://app.viverdeia.ai';

              if (!currentOrigin.includes('localhost') && currentOrigin !== targetDomain) {
                toast.info("Redirecionando para o domínio principal...");
                const currentPath = window.location.pathname;
                redirectToDomain(currentPath);
                return;
              }
            }

            // Buscar perfil em paralelo com outras operações
            setTimeout(async () => {
              try {
                const profile = await getCachedProfile(
                  session.user.id,
                  session.user.email,
                  session.user.user_metadata?.name
                );

                onStateChange({
                  profile,
                  isAdmin: profile?.role === 'admin',
                  isFormacao: profile?.role === 'formacao',
                  isLoading: false
                });
              } catch (error) {
                logger.error("Erro ao processar perfil", {
                  error: error instanceof Error ? error.message : 'Erro desconhecido',
                  component: 'AUTH_STATE_MANAGER'
                });
                onStateChange({ isLoading: false });
              }
            }, 0);
          } else if (event === 'SIGNED_OUT') {
            // Limpar cache
            profileCache.clear();
            
            onStateChange({
              session: null,
              user: null,
              profile: null,
              isAdmin: false,
              isFormacao: false,
              isLoading: false
            });
          } else if (event === 'USER_UPDATED') {
            onStateChange({ session, user: session?.user || null });
          }
        }
      );

      // Verificar sessão atual com timeout reduzido
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 1000)
        );
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: Session | null }, error: any };
        
        if (error) {
          logger.error("Erro ao verificar sessão", {
            error: error.message,
            component: 'AUTH_STATE_MANAGER'
          });
          onStateChange({ isLoading: false, authError: error });
          return;
        }

        onStateChange({ session, user: session?.user || null });

        // Processar perfil se houver sessão ativa
        if (session?.user) {
          try {
            const profile = await getCachedProfile(
              session.user.id,
              session.user.email,
              session.user.user_metadata?.name
            );

            onStateChange({
              profile,
              isAdmin: profile?.role === 'admin',
              isFormacao: profile?.role === 'formacao',
              isLoading: false
            });
          } catch (error) {
            logger.error("Erro ao processar perfil na inicialização", {
              error: error instanceof Error ? error.message : 'Erro desconhecido',
              component: 'AUTH_STATE_MANAGER'
            });
            onStateChange({ isLoading: false });
          }
        } else {
          onStateChange({ isLoading: false });
        }
      } catch (error) {
        logger.error("Erro crítico ao verificar sessão", {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          component: 'AUTH_STATE_MANAGER'
        });
        onStateChange({ 
          isLoading: false, 
          authError: error instanceof Error ? error : new Error('Erro desconhecido') 
        });
      }

      // Limpeza ao desmontar
      return () => {
        subscription.unsubscribe();
        isInitializing.current = false;
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
