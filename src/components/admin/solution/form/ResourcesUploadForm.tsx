
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  FileText, 
  File as FileIcon, 
  FileImage, 
  FileCode, 
  Save, 
  Loader2, 
  Trash2, 
  Download 
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id?: string;
  name: string;
  url: string;
  type: "document" | "image" | "template";
  format?: string;
  solution_id: string;
}

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
        .is("module_id", null); // apenas recursos da solução, não de módulos específicos
        
      if (error) throw error;
      
      if (data) {
        const typedResources = data.map(item => {
          let validType: "document" | "image" | "template" = "document";
          
          if (item.type === "image") {
            validType = "image";
          } else if (item.type === "template") {
            validType = "template";
          }
          
          return {
            id: item.id,
            name: item.name,
            url: item.url,
            type: validType,
            format: item.format,
            solution_id: item.solution_id
          } as Resource;
        });
        
        setResources(typedResources);
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

  const handleUploadComplete = async (url: string, fileName: string, type: "document" | "image" | "template") => {
    if (!solutionId) return;
    
    try {
      const fileExt = fileName.split(".").pop()?.toLowerCase() || "";
      let format = fileExt;
      
      if (["doc", "docx"].includes(fileExt)) format = "Word";
      if (["xls", "xlsx"].includes(fileExt)) format = "Excel";
      if (["ppt", "pptx"].includes(fileExt)) format = "PowerPoint";
      if (["pdf"].includes(fileExt)) format = "PDF";
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt)) format = "Imagem";
      
      const newResource = {
        solution_id: solutionId,
        name: fileName,
        url,
        type,
        format
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
          type: type,
          format: data.format,
          solution_id: data.solution_id
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

  const handleRemoveResource = async (id?: string, url?: string) => {
    if (!id) return;
    
    try {
      if (url) {
        const filePath = url.split("/").pop();
        if (filePath) {
          await supabase.storage
            .from("solution_files")
            .remove([`documents/${filePath}`]);
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

  const getFileIcon = (format?: string) => {
    const iconProps = { className: "h-6 w-6" };
    
    if (!format) return <FileIcon {...iconProps} />;
    
    const lowerFormat = format.toLowerCase();
    
    if (lowerFormat === "pdf") return <FileText {...iconProps} />;
    if (["doc", "docx", "word"].includes(lowerFormat)) return <FileText {...iconProps} />;
    if (["jpg", "jpeg", "png", "gif", "webp", "imagem"].includes(lowerFormat)) return <FileImage {...iconProps} />;
    if (["html", "css", "js", "json", "xml", "template"].includes(lowerFormat)) return <FileCode {...iconProps} />;
    
    return <FileIcon {...iconProps} />;
  };

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documentos</CardTitle>
            <CardDescription>
              Adicione PDFs, arquivos do Word, planilhas e outros documentos de apoio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              bucketName="solution_files"
              folder="documents"
              onUploadComplete={(url, fileName) => handleUploadComplete(url, fileName, "document")}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              buttonText="Upload de Documento"
              fieldLabel="Selecione um documento"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Templates e Fluxos</CardTitle>
            <CardDescription>
              Adicione templates, fluxos de automação e outros recursos técnicos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              bucketName="solution_files"
              folder="templates"
              onUploadComplete={(url, fileName) => handleUploadComplete(url, fileName, "template")}
              accept=".json,.txt,.html,.css,.js,.xml,.csv"
              buttonText="Upload de Template"
              fieldLabel="Selecione um template"
            />
          </CardContent>
        </Card>
      </div>
      
      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recursos Adicionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resources.map((resource) => (
                <div 
                  key={resource.id} 
                  className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(resource.format)}
                    <div>
                      <p className="font-medium">{resource.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {resource.format || resource.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(resource.url, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-1" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveResource(resource.id, resource.url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
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
