import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { devLog } from '@/utils/devLogger';

export const ManualUpdateButton = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    try {
      devLog.component('Iniciando atualização manual das durações...');
      toast.info('Iniciando atualização das durações dos vídeos...');
      
      const { data, error } = await supabase.functions.invoke('update-video-durations', {
        body: {}
      });
      
      if (error) {
        devLog.error('Erro na edge function:', error);
        toast.error('Erro na atualização: ' + error.message);
        return;
      }
      
      devLog.success('Resposta da edge function:', data);
      
      if (data.success > 0) {
        toast.success(`${data.success} vídeo(s) atualizados com sucesso!`);
        devLog.success('Atualização concluída! Recarregando em 3 segundos...');
        
        // Recarregar após 3 segundos
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        toast.info('Nenhum vídeo precisou ser atualizado');
      }
      
    } catch (error: any) {
      devLog.error('Erro crítico:', error);
      toast.error('Erro crítico na atualização: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={handleManualUpdate}
        disabled={isUpdating}
        size="lg"
        className="shadow-lg"
      >
        {isUpdating ? '⏳ Atualizando...' : '🔄 Atualizar Durações'}
      </Button>
    </div>
  );
};