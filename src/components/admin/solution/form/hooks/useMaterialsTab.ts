
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";
import { Resource, ResourceMetadata } from "../types/ResourceTypes";
import { detectFileType, getFileFormatName, formatFileSize } from "../utils/resourceUtils";
import { parseResourceMetadata } from "../utils/resourceMetadataUtils";

export function useMaterialsTab(solutionId: string | null, 
  updateFormValue: (resources: Resource[]) => void) {
  const { showSuccess, showError } = useToastModern();
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
        // Process the materials data
        const processedMaterials = data.map(item => parseResourceMetadata(item));
        
        // Update materials state and form value
        setMaterials(processedMaterials);
        
        // Update the form value with the JSON representation
        updateFormValue(processedMaterials);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      showError("Erro ao carregar materiais", "Não foi possível carregar a lista de materiais.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (url: string, fileName: string, fileSize: number) => {
    if (!solutionId) {
      showError("Erro", "É necessário salvar a solução antes de adicionar materiais.");
      return;
    }
    
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
        order: materials.length,
        downloads: 0,
        size: fileSize,
        version: "1.0"
      };
      
      // Convert metadata to string before sending to Supabase
      const newResource = {
        solution_id: solutionId,
        name: fileName,
        url: url,
        type: fileType,
        format: format,
        metadata: JSON.stringify(metadata), // Convert metadata to string
        size: fileSize
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newResource)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Add the new resource to the state
        const newMaterial = parseResourceMetadata(data);
        const newMaterials = [...materials, newMaterial];
        
        setMaterials(newMaterials);
        updateFormValue(newMaterials);
      }
      
      showSuccess("Material adicionado", "O material foi adicionado com sucesso.");
    } catch (error: any) {
      console.error("Erro ao adicionar material:", error);
      showError("Erro ao adicionar material", error.message || "Ocorreu um erro ao tentar adicionar o material.");
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
      
      showSuccess("Material removido", "O material foi removido com sucesso.");
    } catch (error: any) {
      console.error("Erro ao remover material:", error);
      showError("Erro ao remover material", error.message || "Ocorreu um erro ao tentar remover o material.");
    }
  };

  return {
    materials,
    loading,
    handleUploadComplete,
    handleRemoveMaterial
  };
}
