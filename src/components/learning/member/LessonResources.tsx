
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, ExternalLink, File } from "lucide-react";
import { LearningResource } from "@/lib/supabase";

interface LessonResourcesProps {
  resources: LearningResource[];
}

export const LessonResources: React.FC<LessonResourcesProps> = ({ resources }) => {
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-4 w-4" />;
    
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (type.includes('doc')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (type.includes('image')) return <File className="h-4 w-4 text-green-500" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    
    const kb = bytes / 1024;
    const mb = kb / 1024;
    
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    } else {
      return `${kb.toFixed(1)} KB`;
    }
  };

  const handleDownload = (resource: LearningResource) => {
    if (resource.file_url) {
      // Abrir em nova aba para download
      window.open(resource.file_url, '_blank');
    }
  };

  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-viverblue" />
            Recursos da Aula
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Download className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum recurso disponível para esta aula
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Recursos como PDFs, documentos e materiais complementares aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-viverblue" />
          Recursos da Aula ({resources.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {getFileIcon(resource.file_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {resource.name || 'Recurso sem nome'}
                </h4>
                {resource.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {resource.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {resource.file_type && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded uppercase">
                      {resource.file_type}
                    </span>
                  )}
                  {resource.file_size_bytes && (
                    <span className="text-xs text-gray-500">
                      {formatFileSize(resource.file_size_bytes)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(resource)}
                className="gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                Abrir
              </Button>
            </div>
          </div>
        ))}
        
        {/* Informação adicional */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Dica:</strong> Baixe os recursos para ter acesso offline e consultar sempre que precisar.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
