
import { useState, useEffect } from "react";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

export const useSolutionData = (id: string | undefined) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const fetchSolution = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log(`[SOLUTION_DATA] Buscando solução com ID`, { id, userId: user?.id });
        
        let query = supabase
          .from("solutions")
          .select("*")
          .eq("id", id as any);
          
        // Se não for um admin, só mostra soluções publicadas
        if (!isAdmin) {
          query = query.eq("published", true as any);
        }
        
        const { data, error: fetchError } = await query.maybeSingle();
        
        if (fetchError) {
          console.error("[SOLUTION_DATA] Erro ao buscar solução:", fetchError);
          
          // Se o erro for de registro não encontrado e o usuário não é admin,
          // provavelmente está tentando acessar uma solução não publicada
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
          console.log("[SOLUTION_DATA] Dados da solução encontrados:", { solution: data });
          setSolution(data as Solution);
          
          // Fetch progress for this solution and user if user is authenticated
          if (user) {
            try {
              console.log("[SOLUTION_DATA] Buscando progresso para usuário:", { solutionId: id, userId: user.id });
              
              const { data: progressData, error: progressError } = await supabase
                .from("progress")
                .select("solution_id, is_completed, current_module, completed_modules, created_at, last_activity")
                .eq("solution_id", id as any)
                .eq("user_id", user.id as any)
                .maybeSingle();
                
              if (progressError) {
                console.error("[SOLUTION_DATA] Erro ao buscar progresso:", progressError);
                // Não vamos fazer throw aqui pois não ter progresso não é um erro crítico
              } else if (progressData) {
                console.log("[SOLUTION_DATA] Dados de progresso encontrados:", { 
                  progress: progressData,
                  isCompleted: (progressData as any).is_completed,
                  currentModule: (progressData as any).current_module
                });
                setProgress(progressData);
              } else {
                console.log("[SOLUTION_DATA] Nenhum progresso encontrado para esta solução - CORRETO", { 
                  solutionId: id, 
                  userId: user.id 
                });
                setProgress(null);
              }
            } catch (progressFetchError) {
              console.error("[SOLUTION_DATA] Erro ao buscar progresso:", progressFetchError);
              setProgress(null);
            }
          } else {
            console.log("[SOLUTION_DATA] Usuário não autenticado, não buscando progresso");
            setProgress(null);
          }
        } else {
          console.log("[SOLUTION_DATA] Nenhuma solução encontrada com ID", { id });
          setError("Solução não encontrada");
          toast({
            title: "Solução não encontrada",
            description: "Não foi possível encontrar a solução solicitada.",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error("[SOLUTION_DATA] Erro em useSolutionData:", error);
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
  }, [id, toast, user, navigate, isAdmin, profile?.role]);

  return {
    solution,
    setSolution,
    loading,
    error,
    progress
  };
};
