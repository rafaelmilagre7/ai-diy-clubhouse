
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean; // Adicionando verificação explícita de admin
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false, // Valor inicial
  signOut: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Estado para rastrear se o usuário é admin

  // Verificar se um usuário é admin com base no email
  const checkIsAdmin = (email?: string | null) => {
    if (!email) return false;
    
    return email.includes('@viverdeia.ai') || 
           email === 'admin@teste.com' || 
           email === 'admin@viverdeia.ai';
  };

  useEffect(() => {
    // Buscar sessão atual ao montar o componente
    const fetchCurrentSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Verificar se é admin
        if (currentSession?.user?.email) {
          setIsAdmin(checkIsAdmin(currentSession.user.email));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao buscar sessão:', error);
        setIsLoading(false);
      }
    };

    fetchCurrentSession();

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Evento de autenticação:', event);
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Verificar se é admin quando o usuário mudar
      if (newSession?.user?.email) {
        setIsAdmin(checkIsAdmin(newSession.user.email));
      } else {
        setIsAdmin(false);
      }
    });

    // Limpar subscription ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Você saiu com sucesso');
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast.error('Ocorreu um erro ao tentar sair');
    }
  };

  // Se estiver carregando, mostrar um componente de loading
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
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Adicionar uma função para verificações explícitas de admin
export const useIsAdmin = () => {
  const { isAdmin } = useAuth();
  return isAdmin;
};
