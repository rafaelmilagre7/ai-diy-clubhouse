
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { Profile } from "@/types/forumTypes";

interface UseUserReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

export const useUser = (): UseUserReturn => {
  const { user } = useSimpleAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  console.log('[USE-USER] Inicializando hook:', {
    hasUser: !!user,
    userId: user?.id?.substring(0, 8)
  });

  const fetchProfile = async () => {
    if (!user?.id) {
      console.log('[USE-USER] Sem usuário, não carregando perfil');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('[USE-USER] Carregando perfil...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id as any)
        .single();

      if (error) throw error;
      
      console.log('[USE-USER] Perfil carregado com sucesso');
      setProfile(data as any);
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
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
