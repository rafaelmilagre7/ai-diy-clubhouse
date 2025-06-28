
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useNavigate } from "react-router-dom";

// Simplified types to avoid deep instantiation
interface SimplifiedSolution {
  id: string;
  title: string;
  description: string;
  category: string;
  published?: boolean;
  difficulty_level?: string;
  estimated_time_hours?: number;
}

export const useSolutionData = (id: string | undefined) => {
  const { user, isAdmin } = useSimpleAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [solution, setSolution] = useState<SimplifiedSolution | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
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
        
        const { data, error: fetchError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();
        
        if (fetchError) {
          throw fetchError;
        }
        
        if (data) {
          setSolution(data as SimplifiedSolution);
          
          if (user) {
            const { data: progressData } = await supabase
              .from("progress")
              .select("*")
              .eq("solution_id", id)
              .eq("user_id", user.id)
              .single();
              
            setProgress(progressData);
          }
        } else {
          setError("Solução não encontrada");
        }
      } catch (error: any) {
        console.error("Erro em useSolutionData:", error);
        setError(error.message || "Erro ao buscar a solução");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolution();
  }, [id, user, navigate, isAdmin]);

  return {
    solution,
    setSolution,
    loading,
    error,
    progress
  };
};
