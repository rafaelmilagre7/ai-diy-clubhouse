
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
        console.log(`Fetching solution with ID: ${id}`);
        
        let query = supabase
          .from("solutions")
          .select("*")
          .eq("id", id);
          
        // Se não for um admin, só mostra soluções publicadas
        if (!isAdmin) {
          query = query.eq("published", true);
        }
        
        const { data, error: fetchError } = await query.single();
        
        if (fetchError) {
          console.error("Error fetching solution:", fetchError);
          
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
          console.log("Solution data retrieved:", data);
          setSolution(data as Solution);
          
          // Fetch progress for this solution and user if user is authenticated
          if (user) {
            const { data: progressData, error: progressError } = await supabase
              .from("progress")
              .select("*")
              .eq("solution_id", id)
              .eq("user_id", user.id)
              .single();
              
            if (!progressError && progressData) {
              setProgress(progressData);
            }
          }
        } else {
          console.log("No solution found with ID:", id);
          setError("Solução não encontrada");
          toast({
            title: "Solução não encontrada",
            description: "Não foi possível encontrar a solução solicitada.",
            variant: "destructive"
          });
          navigate("/solutions");
        }
      } catch (error: any) {
        console.error("Error in useSolutionData:", error);
        setError(error.message || "Erro ao buscar a solução");
        toast({
          title: "Erro ao carregar solução",
          description: error.message || "Não foi possível carregar os dados da solução.",
          variant: "destructive"
        });
        navigate("/solutions");
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
