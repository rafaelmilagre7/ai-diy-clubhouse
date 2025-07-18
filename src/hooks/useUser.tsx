
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Profile } from "@/types/forumTypes";

interface UseUserReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

export const useUser = (): UseUserReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchProfile = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Usar a função get_cached_profile corrigida
      const { data, error } = await supabase
        .rpc('get_cached_profile', { target_user_id: user.id });

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        console.log('🔍 [PROFILE] Perfil carregado:', {
          name: data.name,
          role: data.user_roles?.name,
          hasUserRoles: !!data.user_roles
        });
      } else {
        console.warn('⚠️ [PROFILE] Nenhum perfil encontrado para o usuário');
        setProfile(null);
      }
    } catch (err) {
      console.error("❌ [PROFILE] Erro ao carregar perfil:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const refetch = async () => {
    await fetchProfile();
  };

  return { profile, isLoading, error, refetch };
};
