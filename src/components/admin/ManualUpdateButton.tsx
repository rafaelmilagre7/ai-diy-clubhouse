import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { showModernError, showModernSuccess, showModernInfo } from '@/lib/toast-helpers';
import { devLog } from '@/utils/devLogger';

export const ManualUpdateButton = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    try {
      showModernInfo('Iniciando atualização', 'Atualizando durações dos vídeos...');
      
      const { data, error } = await supabase.functions.invoke('update-video-durations', {
        body: {}
      });
      
      if (error) {
        console.error('Erro na edge function:', error);
        showModernError('Erro na atualização', error.message);
        return;
      }
      
      if (data.success > 0) {
        showModernSuccess('Atualização concluída!', `${data.success} vídeo(s) atualizados`);
        
        // Recarregar após 3 segundos
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        showModernInfo('Nenhuma atualização', 'Todos os vídeos já estão atualizados');
      }
      
    } catch (error: any) {
      console.error('Erro crítico:', error);
      showModernError('Erro crítico', error.message);
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