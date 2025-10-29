
import { useState } from "react";
import { useToastModern } from "@/hooks/useToastModern";
import { useLogging } from "@/hooks/useLogging";
import { Material } from "./useMaterialsData";

export const useFileDownload = () => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const { showSuccess, showError } = useToastModern();
  const { log, logError } = useLogging();

  const handleDownload = async (material: Material) => {
    if (!material.url) {
      showError("Erro ao baixar arquivo", "URL do arquivo não disponível.");
      return;
    }

    try {
      setDownloading(material.id);
      log("Starting file download", { 
        material_id: material.id, 
        material_name: material.name 
      });

      // Para vídeos embutidos do YouTube, abrir em uma nova aba
      if (material.type === 'video' && (material.url.includes('youtube.com') || material.url.includes('youtu.be'))) {
        window.open(material.url, '_blank');
        showSuccess("Vídeo aberto", `O vídeo "${material.name}" foi aberto em uma nova aba.`);
        return;
      }

      // Usa a API fetch para obter o arquivo
      const response = await fetch(material.url);
      
      if (!response.ok) {
        throw new Error(`Erro ao baixar: ${response.statusText}`);
      }
      
      // Converte para blob
      const blob = await response.blob();
      
      // Cria um URL para o blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Cria um elemento <a> para download
      const link = document.createElement("a");
      link.href = blobUrl;
      
      // Extrai o nome do arquivo da URL, ou usa o título
      const fileName = material.name || 
                      material.url.split("/").pop() || 
                      `arquivo-${material.id}`;
                      
      link.download = fileName;
      
      // Anexa e clica no link para iniciar o download
      document.body.appendChild(link);
      link.click();
      
      // Limpa
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      log("File download completed", { material_id: material.id });
      
      showSuccess("Download iniciado", `O arquivo "${material.name}" está sendo baixado.`);
    } catch (error) {
      logError("Error downloading file", error);
      showError("Erro ao baixar arquivo", "Ocorreu um erro ao tentar baixar o arquivo. Tente novamente.");
    } finally {
      setDownloading(null);
    }
  };

  return {
    handleDownload,
    downloading
  };
};
