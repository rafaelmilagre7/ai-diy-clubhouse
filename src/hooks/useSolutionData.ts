
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase, Solution } from "@/lib/supabase";

export const useSolutionData = (id: string | undefined) => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSolution = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao carregar solução:", error);
          toast({
            title: "Erro ao carregar",
            description: "Não foi possível carregar a solução.",
            variant: "destructive"
          });
          navigate("/admin/solutions");
          return;
        }

        if (data) {
          setSolution(data as Solution);
          console.log("Solução carregada:", data);
        } else {
          console.log("Solução não encontrada");
          toast({
            title: "Solução não encontrada",
            description: "A solução solicitada não existe.",
            variant: "destructive"
          });
          navigate("/admin/solutions");
        }
      } catch (error: any) {
        console.error("Erro ao buscar solução:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao carregar a solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [id, navigate, toast]);

  return {
    solution,
    setSolution,
    loading
  };
};
