
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UserToRemove {
  id: string;
  email: string;
}

export const completeUserRemovalFromAuth = async (users: UserToRemove[]) => {
  const results = [];
  
  for (const user of users) {
    try {
      console.log(`🗑️ Removendo ${user.email} do Supabase Auth...`);
      
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { 
          userId: user.id,
          forceDelete: true,
          softDelete: false // Hard delete para remoção completa
        }
      });

      if (error) {
        console.error(`❌ Erro ao remover ${user.email} do Auth:`, error);
        results.push({
          email: user.email,
          success: false,
          error: error.message
        });
      } else if (data?.success) {
        console.log(`✅ ${user.email} removido do Auth com sucesso`);
        results.push({
          email: user.email,
          success: true,
          message: data.message
        });
      } else {
        console.error(`❌ Falha ao remover ${user.email}:`, data);
        results.push({
          email: user.email,
          success: false,
          error: data?.error || 'Erro desconhecido'
        });
      }
    } catch (err: any) {
      console.error(`❌ Erro crítico ao processar ${user.email}:`, err);
      results.push({
        email: user.email,
        success: false,
        error: err.message
      });
    }
  }
  
  return results;
};

// Função para executar a remoção completa dos usuários específicos
export const removeSpecificUsers = async () => {
  const usersToRemove: UserToRemove[] = [
    {
      id: '6988ee11-15ad-4bd7-9c55-010bac4d39a5',
      email: 'rafaelkinojo@gmail.com'
    },
    {
      id: '44fa5d72-9b44-48df-8ee8-1639d30e72d3', 
      email: 'rafaelmilagre@hotmail.com'
    }
  ];

  console.log('🚀 Iniciando remoção completa dos usuários específicos...');
  
  const results = await completeUserRemovalFromAuth(usersToRemove);
  
  // Exibir resultados
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    toast.success('✅ Remoção do Auth concluída', {
      description: `${successful.length} usuário(s) removido(s) do sistema de autenticação: ${successful.map(s => s.email).join(', ')}`
    });
  }
  
  if (failed.length > 0) {
    toast.warning('⚠️ Alguns usuários não foram removidos do Auth', {
      description: `${failed.length} erro(s): ${failed.map(f => `${f.email} - ${f.error}`).join('; ')}`
    });
  }
  
  if (successful.length === usersToRemove.length) {
    toast.success('🎉 Remoção completa finalizada!', {
      description: 'Todos os usuários foram removidos completamente do sistema. Os emails estão agora disponíveis para novos cadastros.'
    });
  }
  
  console.log('📊 Resultados da remoção:', results);
  return results;
};
