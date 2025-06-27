
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useAnalyticsReset = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetProgress, setResetProgress] = useState(0);

  const resetAnalyticsData = async () => {
    setIsResetting(true);
    setResetProgress(0);

    try {
      console.log('Iniciando reset dos dados de analytics...');
      
      setResetProgress(25);
      
      // Tentar usar RPC com cast para any
      try {
        const { data, error } = await (supabase as any).rpc('reset_analytics_data_enhanced');
        
        setResetProgress(75);
        
        if (error) {
          throw error;
        }
        
        // Type guard para verificar se o resultado tem as propriedades esperadas
        const isValidResult = (result: any): result is { success: boolean; message: string; backupRecords?: number } => {
          return result && typeof result === 'object' && 'success' in result;
        };
        
        if (isValidResult(data) && data.success) {
          setResetProgress(100);
          toast.success(data.message || 'Dados resetados com sucesso!');
          
          if (data.backupRecords) {
            console.log(`Backup criado com ${data.backupRecords} registros`);
          }
        } else {
          throw new Error(isValidResult(data) ? data.message : 'Erro desconhecido no reset');
        }
      } catch (rpcError) {
        console.warn('RPC reset não disponível, usando método alternativo:', rpcError);
        
        // Método alternativo - limpar tabelas diretamente
        setResetProgress(50);
        
        const { error: deleteError } = await supabase
          .from('analytics' as any)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Manter um registro dummy
        
        if (deleteError) {
          throw deleteError;
        }
        
        setResetProgress(100);
        toast.success('Dados de analytics resetados com sucesso!');
      }
      
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
      toast.error(`Erro ao resetar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsResetting(false);
      setTimeout(() => setResetProgress(0), 2000);
    }
  };

  return {
    resetAnalyticsData,
    isResetting,
    resetProgress
  };
};
