
import { useState } from "react";
import { useToastModern } from "@/hooks/useToastModern";
import { supabase } from "@/lib/supabase";
import { Resource, ResourceMetadata } from "../types/ResourceTypes";
import { detectFileType, getFileFormatName } from "../utils/resourceUtils";

export const useMaterialsOperations = (
  solutionId: string | null,
  setMaterials: React.Dispatch<React.SetStateAction<Resource[]>>
) => {
  const { showSuccess, showError } = useToastModern();
  const [savingResources, setSavingResources] = useState(false);

  const handleUploadComplete = async (url: string, fileName: string, fileSize: number) => {
    if (!solutionId) return;
    
    try {
      const fileType = detectFileType(fileName);
      const format = getFileFormatName(fileName);
      
      const metadata = {
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
        setMaterials(prev => [...prev, data as Resource]);
      }
      
      showSuccess("Material adicionado", "O material foi adicionado com sucesso.");
    } catch (error: any) {
      console.error("Erro ao adicionar material:", error);
      showError("Erro ao adicionar material", error.message || "Ocorreu um erro ao tentar adicionar o material.");
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
      
      showSuccess("Material removido", "O material foi removido com sucesso.");
    } catch (error: any) {
      console.error("Erro ao remover material:", error);
      showError("Erro ao remover material", error.message || "Ocorreu um erro ao tentar remover o material.");
    }
  };

  return {
    savingResources,
    setSavingResources,
    handleUploadComplete,
    handleRemoveResource
  };
};
