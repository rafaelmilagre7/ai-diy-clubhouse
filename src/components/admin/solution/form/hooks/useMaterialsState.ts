
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Resource } from "../types/ResourceTypes";
import { parseResourceMetadata } from "../utils/resourceMetadataUtils";

export const useMaterialsState = (solutionId: string | null) => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    if (!solutionId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId);
        
      if (error) throw error;
      
      if (data) {
        const processedMaterials = data.map(item => parseResourceMetadata(item));
        setMaterials(processedMaterials);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast({
        title: "Erro ao carregar materiais",
        description: "Não foi possível carregar a lista de materiais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (solutionId) {
      fetchMaterials();
    } else {
      setLoading(false);
    }
  }, [solutionId]);

  return {
    materials,
    setMaterials,
    loading,
  };
};
