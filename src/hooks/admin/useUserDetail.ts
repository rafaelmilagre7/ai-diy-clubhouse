
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/lib/supabase";

interface UseUserDetailReturn {
  user: UserProfile | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

export const useUserDetail = (userId: string): UseUserDetailReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();

  const fetchUser = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            name,
            description
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError(new Error('Usuário não encontrado'));
        } else {
          throw error;
        }
        return;
      }

      setUser(data as UserProfile);
    } catch (err: any) {
      console.error("Erro ao carregar detalhes do usuário:", err);
      setError(err);
      toast({
        title: "Erro ao carregar usuário",
        description: err.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const refetch = async () => {
    await fetchUser();
  };

  return { user, loading, error, refetch };
};
