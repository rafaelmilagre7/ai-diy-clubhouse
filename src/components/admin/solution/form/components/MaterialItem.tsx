
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2 } from "lucide-react";
import { Resource } from "../types/ResourceTypes";
import { formatFileSize } from "../utils/resourceUtils";
import { getFileIcon } from "../utils/iconUtils";

interface MaterialItemProps {
  material: Resource;
  onRemove: (id: string) => Promise<void>;
}

const MaterialItem: React.FC<MaterialItemProps> = ({ material, onRemove }) => {
  const handleRemove = async () => {
    if (material.id) {
      await onRemove(material.id);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-md bg-card hover:bg-accent/50 transition-colors gap-3">
      <div className="flex items-start gap-3">
        {getFileIcon(material.type)}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{material.metadata.title || material.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{material.metadata.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 bg-muted text-foreground rounded text-xs capitalize">
              {material.type}
            </span>
            
            {(material.format || material.metadata.format) && (
              <span className="px-2 py-0.5 bg-muted text-foreground rounded text-xs">
                {material.format || material.metadata.format}
              </span>
            )}
            
            {(material.size || material.metadata.size) && (
              <span className="px-2 py-0.5 bg-muted text-foreground rounded text-xs">
                {formatFileSize(material.size || material.metadata.size || 0)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(material.url, "_blank")}
          className="flex gap-1"
        >
          <Upload className="h-4 w-4 flex-shrink-0" />
          <span className="sm:hidden md:inline">Baixar</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRemove}
          className="flex gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 flex-shrink-0" />
          <span className="sm:hidden md:inline">Remover</span>
        </Button>
      </div>
    </div>
  );
};

export default MaterialItem;
