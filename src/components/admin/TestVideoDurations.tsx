import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useVideoDurationUpdate } from '@/hooks/useVideoDurationUpdate';
import { RefreshCw, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { devLog } from '@/utils/devLogger';

interface TestResult {
  totalProcessed: number;
  success: number;
  failed: number;
  results?: Array<{
    success: boolean;
    videoId: string;
    error?: string;
  }>;
}

export const TestVideoDurations = () => {
  const [result, setResult] = useState<TestResult | null>(null);
  const { mutate: updateDurations, isPending } = useVideoDurationUpdate();

  const handleTest = () => {
    setResult(null);
    
    updateDurations(undefined, {
      onSuccess: (data) => {
        // Os dados já são tratados pelo hook
        devLog.success('Teste concluído:', data);
      },
      onError: (error) => {
        devLog.error('Erro no teste:', error);
      }
    });
  };

  return (
    <div className="p-lg border rounded-lg bg-card shadow-sm">
      <div className="flex items-center gap-sm mb-md">
        <div className="p-sm rounded-lg bg-operational/10">
          <Video className="h-5 w-5 text-operational" />
        </div>
        <h3 className="text-lg font-semibold">Teste das Durações</h3>
      </div>
      
      <div className="space-y-md">
        <p className="text-sm text-muted-foreground">
          Testa a atualização das durações dos vídeos via API do Panda Video.
        </p>
...
        {isPending && (
          <div className="p-sm bg-operational/10 rounded-lg">
            <div className="flex items-center gap-sm text-operational">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processando vídeos...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};