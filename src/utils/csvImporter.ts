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
    // Ler o arquivo CSV
    const response = await fetch('/src/data/usuarios_adicionais.csv');
    const csvText = await response.text();
    
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Encontrar índices das colunas importantes
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('nome'));
    const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
    const masterIndex = headers.findIndex(h => h.toLowerCase().includes('acesso vinculado a'));
    
    const usersToUpdate: Array<{email: string, master_email: string | null}> = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      const email = values[emailIndex]?.trim();
      const masterEmail = values[masterIndex]?.trim();
      
      if (email && masterEmail && masterEmail !== email) {
        usersToUpdate.push({
          email: email,
          master_email: masterEmail
        });
      }
    }
    
    console.log(`📤 Preparando para atualizar ${usersToUpdate.length} usuários com master_email`);
    
    // Atualizar usuários em lotes
    let updated = 0;
    for (const user of usersToUpdate) {
      const { error } = await supabase
        .from('profiles')
        .update({ master_email: user.master_email })
        .eq('email', user.email);
      
      if (!error) {
        updated++;
      } else {
        console.warn(`Erro ao atualizar ${user.email}:`, error.message);
      }
    }
    
    toast.success(`✅ Importação concluída! ${updated} usuários atualizados com master_email.`);
    return { success: true, updated };
    
  } catch (error: any) {
    console.error('Erro na importação:', error);
    toast.error(`Erro na importação: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Função para executar via console
(window as any).importUsersFromCSV = importUsersFromCSV;