
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  File as FileIcon, 
  FileImage, 
  FileCode, 
  Save, 
  Loader2,
  FileSpreadsheet,
  Presentation,
  FileVideo
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// Import custom types
import { Resource, ResourceMetadata } from "./types/ResourceTypes";

// Import utility functions
import { 
  detectFileType, 
  getFileFormatName, 
  formatFileSize 
} from "./utils/resourceUtils";

// Import custom components
import ResourceFilterBar from "./components/ResourceFilterBar";
import ResourceUploadCard from "./components/ResourceUploadCard";
import ResourceList from "./components/ResourceList";
import ResourceFormDialog from "./components/ResourceFormDialog";

interface ResourcesUploadFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesUploadForm: React.FC<ResourcesUploadFormProps> = ({
  solutionId,
  onSave,
  saving
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingResources, setSavingResources] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState<string>("all");
  const [showNewResourceDialog, setShowNewResourceDialog] = useState(false);
  const [newResource, setNewResource] = useState<ResourceMetadata>({
    title: "",
    description: "",
    url: "",
    type: "document",
    tags: [],
    order: 0,
    downloads: 0
  });
  const { toast } = useToast();

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
        const typedResources = data.map(item => {
          let metadata: ResourceMetadata | undefined;
          try {
            if (typeof item.metadata === 'string') {
              metadata = JSON.parse(item.metadata);
            } else if (item.metadata) {
              metadata = item.metadata as ResourceMetadata;
            } else {
              metadata = {
                title: item.name,
                description: `Arquivo ${item.format || getFileFormatName(item.name)}`,
                url: item.url,
                type: item.type as any,
                format: item.format,
                tags: [],
                order: 0,
                downloads: 0,
                size: item.size,
                version: "1.0"
              };
            }
          } catch (e) {
            console.error("Error parsing metadata:", e);
            metadata = {
              title: item.name,
              description: `Arquivo`,
              url: item.url,
              type: item.type as any,
            };
          }
          
          let validType: "document" | "image" | "template" | "pdf" | "spreadsheet" | "presentation" | "video" | "other" = "document";
          
          if (item.type === "image") {
            validType = "image";
          } else if (item.type === "template") {
            validType = "template";
          } else if (item.type === "pdf") {
            validType = "pdf";
          } else if (item.type === "spreadsheet") {
            validType = "spreadsheet";
          } else if (item.type === "presentation") {
            validType = "presentation";
          } else if (item.type === "video") {
            validType = "video";
          } else if (item.type === "other") {
            validType = "other";
          }
          
          return {
            id: item.id,
            name: item.name,
            url: item.url,
            type: validType,
            format: item.format,
            solution_id: item.solution_id,
            metadata: metadata,
            created_at: item.created_at,
            updated_at: item.updated_at,
            module_id: item.module_id,
            size: item.size
          } as Resource;
        });
        
        const sortedResources = typedResources.sort((a, b) => {
          const orderA = a.metadata?.order || 0;
          const orderB = b.metadata?.order || 0;
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
        order: resources.length,
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
        metadata: metadata
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

  const handleCreateResource = async () => {
    if (!solutionId) return;
    
    try {
      if (!newResource.title || !newResource.description || !newResource.url) {
        toast({
          title: "Campos obrigatórios",
          description: "Título, descrição e URL são campos obrigatórios.",
          variant: "destructive",
        });
        return;
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
          updated_at: data.updated_at
        };
        
        setResources(prev => [...prev, resource]);
      }
      
      setNewResource({
        title: "",
        description: "",
        url: "",
        type: "document",
        tags: [],
        order: resources.length,
        downloads: 0
      });
      
      setShowNewResourceDialog(false);
      
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

  const handleRemoveResource = async (id?: string, url?: string) => {
    if (!id) return;
    
    try {
      if (url) {
        const filePath = url.split("/").pop();
        if (filePath) {
          try {
            await supabase.storage
              .from("solution_files")
              .remove([`documents/${filePath}`]);
          } catch (storageError) {
            console.error("Error removing file from storage (might be external URL):", storageError);
          }
        }
      }
      
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
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

  const saveAndContinue = async () => {
    if (!solutionId) return;
    
    try {
      setSavingResources(true);
      
      onSave();
      
      toast({
        title: "Recursos salvos",
        description: "Os recursos foram salvos com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar recursos:", error);
      toast({
        title: "Erro ao salvar recursos",
        description: error.message || "Ocorreu um erro ao tentar salvar os recursos.",
        variant: "destructive",
      });
    } finally {
      setSavingResources(false);
    }
  };

  const getFileIcon = (type?: string) => {
    const iconProps = { className: "h-6 w-6" };
    
    if (!type) return <FileIcon {...iconProps} />;
    
    switch(type) {
      case 'pdf':
        return <FileText {...iconProps} />;
      case 'document':
        return <FileText {...iconProps} />;
      case 'spreadsheet':
        return <FileSpreadsheet {...iconProps} />;
      case 'presentation':
        return <Presentation {...iconProps} />;
      case 'image':
        return <FileImage {...iconProps} />;
      case 'video':
        return <FileVideo {...iconProps} />;
      case 'template':
        return <FileCode {...iconProps} />;
      default:
        return <FileIcon {...iconProps} />;
    }
  };

  const filteredResources = resources.filter(resource => {
    const searchMatch = 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.metadata?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const tabMatch = 
      activeFilterTab === "all" || 
      resource.type === activeFilterTab;
    
    return searchMatch && tabMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Materiais de Apoio</h3>
        <p className="text-sm text-muted-foreground">
          Adicione documentos, templates e imagens que ajudarão o usuário a implementar a solução.
        </p>
      </div>
      
      <ResourceFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilterTab={activeFilterTab}
        setActiveFilterTab={setActiveFilterTab}
        openNewResourceDialog={() => setShowNewResourceDialog(true)}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResourceUploadCard handleUploadComplete={handleUploadComplete} />
      </div>
      
      <ResourceList 
        filteredResources={filteredResources} 
        searchQuery={searchQuery} 
        handleRemoveResource={handleRemoveResource}
        formatFileSize={formatFileSize}
      />
      
      <ResourceFormDialog
        showDialog={showNewResourceDialog}
        setShowDialog={setShowNewResourceDialog}
        newResource={newResource}
        setNewResource={setNewResource}
        handleCreateResource={handleCreateResource}
        detectFileType={detectFileType}
        getFileFormatName={getFileFormatName}
        getFileIcon={getFileIcon}
      />
      
      <Button 
        onClick={saveAndContinue}
        disabled={savingResources || saving}
        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        {savingResources ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar e Continuar
          </>
        )}
      </Button>
    </div>
  );
};

export default ResourcesUploadForm;
