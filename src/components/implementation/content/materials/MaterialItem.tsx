
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
    url?: string;
    size?: number;
    type?: string;
    format?: string;
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
    try {
      const splitUrl = url.split('/');
      let fileName = splitUrl[splitUrl.length - 1].split('?')[0];
      // Se o nome do arquivo for muito longo, usar apenas os 30 primeiros caracteres
      if (fileName.length > 30) {
        const extension = fileName.split('.').pop();
        fileName = fileName.substring(0, 30) + (extension ? '.' + extension : '');
      }
      return fileName;
    } catch (e) {
      console.error("Erro ao extrair nome do arquivo:", e);
      return 'arquivo';
    }
  };

  // Determinar qual URL usar (compatibilidade com diferentes formatos)
  const fileUrl = material.file_url || material.url;
  const externalUrl = material.external_url;
  
  console.log("Material render:", { material, fileUrl, externalUrl });
  
  // Se não tiver nenhuma URL, não renderiza
  if (!fileUrl && !externalUrl) {
    console.warn("Material sem URL:", material);
    return null;
  }
  
  const materialFormat = material.format || "Documento";
  const materialType = material.type || "document";

  // Retorna o tipo de link (externo ou download)
  const renderActionButton = () => {
    if (externalUrl) {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => window.open(externalUrl, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Acessar
        </Button>
      );
    } else if (fileUrl) {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => {
            console.log("Iniciando download:", fileUrl);
            handleDownload(fileUrl || '', getFileName(fileUrl));
          }}
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
          <div className="flex items-center gap-2">
            {materialFormat && (
              <span className="text-xs text-muted-foreground">{materialFormat}</span>
            )}
            {material.size && (
              <span className="text-xs text-muted-foreground">{formatFileSize(material.size)}</span>
            )}
          </div>
        </div>
      </div>
      {renderActionButton()}
    </div>
  );
};

export default MaterialItem;
