import { supabase } from "@/lib/supabase";

/**
 * Executa imediatamente a atualização das durações dos vídeos
 */
export const executeVideoDurationUpdate = async () => {
  try {
    console.log('🔄 Executando atualização imediata das durações dos vídeos...');
    
    const { data, error } = await supabase.functions.invoke('update-video-durations', {
      body: {}
    });
    
    if (error) {
      console.error('❌ Erro na edge function:', error);
      throw error;
    }
    
    console.log('✅ Resposta da edge function:', data);
    
    if (data.totalProcessed === 0) {
      console.log('ℹ️ Nenhum vídeo encontrado para atualização');
      return false;
    }
    
    if (data.success > 0) {
      console.log(`✅ ${data.success} vídeo(s) atualizados com sucesso!`);
      
      if (data.failed > 0) {
        console.log(`⚠️ Não foi possível atualizar ${data.failed} vídeo(s)`);
      }
      
      return true;
    }
    
    return false;
    
  } catch (error: any) {
    console.error("❌ Erro ao executar atualização de durações:", error);
    return false;
  }
};

// Executar automaticamente quando o arquivo for carregado
console.log('🎯 Iniciando atualização automática das durações dos vídeos...');

executeVideoDurationUpdate()
  .then((success) => {
    if (success) {
      console.log('🎉 Atualização de durações executada com sucesso!');
      // Recarregar a página após 2 segundos para refletir as mudanças
      setTimeout(() => {
        console.log('🔄 Recarregando página para refletir durações atualizadas...');
        window.location.reload();
      }, 2000);
    } else {
      console.log('❌ Falha na atualização de durações');
    }
  })
  .catch((error) => {
    console.error('💥 Erro crítico na atualização:', error);
  });