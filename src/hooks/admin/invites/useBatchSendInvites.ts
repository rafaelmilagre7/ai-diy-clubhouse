import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface BatchProgress {
  type: 'init' | 'batch_start' | 'batch_complete' | 'invite_processing' | 'invite_success' | 'invite_retry' | 'invite_failed' | 'complete' | 'error';
  [key: string]: any;
}

export interface BatchSendOptions {
  inviteIds: string[];
  maxRetries?: number;
  parallelBatch?: number;
  onProgress?: (progress: BatchProgress) => void;
}

export function useBatchSendInvites() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BatchProgress[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const batchSend = useCallback(async (options: BatchSendOptions) => {
    const { inviteIds, maxRetries = 3, parallelBatch = 5, onProgress } = options;

    try {
      setIsProcessing(true);
      setProgress([]);
      setSummary(null);

      console.log('🚀 [BATCH-SEND] Iniciando envio em lote de', inviteIds.length, 'convites');

      const { data, error } = await supabase.functions.invoke('batch-send-invites', {
        body: {
          inviteIds,
          maxRetries,
          parallelBatch
        }
      });

      if (error) throw error;

      // Processar stream de eventos
      const reader = data.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            setProgress(prev => [...prev, data]);
            
            if (onProgress) {
              onProgress(data);
            }

            // Log detalhado de cada evento
            switch (data.type) {
              case 'init':
                console.log(`📊 [BATCH] Iniciando processamento de ${data.total} convites`);
                toast.info(`Iniciando envio de ${data.total} convites...`);
                break;
              
              case 'batch_start':
                console.log(`📦 [BATCH] Lote ${data.batch}/${data.totalBatches} (${data.size} convites)`);
                break;
              
              case 'invite_processing':
                console.log(`⏳ [BATCH] Processando: ${data.email} (tentativa ${data.attempt}/${data.maxRetries})`);
                break;
              
              case 'invite_success':
                console.log(`✅ [BATCH] Sucesso: ${data.email}`);
                break;
              
              case 'invite_retry':
                console.log(`🔄 [BATCH] Retry: ${data.email} - ${data.error}`);
                toast.warning(`Reenvio: ${data.email} (tentativa ${data.attempt + 1})`);
                break;
              
              case 'invite_failed':
                console.error(`❌ [BATCH] Falhou: ${data.email} - ${data.error}`);
                toast.error(`Falha: ${data.email}`);
                break;
              
              case 'batch_complete':
                console.log(`✓ [BATCH] Lote ${data.batch} concluído (${data.processed}/${data.total})`);
                break;
              
              case 'complete':
                console.log('🎉 [BATCH] Processamento completo:', data);
                setSummary(data);
                toast.success(
                  `Concluído! ${data.successful} enviados, ${data.failed} falhas`,
                  { duration: 5000 }
                );
                break;
              
              case 'error':
                console.error('❌ [BATCH] Erro:', data.error);
                toast.error(`Erro no processamento: ${data.error}`);
                break;
            }
          }
        }
      }

    } catch (err: any) {
      console.error('❌ [BATCH-SEND] Erro geral:', err);
      toast.error(`Erro ao enviar convites: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearProgress = useCallback(() => {
    setProgress([]);
    setSummary(null);
  }, []);

  return {
    batchSend,
    isProcessing,
    progress,
    summary,
    clearProgress
  };
}
