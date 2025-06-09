
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Profile } from "@/types/forumTypes";
import { logger } from "@/utils/logger";

interface UseUserReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

export const useUser = (): UseUserReturn => {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchProfile = async () => {
    if (!user?.id) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      logger.info("Carregando perfil via useUser", {
        component: 'USE_USER',
        userId: user.id.substring(0, 8) + '***'
      });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        logger.info("Perfil carregado via useUser", {
          component: 'USE_USER',
          profileRole: data.role
        });
      } else {
        // Usar profile do AuthContext se disponível
        if (authProfile) {
          setProfile(authProfile);
          logger.info("Usando perfil do AuthContext", {
            component: 'USE_USER',
            profileRole: authProfile.role
          });
        } else {
          setProfile(null);
        }
      }
    } catch (err) {
      logger.error("Erro ao carregar perfil via useUser", {
        component: 'USE_USER',
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      });
      setError(err);
      
      // Fallback para authProfile
      if (authProfile) {
        setProfile(authProfile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id, authProfile]);

  const refetch = async () => {
    await fetchProfile();
  };

  return { profile, isLoading, error, refetch };
};
