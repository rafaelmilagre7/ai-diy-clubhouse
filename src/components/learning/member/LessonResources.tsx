
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, File, FileText, FileImage, MoreHorizontal } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

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
    if (!fileType) return File;
    
    if (fileType.includes('pdf')) return FileText; // Usado FileText no lugar de FilePdf
    if (fileType.includes('image')) return FileImage;
    if (fileType.includes('text')) return FileText;
    
    return File;
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
          <Card key={resource.id} className="overflow-hidden">
            <div className="flex items-center p-4 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <FileIcon 
                  className={`h-6 w-6 ${isPdf ? 'text-red-500' : 'text-primary'}`} 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{resource.name}</h3>
                {resource.description && (
                  <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                )}
                {resource.file_size_bytes && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(resource.file_size_bytes)}
                  </p>
                )}
              </div>
              
              <Button asChild variant="outline" size="sm">
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
