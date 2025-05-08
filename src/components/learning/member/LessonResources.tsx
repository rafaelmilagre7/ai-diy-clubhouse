
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, FilePlus2, FileImage, FileVideo, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface LessonResourceProps {
  id: string;
  title: string;
  description?: string | null;
  file_url?: string | null;
  file_type?: string | null;
  external_url?: string | null;
  resource_type?: string | null;
  file_size_bytes?: number | null;
}

export const LessonResources = ({ resources = [] }: { resources: LessonResourceProps[] }) => {
  const [activeType, setActiveType] = useState<string>("all");
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!resources || resources.length === 0) {
    return null;
  }

  // Preparar tipos de recursos para filtragem
  const resourceTypes = ["all", ...new Set(resources.map(r => r.resource_type || "outros"))];

  // Filtrar recursos baseado no tipo ativo
  const filteredResources = activeType === "all" 
    ? resources 
    : resources.filter(r => r.resource_type === activeType);

  // Função para gerar ícone baseado no tipo de arquivo
  const getResourceIcon = (resource: LessonResourceProps) => {
    const fileType = resource.file_type?.toLowerCase();
    
    if (resource.external_url) {
      return <LinkIcon className="h-5 w-5 text-blue-500" />;
    }
    
    if (!fileType) {
      return <FilePlus2 className="h-5 w-5 text-gray-500" />;
    }
    
    if (fileType.includes("pdf") || fileType.includes("doc")) {
      return <FileText className="h-5 w-5 text-orange-500" />;
    }
    
    if (fileType.includes("image") || fileType.includes("png") || fileType.includes("jpg") || fileType.includes("jpeg")) {
      return <FileImage className="h-5 w-5 text-purple-500" />;
    }
    
    if (fileType.includes("video") || fileType.includes("mp4")) {
      return <FileVideo className="h-5 w-5 text-red-500" />;
    }
    
    return <FilePlus2 className="h-5 w-5 text-gray-500" />;
  };

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return "";
    
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  // Função para baixar ou abrir recurso
  const handleResourceClick = async (resource: LessonResourceProps) => {
    try {
      // Se é um link externo, abrir em nova janela
      if (resource.external_url) {
        window.open(resource.external_url, "_blank");
        return;
      }
      
      // Se não tem URL, não fazer nada
      if (!resource.file_url) {
        toast.error("Recurso indisponível");
        return;
      }
      
      setDownloading(resource.id);
      
      // Baixar arquivo
      const response = await fetch(resource.file_url);
      if (!response.ok) {
        throw new Error("Falha ao baixar arquivo");
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Erro ao baixar recurso:", error);
      toast.error("Erro ao baixar recurso. Tente novamente.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Material complementar</CardTitle>
        <CardDescription>
          Recursos adicionais para aprofundar seus conhecimentos
        </CardDescription>
        
        {resourceTypes.length > 2 && (
          <Tabs 
            value={activeType} 
            onValueChange={setActiveType}
            className="mt-2"
          >
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {resourceTypes.map(type => (
                <TabsTrigger 
                  key={type} 
                  value={type}
                  className="capitalize"
                >
                  {type === "all" ? "Todos" : type}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 divide-y">
          {filteredResources.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum recurso deste tipo disponível.
            </p>
          ) : (
            filteredResources.map((resource, index) => (
              <div key={resource.id} className={`pt-3 ${index > 0 ? 'pt-3' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    {getResourceIcon(resource)}
                    <div>
                      <h4 className="font-medium">{resource.title}</h4>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {resource.file_size_bytes && (
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(resource.file_size_bytes)}
                          </span>
                        )}
                        {resource.resource_type && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            {resource.resource_type}
                          </span>
                        )}
                        {resource.external_url && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            Link externo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResourceClick(resource)}
                    disabled={downloading === resource.id}
                    className="ml-2 flex-shrink-0"
                  >
                    {downloading === resource.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : resource.external_url ? (
                      <LinkIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    {resource.external_url ? "Abrir" : "Baixar"}
                  </Button>
                </div>
                {index < filteredResources.length - 1 && <Separator className="mt-3" />}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
