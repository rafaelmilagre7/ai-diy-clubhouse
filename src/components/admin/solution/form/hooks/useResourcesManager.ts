
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Resource, ResourceMetadata } from "../types/ResourceTypes";

export function useResourcesManager(solutionId: string | null) {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingResources, setSavingResources] = useState(false);

  // Carregar recursos quando o componente montar
  useEffect(() => {
    if (solutionId) {
      fetchResources();
    } else {
      setLoading(false);
    }
  }, [solutionId]);

  // Buscar recursos do Supabase
  const fetchResources = async () => {
    if (!solutionId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId);
        
      if (error) throw error;
      
      if (data) {
        // Processar os recursos
        const processedResources: Resource[] = data.map(item => {
          let metadata;
          
          try {
            metadata = typeof item.metadata === 'string' 
              ? JSON.parse(item.metadata)
              : item.metadata || {};
          } catch (e) {
            metadata = {};
          }
          
          return {
            id: item.id,
            name: item.name,
            url: item.url,
            type: item.type,
            format: item.format,
            solution_id: item.solution_id,
            metadata: metadata,
            created_at: item.created_at,
            updated_at: item.updated_at,
            module_id: item.module_id,
            size: item.size
          };
        });
        
        setResources(processedResources);
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

  // Gerenciar o upload de arquivos
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
      // Determinar o tipo de arquivo
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const fileType = getFileType(fileExtension);
      
      // Criar metadados
      const metadata: ResourceMetadata = {
        title: fileName,
        description: `Arquivo ${fileExtension}`,
        url: url,
        type: fileType,
        format: fileExtension,
        size: fileSize,
        version: "1.0"
      };
      
      // Salvar no Supabase
      const { data, error } = await supabase
        .from("solution_resources")
        .insert({
          solution_id: solutionId,
          name: fileName,
          url: url,
          type: fileType,
          format: fileExtension,
          metadata: metadata,
          size: fileSize
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newResource: Resource = {
          id: data.id,
          name: data.name,
          url: data.url,
          type: data.type,
          format: data.format,
          solution_id: data.solution_id,
          metadata: metadata,
          created_at: data.created_at,
          updated_at: data.updated_at,
          size: data.size
        };
        
        // Adicionar ao estado
        setResources(prev => [newResource, ...prev]);
        
        toast({
          title: "Material adicionado",
          description: "O material foi adicionado com sucesso.",
        });
      }
    } catch (error: any) {
      console.error("Erro ao adicionar material:", error);
      toast({
        title: "Erro ao adicionar material",
        description: error.message || "Ocorreu um erro ao tentar adicionar o material.",
        variant: "destructive",
      });
    }
  };

  // Remover um recurso
  const handleRemoveResource = async (id?: string) => {
    if (!id) return;
    
    try {
      // Get resource to remove from storage if needed
      const resourceToRemove = resources.find(r => r.id === id);
      
      if (resourceToRemove?.url && resourceToRemove.url.includes('solution_files')) {
        try {
          const filePath = resourceToRemove.url.split('/').pop() || '';
          await supabase.storage
            .from('solution_files')
            .remove([`documents/${filePath}`]);
        } catch (storageError) {
          console.error("Erro ao remover arquivo do storage:", storageError);
          // Continue porque o registro ainda pode ser removido do banco
        }
      }
      
      // Remove from database
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Update state
      setResources(prev => prev.filter(r => r.id !== id));
      
      toast({
        title: "Material removido",
        description: "O material foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao remover recurso:", error);
      toast({
        title: "Erro ao remover recurso",
        description: error.message || "Ocorreu um erro ao tentar remover o recurso.",
        variant: "destructive",
      });
    }
  };

  // Helper para determinar o tipo de arquivo
  function getFileType(extension: string): "document" | "image" | "template" | "pdf" | "spreadsheet" | "presentation" | "video" | "other" {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const docExtensions = ['doc', 'docx', 'txt', 'rtf', 'odt'];
    const pdfExtensions = ['pdf'];
    const spreadsheetExtensions = ['xls', 'xlsx', 'csv', 'ods'];
    const presentationExtensions = ['ppt', 'pptx', 'odp'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
    
    if (imageExtensions.includes(extension)) return "image";
    if (docExtensions.includes(extension)) return "document";
    if (pdfExtensions.includes(extension)) return "pdf";
    if (spreadsheetExtensions.includes(extension)) return "spreadsheet";
    if (presentationExtensions.includes(extension)) return "presentation";
    if (videoExtensions.includes(extension)) return "video";
    
    return "other";
  }

  return {
    resources,
    setResources,
    loading,
    savingResources,
    setSavingResources,
    handleUploadComplete,
    handleRemoveResource
  };
}
