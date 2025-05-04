
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, File, FileText, FileImage, MoreHorizontal, FileArchive } from "lucide-react";
import { bytesToSize } from "@/lib/utils";

interface Resource {
  id: string;
  name: string;
  description?: string;
  file_url: string;
  file_type?: string;
  file_size_bytes?: number;
}

interface LessonResourcesProps {
  resources: Resource[];
}

export const LessonResources: React.FC<LessonResourcesProps> = ({ resources }) => {
  // Função para determinar o ícone baseado no tipo de arquivo
  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <File className="h-5 w-5" />;
    
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />; 
    if (fileType.includes('image')) return <FileImage className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('text') || fileType.includes('doc')) return <FileText className="h-5 w-5 text-blue-600" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('xls')) 
      return <FileText className="h-5 w-5 text-green-600" />;
    if (fileType.includes('zip') || fileType.includes('rar')) 
      return <FileArchive className="h-5 w-5 text-yellow-600" />;
    
    return <File className="h-5 w-5" />;
  };

  // Função para fazer download do arquivo
  const handleDownload = (resource: Resource) => {
    try {
      // Criar um link temporário para download
      const link = document.createElement('a');
      link.href = resource.file_url;
      link.setAttribute('download', resource.name);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      // Abrir em nova aba como fallback
      window.open(resource.file_url, '_blank');
    }
  };
  
  if (!resources.length) {
    return (
      <Card className="py-12 flex justify-center items-center">
        <CardContent className="text-center">
          <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhum material disponível</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Esta aula não possui materiais complementares.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {resources.map((resource) => {
        const FileIcon = getFileIcon(resource.file_type);
        const isPdf = resource.file_type?.includes('pdf');
        
        return (
          <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex items-center p-4 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                {FileIcon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{resource.name}</h3>
                {resource.description && (
                  <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                )}
                {resource.file_size_bytes && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {bytesToSize(resource.file_size_bytes)}
                  </p>
                )}
              </div>
              
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                onClick={() => handleDownload(resource)}
              >
                <a href={resource.file_url} target="_blank" rel="noopener noreferrer" download>
                  <Download className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Download</span>
                </a>
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
