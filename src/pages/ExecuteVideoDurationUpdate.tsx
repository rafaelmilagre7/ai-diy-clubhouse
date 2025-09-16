import React, { useEffect } from 'react';
import { executeVideoDurationUpdate } from '@/utils/executeVideoDurationUpdate';

export const ExecuteVideoDurationUpdate = () => {
  useEffect(() => {
    // Executar a atualização assim que a página carregar
    executeVideoDurationUpdate();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Executando Atualização das Durações dos Vídeos</h1>
      <p className="text-muted-foreground">
        A atualização está sendo executada... Verifique o console para acompanhar o progresso.
      </p>
    </div>
  );
};