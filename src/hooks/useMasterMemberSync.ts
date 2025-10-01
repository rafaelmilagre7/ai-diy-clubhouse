import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface SyncStats {
  masters_processed: number;
  members_processed: number;
  organizations_created: number;
  errors: number;
  warnings: number;
  masters_not_found: number;
  members_not_found: number;
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
  dryRun?: boolean;
  stats: SyncStats;
  logs: SyncLog[];
  totalLogs: number;
}

interface CSVValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    uniqueMasters: number;
    uniqueMembers: number;
    emptyRows: number;
  };
}

export const useMasterMemberSync = () => {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [validationResult, setValidationResult] = useState<CSVValidation | null>(null);

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
            const masterEmail = values[masterIndex] || '';
            const memberEmail = memberIndex !== -1 ? values[memberIndex] : '';
            
            // Se usuario_master vazio, usuario_adicional é o master
            if (!masterEmail && memberEmail) {
              return {
                usuario_master: memberEmail,
                usuario_adicional: ''
              };
            }
            
            return {
              usuario_master: masterEmail,
              usuario_adicional: memberEmail
            };
          }).filter(row => row.usuario_master); // Só filtra linhas completamente vazias

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  const validateCSV = async (file: File): Promise<CSVValidation> => {
    try {
      const csvData = await parseCSVFile(file);
      
      const errors: string[] = [];
      const warnings: string[] = [];
      
      if (csvData.length === 0) {
        errors.push('CSV não contém dados válidos');
      }

      const masters = new Set<string>();
      const members = new Set<string>();
      let emptyRows = 0;

      csvData.forEach((row, index) => {
        const masterEmail = row.usuario_master?.toLowerCase().trim();
        const memberEmail = row.usuario_adicional?.toLowerCase().trim();

        if (!masterEmail) {
          emptyRows++;
          return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(masterEmail)) {
          errors.push(`Linha ${index + 2}: Email master inválido: ${masterEmail}`);
        }

        masters.add(masterEmail);

        if (memberEmail) {
          if (!emailRegex.test(memberEmail)) {
            warnings.push(`Linha ${index + 2}: Email membro inválido: ${memberEmail}`);
          }
          members.add(memberEmail);
        }
      });

      if (masters.size === 0) {
        errors.push('Nenhum master válido encontrado');
      }

      if (masters.size < 10) {
        warnings.push(`Apenas ${masters.size} masters encontrados. Isso parece correto?`);
      }

      const validation: CSVValidation = {
        isValid: errors.length === 0,
        errors,
        warnings,
        stats: {
          totalRows: csvData.length,
          uniqueMasters: masters.size,
          uniqueMembers: members.size,
          emptyRows
        }
      };

      setValidationResult(validation);
      return validation;

    } catch (error: any) {
      const validation: CSVValidation = {
        isValid: false,
        errors: [error.message || 'Erro ao validar CSV'],
        warnings: [],
        stats: { totalRows: 0, uniqueMasters: 0, uniqueMembers: 0, emptyRows: 0 }
      };
      setValidationResult(validation);
      return validation;
    }
  };

  const syncFromCSV = async (file: File, dryRun: boolean = false) => {
    try {
      setSyncing(true);
      setProgress(0);
      setSyncResult(null);

      toast({
        title: dryRun ? "🧪 Simulação iniciada" : "📊 Iniciando sincronização",
        description: dryRun ? "Validando dados sem aplicar mudanças..." : "Processando arquivo CSV..."
      });

      // Parse CSV
      const csvData = await parseCSVFile(file);
      
      if (csvData.length === 0) {
        throw new Error('Nenhum dado válido encontrado no CSV');
      }

      setProgress(25);

      toast({
        title: "🔄 Processando...",
        description: `${csvData.length} registros encontrados. ${dryRun ? 'Simulando...' : 'Sincronizando...'}`
      });

      // Call edge function
      console.log('[FRONTEND] Chamando edge function com', csvData.length, 'registros');
      
      const { data, error } = await supabase.functions.invoke('sync-master-members-csv', {
        body: { csvData, dryRun }
      });

      console.log('[FRONTEND] Resposta da edge function:', { data, error });

      // ✅ Validação de erro melhorada
      if (error) {
        console.error('[FRONTEND] Erro da edge function:', error);
        throw new Error(error.message || 'Erro ao chamar edge function');
      }

      if (!data) {
        throw new Error('Edge function não retornou dados');
      }

      if (!data.success) {
        throw new Error(data.error || 'Sincronização falhou sem mensagem de erro');
      }

      setProgress(100);
      setSyncResult(data);

      if (dryRun) {
        toast({
          title: "✅ Simulação concluída!",
          description: `${data.stats.masters_processed} masters e ${data.stats.members_processed} membros seriam processados.`,
        });
      } else {
        toast({
          title: "✅ Sincronização concluída!",
          description: `${data.stats.masters_processed} masters e ${data.stats.members_processed} membros processados com sucesso.`,
        });
      }

      return data;
    } catch (error: any) {
      console.error('[FRONTEND] Erro na sincronização:', error);
      
      // ✅ Mensagem de erro mais informativa
      const errorMessage = error.message || error.toString() || 'Erro desconhecido';
      
      toast({
        title: "❌ Erro na sincronização",
        description: errorMessage,
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
    validationResult,
    validateCSV,
    syncFromCSV,
    getSyncHistory
  };
};
