
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileImage, FileVideo, File as FileIcon, FileArchive } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  name: string;
  url: string;
  type: string;
  format: string | null;
  solution_id: string;
  module_id: string | null;
}

interface ResourcesTabProps {
  solutionId: string;
  onComplete?: () => void;
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({ solutionId, onComplete }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchResources();
  }, [solutionId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId)
        .neq("type", "video"); // Excluir vídeos que vão na aba específica
      
      if (error) {
        console.error("Erro ao buscar recursos:", error);
        toast({
          title: "Erro ao carregar recursos",
          description: "Não foi possível carregar os recursos da solução.",
          variant: "destructive",
        });
        return;
      }
      
      setResources(data || []);
    } catch (error) {
      console.error("Erro ao buscar recursos:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao carregar os recursos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (resource: Resource) => {
    const fileType = resource.type?.toLowerCase() || '';
    const fileName = resource.name?.toLowerCase() || '';
    const format = resource.format?.toLowerCase() || '';
    
    // Verificar por tipo primeiro
    if (fileType.includes('image') || format.includes('image')) {
      return <FileImage className="h-6 w-6 text-purple-500" />;
    }
    
    if (fileType.includes('video') || format.includes('video')) {
      return <FileVideo className="h-6 w-6 text-orange-500" />;
    }
    
    if (fileType.includes('pdf') || format.includes('pdf') || fileName.includes('.pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    
    if (fileType.includes('document') || format.includes('doc') || fileName.includes('.doc')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    }
    
    if (fileType.includes('spreadsheet') || format.includes('xls') || fileName.includes('.xls')) {
      return <FileArchive className="h-6 w-6 text-green-500" />;
    }
    
    // Verificar extensões do nome do arquivo
    if (fileName.includes('.jpg') || fileName.includes('.png') || fileName.includes('.gif') || fileName.includes('.webp')) {
      return <FileImage className="h-6 w-6 text-purple-500" />;
    }
    
    if (fileName.includes('.mp4') || fileName.includes('.webm') || fileName.includes('.mov')) {
      return <FileVideo className="h-6 w-6 text-orange-500" />;
    }
    
    // Ícone padrão
    return <FileIcon className="h-6 w-6 text-gray-500" />;
  };

  const getFileFormatName = (resource: Resource): string => {
    const format = resource.format?.toLowerCase() || '';
    const fileName = resource.name?.toLowerCase() || '';
    
    if (format.includes('pdf') || fileName.includes('.pdf')) return "PDF";
    if (format.includes('doc') || fileName.includes('.doc')) return "Word";
    if (format.includes('xls') || fileName.includes('.xls')) return "Excel";
    if (format.includes('ppt') || fileName.includes('.ppt')) return "PowerPoint";
    if (format.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "Imagem";
    if (format.includes('video') || fileName.match(/\.(mp4|webm|mov)$/)) return "Vídeo";
    
    return resource.format || "Arquivo";
  };

  const handleDownload = async (resource: Resource) => {
    try {
      if (!resource.url) {
        toast({
          title: "Erro",
          description: "URL do arquivo não disponível.",
          variant: "destructive",
        });
        return;
      }

      // Para URLs do YouTube, abrir em nova aba
      if (resource.url.includes('youtube.com') || resource.url.includes('youtu.be')) {
        window.open(resource.url, '_blank');
        return;
      }

      // Para outros arquivos, tentar fazer download
      const response = await fetch(resource.url);
      if (!response.ok) throw new Error('Erro ao baixar arquivo');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resource.name || 'arquivo';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado",
        description: `O arquivo "${resource.name}" está sendo baixado.`,
      });
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Materiais e Recursos
        </h2>
        <p className="text-muted-foreground">
          Baixe os materiais necessários para implementar esta solução. Estes recursos foram especialmente selecionados para te ajudar no processo.
        </p>
      </div>

      {resources.length === 0 ? (
        <Card className="p-8 text-center">
          <FileIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhum recurso disponível</h3>
          <p className="text-muted-foreground">
            Esta solução ainda não possui materiais de apoio disponíveis.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-lg">
                  {getFileIcon(resource)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold mb-2 text-foreground">
                    {resource.name}
                  </h4>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {getFileFormatName(resource)}
                    </span>
                    {resource.type && (
                      <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm capitalize">
                        {resource.type}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Button
                    onClick={() => handleDownload(resource)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {resources.length > 0 && onComplete && (
        <div className="flex justify-center pt-6">
          <Button 
            onClick={onComplete}
            variant="outline"
            className="px-8"
          >
            Marcar como visualizado
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResourcesTab;
