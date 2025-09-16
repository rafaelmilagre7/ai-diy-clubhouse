import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Executa atualização otimizada de durações de vídeos
 * Versão melhorada que substitui a função anterior
 */
export const executeVideoDurationUpdate = async (): Promise<boolean> => {
  try {
    console.log('🎯 Executando atualização otimizada de durações...');
    
    // Mostrar toast informativo
    toast.info('⚡ Verificando durações de vídeos...', {
      description: 'Processo otimizado em segundo plano'
    });

    // Chamar a edge function melhorada
    const { data, error } = await supabase.functions.invoke('calculate-course-durations', {
      body: { syncAll: true }
    });

    if (error) {
      console.error('❌ Erro na edge function:', error);
      
      // Não mostrar error toast agressivo, só log
      console.log('ℹ️ Sincronização será executada em segundo plano');
      return false;
    }

    if (data?.success) {
      console.log('✅ Atualização executada com sucesso:', data);
      
      // Toast discreto de sucesso
      if (data.globalStats?.totalVideosSynced > 0) {
        toast.success('✨ Durações atualizadas', {
          description: `${data.globalStats.totalVideosSynced} vídeos sincronizados`
        });
      }
      
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('❌ Erro na execução:', error);
    
    // Log apenas, sem mostrar erro para usuário (operação em background)
    console.log('ℹ️ Atualização será tentada novamente mais tarde');
    return false;
  }
};