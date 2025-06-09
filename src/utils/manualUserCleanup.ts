
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ManualCleanupResult {
  success: boolean;
  message: string;
  details: {
    tablesProcessed: string[];
    errors: any[];
    emailLiberated: boolean;
  };
}

export const manualCompleteUserCleanup = async (userEmail: string): Promise<ManualCleanupResult> => {
  console.log(`🧹 [MANUAL CLEANUP] Iniciando limpeza completa para: ${userEmail}`);
  
  const result: ManualCleanupResult = {
    success: false,
    message: '',
    details: {
      tablesProcessed: [],
      errors: [],
      emailLiberated: false
    }
  };

  try {
    // 1. Buscar se ainda existe perfil
    console.log('🔍 Verificando perfil existente...');
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('email', userEmail)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
    }

    if (existingProfile) {
      console.log(`👤 Perfil encontrado: ${existingProfile.id}`);
      
      // Usar a Edge Function para fazer a exclusão completa
      const { data: deleteResult, error: deleteError } = await supabase.functions.invoke('admin-delete-user', {
        body: { 
          userId: existingProfile.id,
          forceDelete: true,
          softDelete: false
        }
      });

      if (deleteError) {
        throw new Error(`Erro na Edge Function: ${deleteError.message}`);
      }

      if (!deleteResult?.success) {
        throw new Error(deleteResult?.error || 'Falha na exclusão via Edge Function');
      }

      result.details.tablesProcessed = deleteResult.details.tablesAffected || [];
      result.details.errors = deleteResult.details.errors || [];
      
      console.log('✅ Exclusão via Edge Function concluída');
    } else {
      console.log('ℹ️ Nenhum perfil encontrado, fazendo limpeza de convites');
    }

    // 2. Limpar convites pendentes (garantia extra)
    console.log('📧 Limpando convites pendentes...');
    const { error: inviteError } = await supabase
      .from('invites')
      .delete()
      .eq('email', userEmail);

    if (inviteError) {
      console.warn('⚠️ Erro ao limpar convites:', inviteError);
      result.details.errors.push({ table: 'invites', error: inviteError.message });
    } else {
      result.details.tablesProcessed.push('invites');
      console.log('✅ Convites limpos');
    }

    // 3. Verificação final - testar se email está liberado
    console.log('🔍 Verificação final...');
    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle();

    const { data: finalInvite } = await supabase
      .from('invites')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle();

    result.details.emailLiberated = !finalProfile && !finalInvite;

    if (result.details.emailLiberated) {
      result.success = true;
      result.message = `✅ Email ${userEmail} completamente liberado para novos convites`;
      console.log('🎉 Limpeza manual concluída com sucesso');
    } else {
      result.success = false;
      result.message = `⚠️ Email ${userEmail} ainda não foi completamente liberado`;
      console.warn('❌ Ainda existem registros:', { 
        profile: !!finalProfile, 
        invite: !!finalInvite 
      });
    }

    return result;

  } catch (error: any) {
    console.error('❌ Erro na limpeza manual:', error);
    result.success = false;
    result.message = `Erro na limpeza: ${error.message}`;
    result.details.errors.push({ operation: 'manual_cleanup', error: error.message });
    return result;
  }
};

// Função para uso via console do admin
export const adminManualCleanup = async (userEmail: string) => {
  const result = await manualCompleteUserCleanup(userEmail);
  
  if (result.success) {
    toast.success('✅ Limpeza manual concluída', {
      description: result.message,
      duration: 5000
    });
    console.log('✅ Resultado da limpeza:', result);
  } else {
    toast.error('❌ Erro na limpeza manual', {
      description: result.message,
      duration: 8000
    });
    console.error('❌ Falha na limpeza:', result);
  }
  
  return result;
};
