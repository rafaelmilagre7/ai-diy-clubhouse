
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { UserProfile } from '@/lib/supabase/types';
import { isUserAdmin } from '@/utils/auth/adminUtils';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isFormacao: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  isFormacao: false,
  setProfile: () => {},
  setIsAdmin: () => {},
  setIsLoading: () => {},
  signOut: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormacao, setIsFormacao] = useState(false);

  // Inicializar estado de autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Buscar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          const user = session.user;
          setUser(user);
          
          // Verificar status de admin com base no email para resposta rápida
          const quickAdminCheck = isUserAdmin(user, null);
          console.log("Verificação rápida de admin:", quickAdminCheck);
          setIsAdmin(quickAdminCheck);
          
          // Verificar status de formação (este é um exemplo, ajuste conforme necessário)
          setIsFormacao(user.email?.includes('@formacao.') || false);
          
          // Log do evento de autenticação
          console.info("Evento de autenticação: SIGNED_IN");
          console.info("Usuário autenticado:", {
            id: user.id,
            email: user.email,
            event: "SIGNED_IN"
          });
          
          // Buscar perfil do usuário após evento de autenticação
          console.info("Buscando perfil após evento de autenticação:", user.id);
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
            
          if (error) {
            console.warn("Erro ao buscar perfil:", error.message);
          } else if (profileData) {
            console.info("Perfil encontrado após evento:", profileData);
            setProfile(profileData);
            
            // Verificar admin com perfil
            const adminStatus = isUserAdmin(user, profileData);
            console.info("Verificando status admin:", {
              adminStatus,
              userEmail: user.email,
              profileRole: profileData.role,
              previousAdminStatus: isAdmin
            });
            
            setIsAdmin(adminStatus);
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Inscrever-se para eventos de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        // Verificar status de admin para resposta rápida
        const quickAdminCheck = isUserAdmin(session.user, null);
        setIsAdmin(quickAdminCheck);
        
        // Log do evento
        console.info("Evento de autenticação: SIGNED_IN");
        console.info("Usuário autenticado:", {
          id: session.user.id,
          email: session.user.email,
          event: "SIGNED_IN"
        });
        
        // Buscar perfil do usuário
        console.info("Buscando perfil para usuário:", session.user.id);
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (error) {
          console.warn("Erro ao buscar perfil:", error.message);
        } else if (profileData) {
          console.info("Perfil encontrado pelo id:", profileData);
          setProfile(profileData);
          
          // Verificar admin com perfil
          const adminStatus = isUserAdmin(session.user, profileData);
          setIsAdmin(adminStatus);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsFormacao(false);
        
        console.info("Evento de autenticação: SIGNED_OUT");
      }
    });
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função de logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Limpar estado após logout
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsAdmin(false);
      setIsFormacao(false);
      
      console.log("Logout realizado com sucesso");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao encerrar sessão");
    }
  };

  // Valor do contexto
  const contextValue = {
    user,
    profile,
    session,
    isLoading,
    isAdmin,
    isFormacao,
    setProfile,
    setIsAdmin,
    setIsLoading,
    signOut
  };

  // Renderização condicional durante carregamento
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md p-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  
  return context;
};
