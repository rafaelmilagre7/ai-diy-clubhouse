import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';

/**
 * Função global para testar sincronização de durações via console
 */
export const testVideoDurationSync = async () => {
  try {
    console.log('🎯 [SYNC] Iniciando sincronização de durações...');
    toast.info('Iniciando sincronização das durações dos vídeos...');
    
    const { data, error } = await supabase.functions.invoke('update-video-durations', {
      body: {}
    });
    
    if (error) {
      console.error('❌ [SYNC] Erro na edge function:', error);
      toast.error(`Erro na sincronização: ${error.message}`);
      return false;
    }
    
    console.log('📊 [SYNC] Resultado da sincronização:', data);
    
    if (data.totalProcessed === 0) {
      console.log('ℹ️ [SYNC] Nenhum vídeo encontrado para processamento');
      toast.info('Nenhum vídeo encontrado para sincronização');
      return false;
    }
    
    if (data.success > 0) {
      console.log(`✅ [SYNC] ${data.success} vídeo(s) sincronizados com sucesso!`);
      toast.success(`${data.success} vídeos sincronizados com sucesso!`);
      
      if (data.failed > 0) {
        console.warn(`⚠️ [SYNC] ${data.failed} vídeo(s) falharam na sincronização`);
        toast.warning(`${data.failed} vídeos falharam na sincronização`);
      }
      
      // Aguardar um pouco antes de verificar os resultados
      setTimeout(async () => {
        await checkSyncResults();
      }, 2000);
      
      return true;
    }
    
    return false;
    
  } catch (error: any) {
    console.error("💥 [SYNC] Erro crítico:", error);
    toast.error(`Erro crítico: ${error.message}`);
    return false;
  }
};

/**
 * Verifica os resultados da sincronização
 */
const checkSyncResults = async () => {
  try {
    console.log('🔍 [CHECK] Verificando resultados da sincronização...');
    
    const { data, error } = await supabase
      .from('learning_lesson_videos')
      .select(`
        id,
        title,
        duration_seconds,
        lesson:learning_lessons(
          title,
          module:learning_modules(
            course:learning_courses(title)
          )
        )
      `)
      .not('duration_seconds', 'is', null)
      .gt('duration_seconds', 0)
      .limit(10);
    
    if (error) {
      console.error('❌ [CHECK] Erro ao verificar resultados:', error);
      return;
    }
    
    console.log('📈 [CHECK] Vídeos com durações sincronizadas:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('✅ [CHECK] Exemplos de vídeos sincronizados:', data.slice(0, 3));
      toast.success(`${data.length} vídeos têm durações sincronizadas!`);
      
      // Informar que os certificados serão atualizados
      setTimeout(() => {
        toast.info('Certificados serão atualizados com as novas durações...');
      }, 1000);
      
    } else {
      console.log('⚠️ [CHECK] Nenhum vídeo com duração encontrado ainda');
      toast.warning('Ainda processando durações. Aguarde mais alguns segundos...');
    }
    
  } catch (error) {
    console.error('💥 [CHECK] Erro ao verificar resultados:', error);
  }
};

// Disponibilizar globalmente para uso no console
(window as any).testVideoDurationSync = testVideoDurationSync;

console.log('🔧 [SETUP] Função testVideoDurationSync() disponível no console');
console.log('💡 [HELP] Execute: testVideoDurationSync() para sincronizar durações');