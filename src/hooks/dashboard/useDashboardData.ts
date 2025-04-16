
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Solution } from "@/lib/supabase";
import { fallbackSolutionsData } from "./dashboardUtils";

export const useDashboardData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all published solutions
        const { data: solutionsData, error: solutionsError } = await supabase
          .from("solutions")
          .select("*")
          .eq("published", true);
        
        if (solutionsError) {
          console.error("Error fetching solutions:", solutionsError);
          toast({
            title: "Erro ao carregar soluções",
            description: "Não foi possível carregar a lista de soluções disponíveis.",
            variant: "destructive",
          });
          
          // Use fallback data
          setSolutions(fallbackSolutionsData);
          setProgressData([]);
          setLoading(false);
          return;
        }
        
        // Ensure solutions array is type-safe
        setSolutions(solutionsData as Solution[]);
        
        // Fetch user progress
        const { data: progress, error: progressError } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id);
        
        if (progressError) {
          console.error("Error fetching user progress:", progressError);
          toast({
            title: "Erro ao carregar progresso",
            description: "Não foi possível carregar seu progresso nas soluções.",
            variant: "destructive",
          });
          setProgressData([]);
        } else {
          setProgressData(progress || []);
        }
      } catch (error: any) {
        console.error("Error in dashboard data fetching:", error);
        setError(error.message || "Erro inesperado ao carregar dados");
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao carregar os dados do dashboard.",
          variant: "destructive",
        });
        
        // Use fallback data
        setSolutions(fallbackSolutionsData);
        setProgressData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  return { 
    solutions, 
    progressData, 
    loading, 
    error 
  };
};
