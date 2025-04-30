
import { LearningResource } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileImage, FileArchive, File, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonResourcesProps {
  resources: LearningResource[];
}

export const LessonResources = ({ resources }: LessonResourcesProps) => {
  // Função para determinar o ícone com base no tipo de arquivo
  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="h-5 w-5" />;
    
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes("image")) return <FileImage className="h-5 w-5" />;
    if (fileType.includes("zip") || fileType.includes("rar")) return <FileArchive className="h-5 w-5" />;
    
    return <File className="h-5 w-5" />;
  };
  
  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return "Desconhecido";
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Materiais da aula</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {resources.map((resource) => (
            <div key={resource.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                {getFileIcon(resource.file_type)}
                <div className="ml-3">
                  <h4 className="text-sm font-medium">{resource.name}</h4>
                  {resource.description && (
                    <p className="text-xs text-muted-foreground">{resource.description}</p>
                  )}
                  {resource.file_size_bytes && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(resource.file_size_bytes)}
                    </p>
                  )}
                </div>
              </div>
              
              <Button size="sm" variant="ghost" asChild>
                <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  Baixar
                </a>
              </Button>
            </div>
          ))}
          
          {resources.length === 0 && (
            <p className="text-sm text-muted-foreground py-3">
              Nenhum material disponível para esta aula.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
