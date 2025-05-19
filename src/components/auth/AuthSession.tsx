
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { processUserProfile } from '@/hooks/auth/utils/authSessionUtils';
import LoadingScreen from '@/components/common/LoadingScreen';
import { toast } from 'sonner';

const AuthSession = () => {
  const { 
    user, 
    isLoading, 
    setProfile, 
    setIsLoading,
    profile
  } = useAuth();

  // Carrega o perfil do usuário quando o usuário é autenticado
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        console.log("AuthSession: Carregando perfil para usuário:", user.id);
        
        // Verificar se já temos um perfil
        if (profile) {
          console.log("AuthSession: Perfil já carregado:", profile);
          setIsLoading(false);
          return;
        }
        
        // Tentar carregar o perfil
        const userProfile = await processUserProfile(user);
        
        if (userProfile) {
          console.log("AuthSession: Perfil carregado:", userProfile);
          setProfile(userProfile);
        } else {
          console.warn("AuthSession: Perfil não encontrado, tentando criar");
          
          // Verificar se o usuário é admin com base no email
          const isAdmin = user.email?.includes('@viverdeia.ai') || 
                        user.email === 'admin@teste.com' || 
                        user.email === 'admin@viverdeia.ai';
          
          // Tentar criar um perfil
          const { data: newProfile, error } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              name: user.user_metadata?.name || 
                    user.user_metadata?.full_name || 
                    user.email?.split('@')[0] || 
                    'Usuário',
              email: user.email,
              role: isAdmin ? 'admin' : 'member'
            })
            .select()
            .single();
            
          if (error) {
            console.error("AuthSession: Erro ao criar perfil:", error);
            toast.error("Não foi possível carregar seu perfil");
          } else if (newProfile) {
            console.log("AuthSession: Novo perfil criado:", newProfile);
            setProfile(newProfile);
          }
        }
      } catch (error) {
        console.error("AuthSession: Erro ao carregar perfil:", error);
        toast.error("Erro ao carregar seu perfil");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [user, setProfile, setIsLoading, profile]);
  
  if (isLoading) {
    return <LoadingScreen message="Carregando seu perfil..." />;
  }
  
  return null;
};

export default AuthSession;
