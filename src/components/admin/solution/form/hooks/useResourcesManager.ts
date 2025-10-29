
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Resource, ResourceMetadata } from "../types/ResourceTypes";
import { useToastModern } from "@/hooks/useToastModern";
import { parseResourceMetadata } from "../utils/resourceMetadataUtils";
import { detectFileType } from "../utils/resourceUtils";

export function useResourcesManager(solutionId: string | null) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingResources, setSavingResources] = useState(false);
  const { showSuccess, showError } = useToastModern();
  
  // Fetch resources on component mount
  useEffect(() => {
    if (solutionId) {
      fetchResources();
    } else {
      setLoading(false);
    }
  }, [solutionId]);
  
  // Fetch resources from Supabase
  const fetchResources = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId)
        .is("module_id", null)
        .neq("type", "video");
        
      if (error) throw error;
      
      if (data) {
        // Map the data to Resource objects
        const mappedResources = data.map(parseResourceMetadata);
        setResources(mappedResources);
      }
    } catch (error: any) {
      console.error("Error fetching resources:", error);
      showError("Erro ao carregar materiais", error.message || "Ocorreu um erro ao tentar carregar os materiais.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file upload completion
  const handleUploadComplete = async (url: string, fileName: string, fileSize: number) => {
    if (!solutionId) return;
    
    try {
      // Detect file type and format
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const fileType = getFileType(fileExtension);
      const fileFormat = getFileFormat(fileExtension);
      
      // Create metadata object
      const metadata: ResourceMetadata = {
        title: fileName,
        description: `Arquivo ${fileFormat}`,
        url: url,
        type: fileType,
        format: fileFormat,
        tags: [],
        order: 0,
        downloads: 0,
        size: fileSize,
        version: "1.0"
      };
      
      // Create new resource object
      const newResource = {
        solution_id: solutionId,
        name: fileName,
        url: url,
        type: fileType,
        format: fileFormat,
        metadata: JSON.stringify(metadata),
        size: fileSize
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newResource)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Map to Resource object and add to state
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
        
        showSuccess("Material adicionado", "O material foi adicionado com sucesso.");
      }
    } catch (error: any) {
      console.error("Error adding resource:", error);
      showError("Erro ao adicionar material", error.message || "Ocorreu um erro ao tentar adicionar o material.");
      throw error;
    }
  };
  
  // Handle resource removal
  const handleRemoveResource = async (id?: string, url?: string) => {
    if (!id) return;
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Remove from state
      setResources(prev => prev.filter(resource => resource.id !== id));
      
      showSuccess("Material removido", "O material foi removido com sucesso.");
    } catch (error: any) {
      console.error("Error removing resource:", error);
      showError("Erro ao remover material", error.message || "Ocorreu um erro ao tentar remover o material.");
      throw error;
    }
  };
  
  // Helper functions for file type and format detection
  function getFileType(extension: string): Resource['type'] {
    const documentExtensions = ['doc', 'docx', 'odt', 'rtf', 'txt'];
    const spreadsheetExtensions = ['xls', 'xlsx', 'ods', 'csv'];
    const presentationExtensions = ['ppt', 'pptx', 'odp', 'key'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const pdfExtensions = ['pdf'];
    const videoExtensions = ['mp4', 'webm', 'ogv', 'mov', 'avi'];
    
    if (documentExtensions.includes(extension)) return 'document';
    if (spreadsheetExtensions.includes(extension)) return 'spreadsheet';
    if (presentationExtensions.includes(extension)) return 'presentation';
    if (imageExtensions.includes(extension)) return 'image';
    if (pdfExtensions.includes(extension)) return 'pdf';
    if (videoExtensions.includes(extension)) return 'video';
    
    return 'other';
  }
  
  function getFileFormat(extension: string): string {
    const formats: {[key: string]: string} = {
      'doc': 'Word',
      'docx': 'Word',
      'xls': 'Excel',
      'xlsx': 'Excel',
      'ppt': 'PowerPoint',
      'pptx': 'PowerPoint',
      'pdf': 'PDF',
      'jpg': 'Imagem',
      'jpeg': 'Imagem',
      'png': 'Imagem',
      'gif': 'Imagem',
      'mp4': 'Vídeo',
      'webm': 'Vídeo',
      'mov': 'Vídeo',
      'csv': 'CSV',
      'txt': 'Texto',
      'rtf': 'Rich Text',
      'zip': 'Arquivo ZIP',
      'rar': 'Arquivo RAR'
    };
    
    return formats[extension] || 'Outro';
  }
  
  return {
    resources,
    setResources, // Now exposing this
    loading,
    savingResources,
    setSavingResources,
    handleUploadComplete,
    handleRemoveResource
  };
}
