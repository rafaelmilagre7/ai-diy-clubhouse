
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

export const useFileDownload = () => {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();
  const { log, logError } = useLogging("useFileDownload");

  const handleDownload = async (url: string, filename: string) => {
    if (!url) return;
    
    try {
      setDownloading(true);
      log("Iniciando download", { url, filename });
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro ao fazer download: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Criar um link temporário para iniciar o download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Limpar o link temporário
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
      
      log("Download concluído", { filename });
      
      toast({
        title: "Download iniciado",
        description: `O arquivo ${filename} está sendo baixado.`
      });
    } catch (error) {
      logError("Erro ao fazer download", { error, url, filename });
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  return { downloading, handleDownload };
};
