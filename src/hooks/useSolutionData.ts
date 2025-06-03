
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution, Progress } from "@/lib/supabase";

export const useSolutionData = (id: string | undefined) => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSolutionData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch solution data
        const { data: solutionData, error: solutionError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (solutionError) {
          console.error("Erro ao carregar solução:", solutionError);
          setError("Não foi possível carregar a solução.");
          toast({
            title: "Erro ao carregar",
            description: "Não foi possível carregar a solução.",
            variant: "destructive"
          });
          navigate("/solutions");
          return;
        }

        if (solutionData) {
          setSolution(solutionData as Solution);
          console.log("Solução carregada:", solutionData);
        } else {
          console.log("Solução não encontrada");
          setError("Solução não encontrada.");
          toast({
            title: "Solução não encontrada",
            description: "A solução solicitada não existe.",
            variant: "destructive"
          });
          navigate("/solutions");
          return;
        }

        // Fetch progress data if user is authenticated
        if (user && solutionData) {
          try {
            const { data: progressData, error: progressError } = await supabase
              .from("progress")
              .select("*")
              .eq("user_id", user.id)
              .eq("solution_id", id)
              .maybeSingle();

            if (progressError) {
              console.error("Erro ao carregar progresso:", progressError);
              // Don't show error for progress, just continue without it
            } else if (progressData) {
              setProgress(progressData as Progress);
              console.log("Progresso carregado:", progressData);
            }
          } catch (progressError) {
            console.error("Erro ao buscar progresso:", progressError);
            // Continue without progress data
          }
        }
      } catch (error: any) {
        console.error("Erro ao buscar dados da solução:", error);
        setError("Ocorreu um erro inesperado ao carregar a solução.");
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao carregar a solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSolutionData();
  }, [id, user, navigate, toast]);

  return {
    solution,
    setSolution,
    progress,
    loading,
    error
  };
};
