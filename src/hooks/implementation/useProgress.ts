
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useImplementationProfile } from "@/hooks/useImplementationProfile";

export const useProgress = () => {
  const { user } = useAuth();
  const { profile } = useImplementationProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Vamos usar o perfil de implementação como fonte de progresso
        // Se o perfil existir e estiver completo, consideramos o onboarding completo
        if (profile) {
          setProgress({
            is_completed: profile.is_completed || false,
            user_id: profile.user_id || user.id,
            updated_at: new Date().toISOString() // Usando uma data atual em vez da referência ao profile
          });
        } else {
          setProgress({
            is_completed: false,
            user_id: user.id,
            updated_at: new Date().toISOString()
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao buscar progresso:", error);
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [user, profile]);

  return { progress, isLoading };
};
