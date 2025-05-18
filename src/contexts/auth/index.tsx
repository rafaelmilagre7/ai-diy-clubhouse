
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean; // Verificação centralizada e definitiva
  isFormacao: boolean; // Verificação para perfil de formação
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  isFormacao: false,
  signOut: async () => {}
});

// Função para persistir o status de admin em localStorage
const saveAdminStatus = (userId: string, isAdmin: boolean) => {
  try {
    const adminCache = JSON.parse(localStorage.getItem('adminCache') || '{}');
    adminCache[userId] = {
      status: isAdmin,
      timestamp: Date.now()
    };
    localStorage.setItem('adminCache', JSON.stringify(adminCache));
  } catch (error) {
    console.error('Erro ao salvar status de admin:', error);
  }
};

// Função para recuperar status de admin do localStorage
const getAdminStatus = (userId: string) => {
  try {
    const adminCache = JSON.parse(localStorage.getItem('adminCache') || '{}');
    const cachedData = adminCache[userId];
    
    // Verificar se o cache é válido (menos de 24 horas)
    if (cachedData && Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) {
      return cachedData.status;
    }
  } catch (error) {
    console.error('Erro ao recuperar status de admin:', error);
  }
  
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormacao, setIsFormacao] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  // Verificação definitiva se o usuário é admin
  const checkIsAdmin = async (email?: string | null, userId?: string) => {
    // Se não temos email ou userId, não pode ser admin
    if (!email || !userId) {
      setIsAdmin(false);
      return false;
    }

    // Verificação rápida por email (alta prioridade)
    const isAdminByEmail = email.includes('@viverdeia.ai') || 
                         email === 'admin@teste.com' || 
                         email === 'admin@viverdeia.ai';
    
    if (isAdminByEmail) {
      setIsAdmin(true);
      saveAdminStatus(userId, true);
      return true;
    }

    // Tentar verificar pelo cache local
    const cachedAdminStatus = getAdminStatus(userId);
    if (cachedAdminStatus !== null) {
      setIsAdmin(cachedAdminStatus);
      return cachedAdminStatus;
    }

    try {
      // Verificação com a função RPC otimizada
      const { data, error } = await supabase.rpc('is_user_admin', {
        user_id: userId
      });
      
      if (error) throw error;
      
      const adminStatus = !!data;
      setIsAdmin(adminStatus);
      saveAdminStatus(userId, adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('Erro ao verificar status de admin:', error);
      
      // Verificação de fallback pelo papel no perfil
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
          
        const isAdminByRole = profileData?.role === 'admin';
        const isFormacaoRole = profileData?.role === 'formacao';
        
        setIsAdmin(isAdminByRole);
        setIsFormacao(isFormacaoRole);
        
        saveAdminStatus(userId, isAdminByRole);
        return isAdminByRole;
      } catch (profileError) {
        console.error('Erro ao verificar perfil:', profileError);
        setIsAdmin(isAdminByEmail); // Usar resultado da verificação por email como fallback final
        return isAdminByEmail;
      }
    } finally {
      setAdminCheckComplete(true);
    }
  };

  useEffect(() => {
    // Buscar sessão atual ao montar o componente
    const fetchCurrentSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Verificar se é admin (apenas se temos um usuário)
        if (currentSession?.user?.email && currentSession?.user?.id) {
          await checkIsAdmin(currentSession.user.email, currentSession.user.id);
        } else {
          setIsAdmin(false);
          setIsFormacao(false);
          setAdminCheckComplete(true);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao buscar sessão:', error);
        setIsLoading(false);
        setAdminCheckComplete(true);
      }
    };

    fetchCurrentSession();

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Evento de autenticação:', event);
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Reset admin status enquanto verificamos
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setIsFormacao(false);
        setAdminCheckComplete(true);
      } else if (newSession?.user?.email && newSession?.user?.id) {
        await checkIsAdmin(newSession.user.email, newSession.user.id);
      } else {
        setIsAdmin(false);
        setIsFormacao(false);
        setAdminCheckComplete(true);
      }
    });

    // Limpar subscription ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Limpar caches
      localStorage.removeItem('permissionsCache');
      
      await supabase.auth.signOut();
      setIsAdmin(false);
      setIsFormacao(false);
      toast.success('Você saiu com sucesso');
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast.error('Ocorreu um erro ao tentar sair');
    }
  };

  // Mostra loading apenas se estamos verificando o admin pela primeira vez
  if (isLoading && !adminCheckComplete) {
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
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, isFormacao, signOut }}>
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
