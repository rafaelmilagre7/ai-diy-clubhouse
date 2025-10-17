
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, FilePlus2, FileImage, FileVideo, Link as LinkIcon, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface LessonResourceProps {
  id: string;
  title?: string | null;
  name?: string | null; // Adicionado para compatibilidade com o banco
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

  // Preparar tipos de recursos para filtragem
  const resourceTypes = resources.length > 0 ? 
    ["all", ...new Set(resources.map(r => r.resource_type || "outros"))] : 
    ["all"];

  // Filtrar recursos baseado no tipo ativo
  const filteredResources = activeType === "all" 
    ? resources 
    : resources.filter(r => r.resource_type === activeType);

  // Função para gerar ícone baseado no tipo de arquivo
  const getResourceIcon = (resource: LessonResourceProps) => {
    const fileType = resource.file_type?.toLowerCase();
    
    if (resource.external_url) {
      return <LinkIcon className="h-5 w-5 text-operational" />;
    }
    
    if (!fileType) {
      return <FilePlus2 className="h-5 w-5 text-muted-foreground" />;
    }
    
    if (fileType.includes("pdf") || fileType.includes("doc")) {
      return <FileText className="h-5 w-5 text-status-warning" />;
    }
    
    if (fileType.includes("image") || fileType.includes("png") || fileType.includes("jpg") || fileType.includes("jpeg")) {
      return <FileImage className="h-5 w-5 text-strategy" />;
    }
    
    if (fileType.includes("video") || fileType.includes("mp4")) {
      return <FileVideo className="h-5 w-5 text-status-error" />;
    }
    
    return <FilePlus2 className="h-5 w-5 text-muted-foreground" />;
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
      // Usar o campo title ou name para o nome do arquivo, dependendo de qual está disponível
      link.download = resource.title || resource.name || "arquivo";
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
    <div className="backdrop-blur-sm bg-white/5 rounded-xl border border-white/10 shadow-lg">
      <div className="p-6 border-b border-white/10">
        <h3 className="flex items-center gap-3 text-xl font-semibold text-foreground mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <span>Material complementar</span>
        </h3>
        <p className="text-muted-foreground/80 text-sm">
          {resources.length > 0 
            ? "Recursos adicionais para aprofundar seus conhecimentos"
            : "Esta aula não possui materiais complementares disponíveis para download"
          }
        </p>
        
        {resourceTypes.length > 2 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {resourceTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 capitalize ${
                    activeType === type
                      ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20'
                      : 'bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {type === "all" ? "Todos" : type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {resources.length === 0 ? (
          <div className="py-8 text-center">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8">
              <BookOpen className="h-12 w-12 text-primary/60 mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">
                Nenhum material adicional
              </h3>
              <p className="text-sm text-muted-foreground/80">
                Esta aula não possui materiais complementares disponíveis para download. 
                O conteúdo principal da aula já contém todas as informações necessárias.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResources.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground/80">
                Nenhum recurso deste tipo disponível.
              </p>
            ) : (
              filteredResources.map((resource, index) => (
                <div key={resource.id} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                        {getResourceIcon(resource)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {resource.title || resource.name || "Material sem título"}
                        </h4>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground/80 mt-1 line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {resource.file_size_bytes && (
                            <span className="text-xs bg-white/10 text-muted-foreground/80 px-2 py-1 rounded-full border border-white/20">
                              {formatFileSize(resource.file_size_bytes)}
                            </span>
                          )}
                          {resource.resource_type && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/20">
                              {resource.resource_type}
                            </span>
                          )}
                          {resource.external_url && (
                            <span className="text-xs bg-operational/20 text-operational px-2 py-1 rounded-full border border-operational/20">
                              Link externo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResourceClick(resource)}
                      disabled={downloading === resource.id}
                      className="ml-4 flex-shrink-0 bg-white/10 border-0 hover:bg-white/20 transition-all duration-200"
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
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
