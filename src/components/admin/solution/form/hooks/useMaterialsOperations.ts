
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { SolutionResource } from "@/lib/supabase/types";
import { Resource, ResourceMetadata } from "../types/ResourceTypes";
import { detectFileType, getFileFormatName } from "../utils/resourceUtils";
import { parseResourceMetadata } from "../utils/resourceMetadataUtils";

export const useMaterialsOperations = (
  solutionId: string | null,
  setMaterials: React.Dispatch<React.SetStateAction<Resource[]>>
) => {
  const { toast } = useToast();
  const [savingResources, setSavingResources] = useState(false);

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
      
      // Converter ResourceMetadata para string JSON para armazenamento
      const newResource = {
        solution_id: solutionId,
        name: fileName,
        url: url,
        type: fileType,
        format: format,
        metadata: JSON.stringify(metadata), // Convertendo para string JSON
        size: fileSize
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newResource)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Converter o resultado do Supabase para o formato esperado pelo componente
        // Usando parseResourceMetadata para garantir que o metadata seja do tipo correto
        const resource = parseResourceMetadata(data);
        
        setMaterials(prev => [...prev, resource]);
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

  const handleRemoveResource = async (id?: string, url?: string) => {
    if (!id) return;
    
    try {
      if (url && !url.includes('youtube')) {
        const filePath = url.split('/').pop();
        if (filePath) {
          await supabase.storage.from('solution_files').remove([filePath]);
        }
      }
      
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setMaterials(prev => prev.filter(material => material.id !== id));
      
      toast({
        title: "Material removido",
        description: "O material foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao remover material:", error);
      toast({
        title: "Erro ao remover material",
        description: error.message || "Ocorreu um erro ao tentar remover o material.",
        variant: "destructive",
      });
    }
  };

  return {
    savingResources,
    setSavingResources,
    handleUploadComplete,
    handleRemoveResource
  };
};
