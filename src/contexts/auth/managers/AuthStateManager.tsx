
import { FC, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase/types';
import { toast } from 'sonner';

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

// Função simplificada para buscar perfil
const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
};

export const AuthStateManager: FC<AuthStateManagerProps> = ({ onStateChange }) => {
  useEffect(() => {
    console.log("AuthStateManager: Iniciando configuração");
    
    // Iniciar com carregando = true
    onStateChange({ isLoading: true });

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthStateManager: Evento de autenticação", { event, userId: session?.user?.id });

        if (event === 'SIGNED_IN' && session?.user) {
          onStateChange({ session, user: session.user });

          // Buscar perfil em background
          try {
            const profile = await fetchUserProfile(session.user.id);
            onStateChange({
              profile,
              isAdmin: profile?.role === 'admin',
              isFormacao: profile?.role === 'formacao'
            });
          } catch (error) {
            console.error("Erro ao buscar perfil:", error);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("AuthStateManager: Usuário desconectado");
          onStateChange({
            session: null,
            user: null,
            profile: null,
            isAdmin: false,
            isFormacao: false
          });
        } else if (event === 'USER_UPDATED' && session) {
          onStateChange({ session, user: session.user });
        }
      }
    );

    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("AuthStateManager: Verificando sessão atual", { userId: session?.user?.id });

        onStateChange({ session, user: session?.user || null });

        if (session?.user) {
          try {
            const profile = await fetchUserProfile(session.user.id);
            onStateChange({
              profile,
              isAdmin: profile?.role === 'admin',
              isFormacao: profile?.role === 'formacao'
            });
          } catch (error) {
            console.error("Erro ao processar perfil:", error);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        onStateChange({ authError: error instanceof Error ? error : new Error('Erro desconhecido') });
      } finally {
        onStateChange({ isLoading: false });
      }
    };

    checkSession();

    // Cleanup
    return () => {
      console.log("AuthStateManager: Limpando listener");
      subscription.unsubscribe();
    };
  }, [onStateChange]);

  return null;
};
