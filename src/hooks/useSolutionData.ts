
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
        console.log(`Buscando solução com ID`, { id });
        
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
          console.log("Dados da solução encontrados:", { solution: data });
          setSolution(data as Solution);
          
          // Fetch progress for this solution and user if user is authenticated
          if (user) {
            try {
              const { data: progressData, error: progressError } = await supabase
                .from("progress")
                .select("*")
                .eq("solution_id", id)
                .eq("user_id", user.id)
                .maybeSingle(); // Usando maybeSingle em vez de single para evitar erros
                
              if (progressError) {
                console.error("Erro ao buscar progresso:", progressError);
              } else if (progressData) {
                setProgress(progressData);
                console.log("Dados de progresso encontrados:", { progress: progressData });
              } else {
                console.log("Nenhum progresso encontrado para esta solução", { solutionId: id, userId: user.id });
              }
            } catch (progressFetchError) {
              console.error("Erro ao buscar progresso:", progressFetchError);
            }
          }
        } else {
          console.log("Nenhuma solução encontrada com ID", { id });
          setError("Solução não encontrada");
          // Não redirecionamos automaticamente para dar chance ao usuário de ver a mensagem
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
  }, [id, toast, user, navigate, isAdmin, profile?.role]);

  return {
    solution,
    setSolution,
    loading,
    error,
    progress
  };
};
