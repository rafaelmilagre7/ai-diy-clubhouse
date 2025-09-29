// Utilitário para importar dados do CSV de usuários adicionais
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CSVUser {
  nome: string;
  email: string;
  telefone?: string;
  dataEntrada?: string;
  categoria: string;
  acessoVinculadoA?: string;
}

export async function importUsersFromCSV() {
  try {
    toast.info('🚀 Iniciando importação completa dos dados CSV...');
    
    // Chamar a edge function para fazer a importação
    const { data, error } = await supabase.functions.invoke('import-csv-data', {
      method: 'POST'
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (data?.success) {
      toast.success(`✅ ${data.message}`);
      console.log('📊 Detalhes da importação:', data.details);
      return { success: true, updated: data.details.usersUpdated };
    } else {
      throw new Error(data?.error || 'Erro desconhecido na importação');
    }
    
  } catch (error: any) {
    console.error('Erro na importação:', error);
    toast.error(`Erro na importação: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Função para executar via console
(window as any).importUsersFromCSV = importUsersFromCSV;