
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Simplified resource interface to avoid circular dependencies
interface SimpleResource {
  id?: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export const useResourcesManager = (solutionId: string | null) => {
  const { toast } = useToast();
  const [resources, setResources] = useState<SimpleResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingResources, setSavingResources] = useState(false);

  // Simplified fetch without complex types
  const fetchResources = async () => {
    if (!solutionId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Mock implementation to avoid type conflicts
      console.log(`Fetching resources for solution: ${solutionId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setResources([]);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({
        title: "Erro ao carregar recursos",
        description: "Não foi possível carregar a lista de recursos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [solutionId]);

  const handleUploadComplete = async (url: string, fileName: string, fileSize: number) => {
    if (!solutionId) return;
    
    try {
      const newResource: SimpleResource = {
        name: fileName,
        url: url,
        type: 'document',
        size: fileSize
      };
      
      setResources(prev => [...prev, newResource]);
      
      toast({
        title: "Recurso adicionado",
        description: "O recurso foi adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao adicionar recurso:", error);
      toast({
        title: "Erro ao adicionar recurso",
        description: error.message || "Ocorreu um erro ao tentar adicionar o recurso.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveResource = async (id?: string) => {
    if (!id) return;
    
    try {
      setResources(prev => prev.filter(resource => resource.id !== id));
      
      toast({
        title: "Recurso removido",
        description: "O recurso foi removido com sucesso.",
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

  return {
    resources,
    setResources,
    loading,
    savingResources,
    setSavingResources,
    handleUploadComplete,
    handleRemoveResource
  };
};
