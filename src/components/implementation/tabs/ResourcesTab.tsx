import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, File, Image, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourcesTabProps {
  solutionId: string;
  onComplete: () => void;
}

interface Resource {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  description?: string;
  created_at: string;
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({ solutionId, onComplete }) => {
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);

  const { data: resources, isLoading } = useQuery({
    queryKey: ['solution-resources', solutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_resources')
        .select('*')
        .eq('solution_id', solutionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Resource[];
    }
  });

  const handleDownload = async (resource: Resource) => {
    try {
      const { data, error } = await supabase.storage
        .from('solution_files')
        .download(resource.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Mark as downloaded
      if (!downloadedFiles.includes(resource.id)) {
        setDownloadedFiles(prev => [...prev, resource.id]);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  useEffect(() => {
    if (resources && downloadedFiles.length === resources.length && resources.length > 0) {
      onComplete();
    }
  }, [downloadedFiles, resources, onComplete]);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (fileType.includes('image')) return <Image className="w-6 h-6 text-blue-500" />;
    if (fileType.includes('video')) return <Video className="w-6 h-6 text-purple-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum arquivo encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Esta solução não possui materiais para download.
        </p>
        <Button onClick={onComplete} variant="outline">
          Continuar para próxima etapa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Materiais para Download</h2>
        <p className="text-muted-foreground">
          Baixe os arquivos necessários para implementar esta solução
        </p>
      </div>

      <div className="grid gap-4">
        {resources.map((resource) => {
          const isDownloaded = downloadedFiles.includes(resource.id);
          
          return (
            <Card key={resource.id} className={cn(
              "p-4 transition-all duration-300 hover:shadow-md border-2",
              isDownloaded ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getFileIcon(resource.file_type)}
                  <div>
                    <h3 className="font-medium">{resource.file_name}</h3>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {resource.file_type}
                      </Badge>
                      {isDownloaded && (
                        <Badge className="bg-primary/20 text-primary text-xs">
                          Baixado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleDownload(resource)}
                  variant={isDownloaded ? "outline" : "default"}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloaded ? "Baixar novamente" : "Baixar"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {resources.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Progresso: {downloadedFiles.length} de {resources.length} arquivos baixados
          </p>
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500"
              style={{ width: `${(downloadedFiles.length / resources.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesTab;