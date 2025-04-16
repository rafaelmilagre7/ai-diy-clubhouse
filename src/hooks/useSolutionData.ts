
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

export const useSolutionData = (id: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(id ? true : false);
  
  useEffect(() => {
    const fetchSolution = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setSolution(data as Solution);
        
        // Fetch user progress for this solution
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("solution_id", id)
            .single();
          
          if (!progressError) {
            setProgress(progressData);
          }
        }
      } catch (error) {
        console.error("Error fetching solution:", error);
        toast({
          title: "Erro ao carregar solução",
          description: "Ocorreu um erro ao tentar carregar os detalhes da solução.",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolution();
  }, [id, toast, navigate, user]);

  return {
    solution,
    setSolution,
    progress,
    loading
  };
};
