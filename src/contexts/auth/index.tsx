
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { fetchUserProfile, createUserProfileIfNeeded } from './utils/profileUtils';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<{ success: boolean; error?: Error }>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  signOut: async () => ({ success: false }),
  setSession: () => {},
  setUser: () => {},
  setProfile: () => {},
  setIsLoading: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificação de admin baseada no perfil e fallback por email
  const checkIsAdmin = (userProfile: UserProfile | null, userEmail?: string) => {
    // Verificar primeiro pelo perfil
    if (userProfile?.role === 'admin') {
      setIsAdmin(true);
      return true;
    }
    
    // Fallback para emails específicos (desenvolvimento/emergência)
    const adminEmails = ['rafael@viverdeia.ai', 'admin@teste.com', 'admin@viverdeia.ai'];
    if (userEmail && adminEmails.includes(userEmail.toLowerCase())) {
      setIsAdmin(true);
      return true;
    }
    
    setIsAdmin(false);
    return false;
  };

  useEffect(() => {
    const fetchCurrentSession = async () => {
      try {
        console.log('[Auth] Buscando sessão atual...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log('[Auth] Usuário encontrado, buscando perfil...');
          
          // Buscar perfil existente
          let userProfile = await fetchUserProfile(currentSession.user.id);
          
          // Se não existe, criar
          if (!userProfile) {
            console.log('[Auth] Perfil não encontrado, criando...');
            userProfile = await createUserProfileIfNeeded(
              currentSession.user.id,
              currentSession.user.email || '',
              currentSession.user.user_metadata?.name || 'Usuário'
            );
          }
          
          setProfile(userProfile);
          checkIsAdmin(userProfile, currentSession.user.email);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('[Auth] Erro ao buscar sessão:', error);
        setIsLoading(false);
      }
    };

    fetchCurrentSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[Auth] Evento de autenticação:', event);
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setIsAdmin(false);
      } else if (newSession?.user) {
        // Buscar ou criar perfil para o usuário
        let userProfile = await fetchUserProfile(newSession.user.id);
        
        if (!userProfile) {
          userProfile = await createUserProfileIfNeeded(
            newSession.user.id,
            newSession.user.email || '',
            newSession.user.user_metadata?.name || 'Usuário'
          );
        }
        
        setProfile(userProfile);
        checkIsAdmin(userProfile, newSession.user.email);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async (): Promise<{ success: boolean; error?: Error }> => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setIsAdmin(false);
      toast.success('Você saiu com sucesso');
      return { success: true };
    } catch (error) {
      console.error('[Auth] Erro ao sair:', error);
      toast.error('Ocorreu um erro ao tentar sair');
      return { success: false, error: error as Error };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-80">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      isLoading, 
      isAdmin, 
      signOut,
      setSession,
      setUser,
      setProfile,
      setIsLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const useIsAdmin = () => {
  const { isAdmin } = useAuth();
  return isAdmin;
};
