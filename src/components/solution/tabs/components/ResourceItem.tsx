
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, File, Image, Video, Archive } from "lucide-react";
import { SolutionResource } from "@/hooks/useSolutionResources";

interface ResourceItemProps {
  resource: SolutionResource;
  onDownload: (resource: SolutionResource) => void;
}

export const ResourceItem = ({ resource, onDownload }: ResourceItemProps) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf') || type.includes('document')) {
      return <FileText className="h-6 w-6 text-red-400" />;
    }
    if (type.includes('image')) {
      return <Image className="h-6 w-6 text-green-400" />;
    }
    if (type.includes('video')) {
      return <Video className="h-6 w-6 text-purple-400" />;
    }
    if (type.includes('zip') || type.includes('archive')) {
      return <Archive className="h-6 w-6 text-amber-400" />;
    }
    
    return <File className="h-6 w-6 text-neutral-400" />;
  };

  const getFileTypeLabel = (fileType: string) => {
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('doc')) return 'Word';
    if (type.includes('xls')) return 'Excel';
    if (type.includes('ppt')) return 'PowerPoint';
    if (type.includes('zip')) return 'ZIP';
    if (type.includes('image')) return 'Imagem';
    if (type.includes('video')) return 'Vídeo';
    
    return fileType.toUpperCase();
  };

  const handleDownload = () => {
    onDownload(resource);
  };

  return (
    <Card className="bg-[#151823] border border-white/5 hover:border-white/10 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className="bg-neutral-800/50 p-3 rounded-lg shrink-0">
            {getFileIcon(resource.file_type)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-neutral-100 line-clamp-2">
                {resource.name}
              </h4>
              <div className="flex items-center gap-2 shrink-0">
                <Badge 
                  variant="outline" 
                  className="bg-neutral-800 text-neutral-300 border-neutral-700 text-xs"
                >
                  {getFileTypeLabel(resource.file_type)}
                </Badge>
                {resource.file_size && (
                  <Badge 
                    variant="outline" 
                    className="bg-neutral-700 text-neutral-400 border-neutral-600 text-xs"
                  >
                    {formatFileSize(resource.file_size)}
                  </Badge>
                )}
              </div>
            </div>
            
            {resource.description && (
              <p className="text-sm text-neutral-400 mb-4 line-clamp-2">
                {resource.description}
              </p>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="bg-transparent border-viverblue/20 text-viverblue hover:bg-viverblue/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Recurso
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
