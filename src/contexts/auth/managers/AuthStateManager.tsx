
import React, { useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '../AuthProvider';
import { UserProfile } from '@/lib/supabase/types';
import { fetchUserProfile } from '../utils/profileUtils/userProfileFunctions';

interface AuthStateManagerProps {
  children: ReactNode;
}

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

export const AuthStateManager: React.FC<AuthStateManagerProps> = ({ children }) => {
  // Aqui nós usamos o hook useAuth para acessar e modificar o estado de autenticação
  const { 
    setUser, 
    setSession, 
    setProfile, 
    setIsLoading, 
    setIsAdmin 
  } = useAuth();

  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  const [internalLoading, setInternalLoading] = useState(true);

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
        setIsAdmin(isAdminByRole);
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
          
          // Carregar perfil do usuário
          try {
            const { data: userProfile } = await fetchUserProfile(currentSession.user.id);
            if (userProfile) {
              setProfile(userProfile as UserProfile);
            }
          } catch (profileError) {
            console.error("Erro ao carregar perfil:", profileError);
          }
        } else {
          setIsAdmin(false);
          setAdminCheckComplete(true);
          setProfile(null);
        }
        
        setIsLoading(false);
        setInternalLoading(false);
      } catch (error) {
        console.error('Erro ao buscar sessão:', error);
        setIsLoading(false);
        setInternalLoading(false);
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
        setAdminCheckComplete(true);
        setProfile(null);
      } else if (newSession?.user?.email && newSession?.user?.id) {
        await checkIsAdmin(newSession.user.email, newSession.user.id);
        
        // Carregar perfil do usuário após login
        try {
          const { data: userProfile } = await fetchUserProfile(newSession.user.id);
          if (userProfile) {
            setProfile(userProfile as UserProfile);
          }
        } catch (profileError) {
          console.error("Erro ao carregar perfil:", profileError);
        }
      } else {
        setIsAdmin(false);
        setAdminCheckComplete(true);
        setProfile(null);
      }
    });

    // Limpar subscription ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setProfile, setIsLoading, setIsAdmin]);

  // Mostra loading apenas se estamos verificando o admin pela primeira vez
  if (internalLoading && !adminCheckComplete) {
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

  return <>{children}</>;
};
