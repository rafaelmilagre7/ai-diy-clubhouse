
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, FileArchive, FileImage, Link } from "lucide-react";
import { cn } from "@/lib/utils";

interface Material {
  id: string;
  name: string;
  url: string;
  type: string;
  format: string;
  size?: number;
}

interface MaterialItemProps {
  material: Material;
  onDownload: (url: string, filename: string) => void;
}

export const MaterialItem: React.FC<MaterialItemProps> = ({ material, onDownload }) => {
  // Helper para determinar o ícone correto com base no tipo de material
  const getIcon = () => {
    const type = material.type.toLowerCase();
    const url = material.url.toLowerCase();
    
    if (url.startsWith('http') && !url.includes('storage.googleapis.com') && !url.includes('supabase')) {
      return <Link className="h-5 w-5 text-blue-500" />;
    }
    
    if (type.includes('image') || url.match(/\.(jpeg|jpg|gif|png|svg|webp)$/)) {
      return <FileImage className="h-5 w-5 text-purple-500" />;
    }
    
    if (type.includes('zip') || type.includes('archive') || url.match(/\.(zip|rar|7z|tar|gz)$/)) {
      return <FileArchive className="h-5 w-5 text-amber-500" />;
    }
    
    return <FileText className="h-5 w-5 text-blue-500" />;
  };
  
  // Formata o tamanho do arquivo de maneira legível
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Determina se é um link externo
  const isExternalLink = material.url.startsWith('http') && 
    !material.url.includes('storage.googleapis.com') && 
    !material.url.includes('supabase');
  
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-md",
      "border bg-white hover:bg-slate-50 transition-colors"
    )}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <div>
          <h4 className="font-medium text-sm line-clamp-1">{material.name}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{material.format}</span>
            {material.size ? (
              <>
                <span className="text-slate-300">•</span>
                <span>{formatSize(material.size)}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => {
          if (isExternalLink) {
            window.open(material.url, '_blank');
          } else {
            onDownload(material.url, material.name);
          }
        }}
      >
        {isExternalLink ? 'Acessar' : (
          <>
            <Download className="h-4 w-4 mr-1" />
            Baixar
          </>
        )}
      </Button>
    </div>
  );
};
