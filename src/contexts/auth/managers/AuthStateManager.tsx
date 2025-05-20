
import { FC, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { processUserProfile } from '@/hooks/auth/utils/authSessionUtils';
import { toast } from 'sonner';
import { redirectToDomain } from '@/utils/authUtils';

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
    const setupAuthListener = () => {
      // Iniciar com carregando = true
      onStateChange({ isLoading: true });

      console.log("Configurando listener de autenticação");

      // Configurar listener para mudanças de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Evento de autenticação:", event);

          if (event === 'SIGNED_IN') {
            console.log("Usuário conectado, atualizando estado");

            onStateChange({ session, user: session?.user || null });

            // Garantir que a página seja atualizada no domínio correto
            const currentOrigin = window.location.origin;
            const targetDomain = 'https://app.viverdeia.ai';

            if (!currentOrigin.includes('localhost') && currentOrigin !== targetDomain) {
              toast.info("Redirecionando para o domínio principal...");
              redirectToDomain();
              return;
            }

            // Processar perfil do usuário em segundo plano
            if (session?.user) {
              setTimeout(async () => {
                try {
                  const profile = await processUserProfile(
                    session.user.id,
                    session.user.email,
                    session.user.user_metadata?.name
                  );

                  onStateChange({
                    profile,
                    isAdmin: profile?.role === 'admin',
                    isFormacao: profile?.role === 'formacao'
                  });
                } catch (error) {
                  console.error("Erro ao processar perfil:", error);
                }
              }, 0);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log("Usuário desconectado, limpando estado");
            onStateChange({
              session: null,
              user: null,
              profile: null,
              isAdmin: false,
              isFormacao: false
            });
          } else if (event === 'USER_UPDATED') {
            console.log("Dados do usuário atualizados");
            onStateChange({ session, user: session?.user || null });
          }
        }
      );

      // Verificar sessão atual
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        console.log("Verificando sessão atual:", session?.user?.id);

        onStateChange({ session, user: session?.user || null });

        // Processar perfil do usuário se houver sessão ativa
        if (session?.user) {
          try {
            const profile = await processUserProfile(
              session.user.id,
              session.user.email,
              session.user.user_metadata?.name
            );

            onStateChange({
              profile,
              isAdmin: profile?.role === 'admin',
              isFormacao: profile?.role === 'formacao'
            });
          } catch (error) {
            console.error("Erro ao processar perfil:", error);
          }
        }

        // Marcar carregamento como concluído
        onStateChange({ isLoading: false });
      }).catch(error => {
        console.error("Erro ao verificar sessão:", error);
        onStateChange({ isLoading: false, authError: error instanceof Error ? error : new Error('Erro desconhecido') });
      });

      // Limpeza ao desmontar
      return () => {
        console.log("Limpando listener de autenticação");
        subscription.unsubscribe();
      };
    };

    // Inicializar listener
    setupAuthListener();
  }, [onStateChange]);

  // Este componente não renderiza nada, apenas gerencia o estado
  return null;
};
