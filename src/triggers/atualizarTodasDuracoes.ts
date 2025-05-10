
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Executa uma atualização única de todas as durações de vídeos
 * Esta função pode ser chamada uma vez para atualizar todos os vídeos existentes
 */
export const atualizarTodasDuracoes = async (): Promise<boolean> => {
  try {
    toast.info("Iniciando atualização de durações de vídeos...");
    
    // Chamada à edge function sem parâmetros para processar todos os vídeos
    const { data, error } = await supabase.functions.invoke('update-video-durations', {
      body: { }
    });
    
    if (error) {
      throw error;
    }
    
    if (data.totalProcessed === 0) {
      toast.info("Nenhum vídeo encontrado para atualização");
      return true;
    }
    
    toast.success(`Atualização concluída: ${data.success} vídeo(s) atualizado(s) com sucesso!`);
    
    if (data.failed > 0) {
      toast.warning(`Não foi possível atualizar ${data.failed} vídeo(s)`);
    }
    
    return true;
  } catch (error: any) {
    console.error("Erro ao executar atualização completa de durações:", error);
    toast.error("Falha ao atualizar durações: " + (error.message || "Erro desconhecido"));
    return false;
  }
};

// Exportar outras funções úteis relacionadas a atualizações de metadados de vídeo
