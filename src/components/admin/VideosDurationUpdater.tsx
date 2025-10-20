import React from 'react';
import { Button } from '@/components/ui/button';
import { useUpdateVideoDurations } from '@/hooks/useUpdateVideoDurations';
import { updateAllVideoDurations } from '@/triggers/updateVideoDurations';

export const VideosDurationUpdater = () => {
  const { mutate: updateDurations, isPending } = useUpdateVideoDurations();

  const handleUpdate = async () => {
    // Executar atualização direta
    await updateAllVideoDurations();
    
    // Também usar o hook para invalidar caches
    updateDurations();
  };

  return (
    <div className="p-md border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Atualizar Durações dos Vídeos</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Executa a atualização das durações de todos os vídeos no sistema.
      </p>
      <Button 
        onClick={handleUpdate}
        disabled={isPending}
        variant="outline"
      >
        {isPending ? 'Atualizando...' : 'Executar Atualização'}
      </Button>
    </div>
  );
};