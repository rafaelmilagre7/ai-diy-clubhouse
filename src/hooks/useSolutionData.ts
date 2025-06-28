
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useNavigate } from "react-router-dom";
import { SimplifiedSolution } from "@/lib/supabase/types";

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
          // Transform database data to match SimplifiedSolution interface
          const transformedSolution: SimplifiedSolution = {
            id: data.id,
            title: data.title,
            description: data.description,
            category: data.category,
            difficulty: data.difficulty_level || 'medium',
            difficulty_level: data.difficulty_level,
            thumbnail_url: data.thumbnail_url,
            cover_image_url: data.thumbnail_url || '', 
            published: false, // Default value since field doesn't exist in DB
            slug: data.title?.toLowerCase().replace(/\s+/g, '-') || '', // Generate slug from title
            created_at: data.created_at,
            updated_at: data.updated_at,
            tags: data.tags || [],
            estimated_time_hours: data.estimated_time_hours,
            roi_potential: data.roi_potential,
            implementation_steps: data.implementation_steps,
            required_tools: data.required_tools,
            expected_results: data.description || '', // Use description as fallback
            success_metrics: data.roi_potential || '', // Use roi_potential as fallback
            target_audience: data.description || '', // Use description as fallback
            prerequisites: data.description || '' // Use description as fallback
          };
          
          setSolution(transformedSolution);
          
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
