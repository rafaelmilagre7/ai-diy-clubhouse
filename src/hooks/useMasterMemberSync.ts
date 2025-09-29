import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface SyncStats {
  masters_processed: number;
  members_processed: number;
  organizations_created: number;
  errors: number;
}

interface SyncLog {
  master_email: string;
  member_email?: string;
  operation: string;
  status: string;
  message?: string;
}

interface SyncResult {
  success: boolean;
  stats: SyncStats;
  logs: SyncLog[];
}

export const useMasterMemberSync = () => {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const parseCSVFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            reject(new Error('CSV vazio'));
            return;
          }

          // Parse header
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const masterIndex = headers.findIndex(h => h.includes('usuario_master') || h.includes('master'));
          const memberIndex = headers.findIndex(h => h.includes('usuario_adicional') || h.includes('adicional'));

          if (masterIndex === -1) {
            reject(new Error('Coluna usuario_master não encontrada no CSV'));
            return;
          }

          // Parse rows
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            return {
              usuario_master: values[masterIndex] || '',
              usuario_adicional: memberIndex !== -1 ? values[memberIndex] : ''
            };
          }).filter(row => row.usuario_master);

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  const syncFromCSV = async (file: File) => {
    try {
      setSyncing(true);
      setProgress(0);
      setSyncResult(null);

      toast({
        title: "📊 Iniciando sincronização",
        description: "Processando arquivo CSV..."
      });

      // Parse CSV
      const csvData = await parseCSVFile(file);
      
      if (csvData.length === 0) {
        throw new Error('Nenhum dado válido encontrado no CSV');
      }

      setProgress(25);

      toast({
        title: "🔄 Sincronizando...",
        description: `Processando ${csvData.length} registros...`
      });

      // Call edge function
      const { data, error } = await supabase.functions.invoke('sync-master-members-csv', {
        body: { csvData }
      });

      if (error) throw error;

      setProgress(100);
      setSyncResult(data);

      toast({
        title: "✅ Sincronização concluída!",
        description: `${data.stats.masters_processed} masters e ${data.stats.members_processed} membros processados.`,
      });

      return data;
    } catch (error: any) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "❌ Erro na sincronização",
        description: error.message || 'Erro desconhecido',
        variant: "destructive"
      });
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const getSyncHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('master_member_sync_log')
        .select('*')
        .order('synced_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  };

  return {
    syncing,
    progress,
    syncResult,
    syncFromCSV,
    getSyncHistory
  };
};