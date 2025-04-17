
import { useState, useEffect } from "react";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useSolutionData = (id: string | undefined) => {
  const { toast } = useToast();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolution = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log(`Fetching solution with ID: ${id}`);
        
        const { data, error: fetchError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();
        
        if (fetchError) {
          console.error("Error fetching solution:", fetchError);
          throw fetchError;
        }
        
        if (data) {
          console.log("Solution data retrieved:", data);
          setSolution(data as Solution);
        } else {
          console.log("No solution found with ID:", id);
          setError("Solução não encontrada");
          toast({
            title: "Solução não encontrada",
            description: "Não foi possível encontrar a solução solicitada.",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error("Error in useSolutionData:", error);
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
  }, [id, toast]);

  return {
    solution,
    setSolution,
    loading,
    error
  };
};
