
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues } from "./useResourcesFormData";
import { Resource } from "../types/ResourceTypes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { parseResourceMetadata } from "../utils/resourceMetadataUtils";
import { detectFileType, getFileFormatName } from "../utils/resourceUtils";

export const useResourceMaterialsTab = (
  form: UseFormReturn<ResourceFormValues>,
  solutionId: string | null
) => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load materials from Supabase when component mounts
  useEffect(() => {
    if (solutionId) {
      fetchMaterials();
    } else {
      setLoading(false);
    }
  }, [solutionId]);

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
        // Process the materials data using the parseResourceMetadata utility
        const processedMaterials = data.map(item => parseResourceMetadata(item));
        
        // Update materials state and form value
        setMaterials(processedMaterials);
        
        // Update the form value with the JSON representation
        updateFormValue(processedMaterials);
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

  // Update the form value with the current materials
  const updateFormValue = (updatedMaterials: Resource[]) => {
    // Convert materials to the format needed for the form
    const materialsForJson = updatedMaterials.map(material => ({
      id: material.id,
      title: material.metadata.title || material.name,
      description: material.metadata.description || "",
      url: material.url,
      type: material.type,
      format: material.format || material.metadata.format,
      size: material.size || material.metadata.size
    }));
    
    form.setValue('materials', JSON.stringify(materialsForJson, null, 2));
  };

  const handleUploadComplete = async (url: string, fileName: string, fileSize: number) => {
    if (!solutionId) {
      toast({
        title: "Erro",
        description: "É necessário salvar a solução antes de adicionar materiais.",
        variant: "destructive",
      });
      return;
    }
    
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
        order: materials.length,
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
        // Create a proper Resource object with the received data
        const newMaterial = parseResourceMetadata(data);
        
        // Add the new resource to the state
        const newMaterials = [...materials, newMaterial];
        
        setMaterials(newMaterials);
        updateFormValue(newMaterials);
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

  const handleRemoveMaterial = async (id: string) => {
    if (!id) return;
    
    try {
      // Get the material to remove
      const materialToRemove = materials.find(m => m.id === id);
      
      if (materialToRemove && materialToRemove.url) {
        // If the file is stored in Supabase storage, try to remove it
        try {
          const fileName = materialToRemove.url.split('/').pop();
          if (fileName && fileName.includes('documents/')) {
            const filePath = fileName;
            await supabase.storage.from('solution_files').remove([filePath]);
          }
        } catch (storageError) {
          console.error("Error removing file from storage:", storageError);
          // Continue even if storage removal fails (might be an external URL)
        }
      }
      
      // Remove from Supabase
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Remove from state
      const updatedMaterials = materials.filter(material => material.id !== id);
      setMaterials(updatedMaterials);
      updateFormValue(updatedMaterials);
      
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
    materials,
    loading,
    handleUploadComplete,
    handleRemoveMaterial
  };
};
