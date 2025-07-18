
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Solution } from "@/lib/supabase";

export const useDashboardData = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch solutions - filtrar apenas publicadas se não for admin
        let query = supabase.from("solutions").select("*");
        if (!isAdmin) {
          query = query.eq("published", true);
        }
        
        const { data: solutionsData, error: solutionsError } = await query;
        
        if (solutionsError) {
          throw solutionsError;
        }
        
        setSolutions(solutionsData as Solution[] || []);
        
        // Fetch user progress from implementation_checkpoints (tabela que realmente existe)
        if (user?.id) {
          const { data: checkpoints, error: checkpointsError } = await supabase
            .from("implementation_checkpoints")
            .select("*")
            .eq("user_id", user.id);
          
          if (checkpointsError && !checkpointsError.message.includes('does not exist')) {
            console.warn("Erro ao buscar checkpoints:", checkpointsError);
          } else {
            setProgressData(checkpoints || []);
          }
        }
        
      } catch (error: any) {
        console.error("Erro no carregamento de dados do dashboard:", error);
        setError(error.message || "Erro inesperado ao carregar dados");
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados do dashboard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin, toast]);
  
  return { 
    solutions, 
    progressData,
    loading, 
    error 
  };
};
