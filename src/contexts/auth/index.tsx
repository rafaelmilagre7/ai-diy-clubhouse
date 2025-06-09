
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { verifyAdminStatus, clearPermissionCache, logSecurityEvent } from '@/contexts/auth/utils/securityUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  signOut: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  // Verificação centralizada de admin usando utilitário de segurança
  const checkIsAdmin = async (email?: string | null, userId?: string) => {
    if (!email || !userId) {
      setIsAdmin(false);
      return false;
    }

    try {
      const adminStatus = await verifyAdminStatus(userId, email);
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('Erro ao verificar status de admin:', error);
      setIsAdmin(false);
      return false;
    } finally {
      setAdminCheckComplete(true);
    }
  };

  useEffect(() => {
    const fetchCurrentSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user?.email && currentSession?.user?.id) {
          await checkIsAdmin(currentSession.user.email, currentSession.user.id);
        } else {
          setIsAdmin(false);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Evento de autenticação:', event);
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Log eventos de autenticação importantes
      if (event === 'SIGNED_IN' && newSession?.user) {
        await logSecurityEvent('sign_in', 'auth', newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        await logSecurityEvent('sign_out', 'auth');
      }
      
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setAdminCheckComplete(true);
        // Limpar caches de segurança
        clearPermissionCache();
      } else if (newSession?.user?.email && newSession?.user?.id) {
        await checkIsAdmin(newSession.user.email, newSession.user.id);
      } else {
        setIsAdmin(false);
        setAdminCheckComplete(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Limpar caches de segurança
      clearPermissionCache();
      localStorage.removeItem('permissionsCache');
      
      await supabase.auth.signOut();
      setIsAdmin(false);
      toast.success('Você saiu com sucesso');
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast.error('Ocorreu um erro ao tentar sair');
    }
  };

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
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const useIsAdmin = () => {
  const { isAdmin } = useAuth();
  return isAdmin;
};
