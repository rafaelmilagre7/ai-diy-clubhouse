import { supabase } from '@/integrations/supabase/client';

/**
 * Função auxiliar para testar a sincronização de durações dos vídeos
 * Pode ser executada no console do navegador ou em testes
 */
export const testVideoDurationSync = async () => {
  try {
    console.log('🔧 TESTE: Iniciando sincronização de durações dos vídeos...');
    
    const { data, error } = await supabase.functions.invoke('update-video-durations', {
      body: {}
    });
    
    if (error) {
      console.error('❌ TESTE: Erro na função:', error);
      return { success: false, error };
    }
    
    console.log('✅ TESTE: Resposta da função:', data);
    
    return { 
      success: true, 
      data,
      summary: `${data.success} sucessos, ${data.failed} falhas, ${data.totalProcessed} processados`
    };
    
  } catch (error) {
    console.error('💥 TESTE: Erro geral:', error);
    return { success: false, error };
  }
};

/**
 * Função para testar apenas alguns vídeos de uma aula específica
 */
export const testSpecificLesson = async (lessonId: string) => {
  try {
    console.log(`🔧 TESTE: Sincronizando vídeos da aula ${lessonId}...`);
    
    const { data, error } = await supabase.functions.invoke('update-video-durations', {
      body: { lessonId }
    });
    
    if (error) {
      console.error('❌ TESTE: Erro na função:', error);
      return { success: false, error };
    }
    
    console.log('✅ TESTE: Resposta da função:', data);
    
    return { 
      success: true, 
      data,
      summary: `Aula ${lessonId}: ${data.success} sucessos, ${data.failed} falhas`
    };
    
  } catch (error) {
    console.error('💥 TESTE: Erro geral:', error);
    return { success: false, error };
  }
};

// Expor no window para uso no console (apenas em desenvolvimento)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).testVideoDurationSync = testVideoDurationSync;
  (window as any).testSpecificLesson = testSpecificLesson;
  console.log('🔧 Funções de teste disponíveis no console:');
  console.log('- testVideoDurationSync()');
  console.log('- testSpecificLesson(lessonId)');
}