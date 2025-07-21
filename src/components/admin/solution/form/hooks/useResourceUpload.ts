
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/lib/supabase";
import { Resource, ResourceMetadata } from "../types/ResourceTypes";
import { detectFileType, getFileFormatName } from "../utils/resourceUtils";

export function useResourceUpload(
  solutionId: string | null, 
  setResources: Dispatch<SetStateAction<Resource[]>>,
  toast: any
) {
  const handleUploadComplete = async (url: string, fileName: string, fileSize: number) => {
    if (!solutionId) return;
    
    try {
      const fileType = detectFileType(fileName);
      const format = getFileFormatName(fileName);
      
      const metadata: ResourceMetadata = {
        title: fileName,
        description: `Arquivo ${format}`,
        url: url,
        type: fileType,
        format: format,
        tags: [],
        order: 0,
        downloads: 0,
        size: fileSize,
        version: "1.0"
      };
      
      // Metadata as JSONB object for storage
      const newResource = {
        solution_id: solutionId,
        name: fileName,
        url: url,
        type: fileType,
        format: format,
        metadata: metadata,
        size: fileSize
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newResource)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const resource: Resource = {
          id: data.id,
          name: data.name,
          url: data.url,
          type: fileType,
          format: data.format,
          solution_id: data.solution_id,
          metadata: metadata,
          created_at: data.created_at,
          updated_at: data.updated_at,
          module_id: data.module_id,
          size: data.size
        };
        
        setResources(prev => [...prev, resource]);
      }
      
      toast({
        title: "Material adicionado",
        description: "O material foi adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao adicionar material:", error);
      toast({
        title: "Erro ao adicionar material",
        description: error.message || "Ocorreu um erro ao tentar adicionar o material.",
        variant: "destructive",
      });
    }
  };

  return { handleUploadComplete };
}
