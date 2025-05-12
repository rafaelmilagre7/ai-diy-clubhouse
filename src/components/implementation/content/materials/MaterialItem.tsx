
import React from "react";
import { Download, FileText, FileImage, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Material {
  id: string;
  name: string;
  filename?: string;
  url?: string;
  format?: string;
  description?: string;
}

interface MaterialItemProps {
  material: Material;
  onDownload: (material: Material) => void;
}

export const MaterialItem = ({ material, onDownload }: MaterialItemProps) => {
  const getFileIcon = () => {
    const fileType = material.format?.toLowerCase() || material.filename?.split('.').pop()?.toLowerCase();
    
    if (fileType?.match(/pdf|doc|docx|txt|md/)) {
      return <FileText className="h-5 w-5" />;
    } else if (fileType?.match(/png|jpg|jpeg|gif|svg|webp/)) {
      return <FileImage className="h-5 w-5" />;
    } else {
      return <FileArchive className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="bg-[#1A1E2E] border border-white/10 rounded-lg p-4 flex items-start space-x-4">
      <div className="bg-viverblue/20 text-viverblue p-2 rounded-md">
        {getFileIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-medium mb-1 text-neutral-100">
          {material.name}
        </h4>
        
        {material.description && (
          <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{material.description}</p>
        )}
        
        {material.format && (
          <p className="text-xs text-neutral-500 uppercase">{material.format}</p>
        )}
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-transparent border-viverblue/20 text-viverblue hover:bg-viverblue/10"
        onClick={() => onDownload(material)}
      >
        <Download className="h-4 w-4 mr-2" />
        Baixar
      </Button>
    </div>
  );
};
