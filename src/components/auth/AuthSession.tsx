
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { processUserProfile } from '@/hooks/auth/utils/authSessionUtils';
import LoadingScreen from '@/components/common/LoadingScreen';
import { toast } from 'sonner';
import { isUserAdmin } from '@/utils/auth/adminUtils';

const AuthSession = () => {
  const { 
    user, 
    isLoading, 
    setProfile, 
    setIsLoading,
    profile,
    setIsAdmin
  } = useAuth();

  // Logs para diagnóstico
  console.log("AuthSession: Inicializando", { 
    userExists: !!user, 
    profileExists: !!profile, 
    isLoading 
  });

  // Carrega o perfil do usuário quando o usuário é autenticado
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        console.log("AuthSession: Sem usuário autenticado");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("AuthSession: Carregando perfil para usuário:", user.id);
        
        // Verificação rápida de admin baseada no email
        const quickAdminCheck = isUserAdmin(user, profile);
        console.log("AuthSession - Verificação rápida de admin:", quickAdminCheck);
        setIsAdmin(quickAdminCheck);
        
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
          
          // Verificação final de admin com perfil completo
          const finalAdminCheck = isUserAdmin(user, userProfile);
          console.log("AuthSession - Verificação final de admin:", finalAdminCheck);
          setIsAdmin(finalAdminCheck);
        } else {
          console.warn("AuthSession: Perfil não encontrado, tentando criar");
          
          // Verificar se o usuário é admin com base no email
          const isAdmin = user.email?.includes('@viverdeia.ai') || 
                        user.email === 'admin@teste.com' || 
                        user.email === 'admin@viverdeia.ai';
          
          const userName = user.user_metadata?.name || 
                          user.user_metadata?.full_name || 
                          user.email?.split('@')[0] || 
                          'Usuário';
          
          // Tentar criar um perfil
          const { data: newProfile, error } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              name: userName,
              email: user.email,
              role: isAdmin ? 'admin' : 'member',
              avatar_url: user.user_metadata?.avatar_url || null
            })
            .select()
            .single();
            
          if (error) {
            console.error("AuthSession: Erro ao criar perfil:", error);
            toast.error("Não foi possível carregar seu perfil");
          } else if (newProfile) {
            console.log("AuthSession: Novo perfil criado:", newProfile);
            setProfile(newProfile);
            
            // Verificação final de admin com novo perfil
            const finalAdminCheck = isUserAdmin(user, newProfile);
            console.log("AuthSession - Verificação final com novo perfil:", finalAdminCheck);
            setIsAdmin(finalAdminCheck);
          }
        }
      } catch (error) {
        console.error("AuthSession: Erro ao carregar perfil:", error);
        toast.error("Erro ao carregar seu perfil");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Executar apenas quando o componente montar
    loadUserProfile();
  }, [user, setProfile, setIsLoading, profile, setIsAdmin]);
  
  // Mostrar um indicador visual apenas quando estiver carregando
  if (isLoading) {
    return <LoadingScreen message="Carregando seu perfil..." />;
  }
  
  // Não renderizar nada quando o perfil estiver carregado
  return null;
};

export default AuthSession;
