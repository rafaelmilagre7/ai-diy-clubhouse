
import React from "react";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileDownload } from "@/hooks/implementation/useFileDownload";

interface MaterialItemProps {
  material: {
    id: string;
    name: string;
    file_url?: string;
    external_url?: string;
    size?: number;
    type?: string;
  };
  onDownload?: (url: string, filename: string) => Promise<void>;
}

export const MaterialItem = ({ material, onDownload }: MaterialItemProps) => {
  const { downloading, handleDownload: defaultHandleDownload } = useFileDownload();
  
  // Usa a função onDownload fornecida ou a função padrão do hook
  const handleDownload = onDownload || defaultHandleDownload;

  // Função para formatar o tamanho do arquivo para exibição
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Função para gerar nome do arquivo para download
  const getFileName = (url?: string) => {
    if (!url) return 'arquivo';
    const splitUrl = url.split('/');
    return splitUrl[splitUrl.length - 1].split('?')[0];
  };

  // Retorna o tipo de link (externo ou download)
  const renderActionButton = () => {
    if (material.external_url) {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => window.open(material.external_url, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Acessar
        </Button>
      );
    } else if (material.file_url) {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => handleDownload(material.file_url || '', getFileName(material.file_url))}
          disabled={downloading}
        >
          <Download className="h-4 w-4" />
          Baixar
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-[#0ABAB5]" />
        <div>
          <p className="font-medium">{material.name}</p>
          {material.size && (
            <p className="text-xs text-muted-foreground">{formatFileSize(material.size)}</p>
          )}
        </div>
      </div>
      {renderActionButton()}
    </div>
  );
};

export default MaterialItem;
