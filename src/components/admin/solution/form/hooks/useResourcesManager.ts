
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Resource } from "../types/ResourceTypes";
import { useResourceUpload } from "./useResourceUpload";
import { useResourceRemove } from "./useResourceRemove";
import { parseResourceMetadata } from "../utils/resourceMetadataUtils";

export function useResourcesManager(solutionId: string | null) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingResources, setSavingResources] = useState(false);
  const { toast } = useToast();

  // Use custom hooks for specific resource operations
  const { handleUploadComplete } = useResourceUpload(solutionId, setResources, toast);
  const { handleRemoveResource } = useResourceRemove(setResources, toast);

  useEffect(() => {
    if (solutionId) {
      fetchResources();
    } else {
      setLoading(false);
    }
  }, [solutionId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId)
        .is("module_id", null);
        
      if (error) throw error;
      
      if (data) {
        const typedResources = data.map(item => parseResourceMetadata(item));
        
        const sortedResources = typedResources.sort((a, b) => {
          const orderA = a.metadata.order || 0;
          const orderB = b.metadata.order || 0;
          return orderA - orderB;
        });
        
        setResources(sortedResources);
      }
    } catch (error) {
      console.error("Erro ao carregar recursos:", error);
      toast({
        title: "Erro ao carregar recursos",
        description: "Não foi possível carregar a lista de recursos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    resources,
    loading,
    savingResources,
    setSavingResources,
    handleUploadComplete,
    handleRemoveResource
  };
}
