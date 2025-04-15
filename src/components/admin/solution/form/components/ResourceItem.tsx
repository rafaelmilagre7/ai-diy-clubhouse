
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  File as FileIcon, 
  FileImage, 
  FileCode, 
  Download,
  Trash2,
  FileSpreadsheet,
  Presentation,
  FileVideo
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Resource } from "../types/ResourceTypes";

interface ResourceItemProps {
  resource: Resource;
  handleRemoveResource: (id?: string, url?: string) => Promise<void>;
  formatFileSize: (bytes: number) => string;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ 
  resource, 
  handleRemoveResource,
  formatFileSize 
}) => {
  const getFileIcon = (type?: string) => {
    const iconProps = { className: "h-6 w-6" };
    
    if (!type) return <FileIcon {...iconProps} />;
    
    switch(type) {
      case 'pdf':
        return <FileText {...iconProps} />;
      case 'document':
        return <FileText {...iconProps} />;
      case 'spreadsheet':
        return <FileSpreadsheet {...iconProps} />;
      case 'presentation':
        return <Presentation {...iconProps} />;
      case 'image':
        return <FileImage {...iconProps} />;
      case 'video':
        return <FileVideo {...iconProps} />;
      case 'template':
        return <FileCode {...iconProps} />;
      default:
        return <FileIcon {...iconProps} />;
    }
  };

  return (
    <div 
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md bg-gray-50 gap-3"
    >
      <div className="flex items-start gap-3">
        {getFileIcon(resource.type)}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{resource.metadata?.title || resource.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{resource.metadata?.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={resource.type as any} className="capitalize">
              {resource.type}
            </Badge>
            
            {resource.metadata?.format && (
              <Badge variant="outline">
                {resource.metadata.format}
              </Badge>
            )}
            
            {resource.metadata?.size && (
              <Badge variant="outline">
                {formatFileSize(resource.metadata.size)}
              </Badge>
            )}
            
            {resource.metadata?.tags?.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex gap-1"
            >
              <Download className="h-4 w-4 flex-shrink-0" />
              <span className="sm:hidden md:inline">Download</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent width={300} align="end">
            <div className="text-sm">
              <p className="font-medium mb-2">Detalhes do arquivo:</p>
              <div className="space-y-1">
                <p><span className="text-muted-foreground">Nome:</span> {resource.name}</p>
                {resource.metadata?.size && (
                  <p><span className="text-muted-foreground">Tamanho:</span> {formatFileSize(resource.metadata.size)}</p>
                )}
                {resource.metadata?.format && (
                  <p><span className="text-muted-foreground">Formato:</span> {resource.metadata.format}</p>
                )}
                {resource.metadata?.version && (
                  <p><span className="text-muted-foreground">Versão:</span> {resource.metadata.version}</p>
                )}
                <p><span className="text-muted-foreground">Downloads:</span> {resource.metadata?.downloads || 0}</p>
              </div>
              <div className="mt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(resource.url, "_blank")}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleRemoveResource(resource.id, resource.url)}
          className="flex gap-1"
        >
          <Trash2 className="h-4 w-4 flex-shrink-0" />
          <span className="sm:hidden md:inline">Remover</span>
        </Button>
      </div>
    </div>
  );
};

export default ResourceItem;
