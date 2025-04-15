
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/lib/supabase";
import { Resource, ResourceMetadata } from "../types/ResourceTypes";
import { getFileFormatName } from "../utils/resourceUtils";

export function useResourceCreate(
  solutionId: string | null, 
  setResources: Dispatch<SetStateAction<Resource[]>>,
  toast: any
) {
  const handleCreateResource = async (newResource: ResourceMetadata) => {
    if (!solutionId) return false;
    
    try {
      if (!newResource.title || !newResource.description || !newResource.url) {
        toast({
          title: "Campos obrigatórios",
          description: "Título, descrição e URL são campos obrigatórios.",
          variant: "destructive",
        });
        return false;
      }
      
      const resourceData = {
        solution_id: solutionId,
        name: newResource.title,
        url: newResource.url,
        type: newResource.type,
        format: newResource.format || getFileFormatName(newResource.url),
        metadata: newResource
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(resourceData)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const resource: Resource = {
          id: data.id,
          name: data.name,
          url: data.url,
          type: newResource.type,
          format: data.format,
          solution_id: data.solution_id,
          metadata: newResource,
          created_at: data.created_at,
          updated_at: data.updated_at,
          module_id: data.module_id,
          size: data.size
        };
        
        setResources(prev => [...prev, resource]);
      }
      
      toast({
        title: "Recurso adicionado",
        description: "O recurso foi adicionado com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao adicionar recurso:", error);
      toast({
        title: "Erro ao adicionar recurso",
        description: error.message || "Ocorreu um erro ao tentar adicionar o recurso.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { handleCreateResource };
}
