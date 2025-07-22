
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

export const useSolutionData = (id: string | undefined) => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<string | null>(null);
  
  const isAdmin = useMemo(() => profile?.user_roles?.name === 'admin', [profile?.user_roles?.name]);

  useEffect(() => {
    if (!id || authLoading || fetchedRef.current === id) {
      if (!id) setLoading(false);
      return;
    }

    const fetchSolution = async () => {
      try {
        setLoading(true);
        fetchedRef.current = id;
        
        let query = supabase
          .from("solutions")
          .select("*")
          .eq("id", id);
          
        // Se não for um admin, só mostra soluções publicadas
        if (!isAdmin) {
          query = query.eq("published", true);
        }
        
        const { data, error: fetchError } = await query.maybeSingle();
        
        if (fetchError) {
          console.error("Erro ao buscar solução:", fetchError);
          
          if (fetchError.code === "PGRST116" && !isAdmin) {
            toast({
              title: "Solução não disponível",
              description: "Esta solução não está disponível no momento.",
              variant: "destructive"
            });
            navigate("/solutions");
            return;
          }
          
          throw fetchError;
        }
        
        if (data) {
          setSolution(data as Solution);
          
          // Fetch progress if user is authenticated
          if (user) {
            try {
              const { data: progressData, error: progressError } = await supabase
                .from("progress")
                .select("*")
                .eq("solution_id", id)
                .eq("user_id", user.id)
                .maybeSingle();
                
              if (!progressError && progressData) {
                setProgress(progressData);
              }
            } catch (progressFetchError) {
              console.error("Erro ao buscar progresso:", progressFetchError);
            }
          }
        } else {
          setError("Solução não encontrada");
          toast({
            title: "Solução não encontrada",
            description: "Não foi possível encontrar a solução solicitada.",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error("Erro em useSolutionData:", error);
        setError(error.message || "Erro ao buscar a solução");
        toast({
          title: "Erro ao carregar solução",
          description: error.message || "Não foi possível carregar os dados da solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [id, isAdmin, authLoading, user?.id]); // Removidas dependências problemáticas

  return {
    solution,
    setSolution,
    loading,
    error,
    progress
  };
};
