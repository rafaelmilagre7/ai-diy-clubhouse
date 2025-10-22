import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { manualCompleteUserCleanup, type ManualCleanupResult } from './manualUserCleanup';

export interface TechnicalCleanupResult extends ManualCleanupResult {
  newInviteId?: string;
  newInviteToken?: string;
  inviteLink?: string;
}

export const executeTechnicalCleanup = async (userEmail: string): Promise<TechnicalCleanupResult> => {
  try {
    // Fase 1: Limpeza completa usando a função existente
    const cleanupResult = await manualCompleteUserCleanup(userEmail);
    
    if (!cleanupResult.success) {
      throw new Error(`Falha na limpeza: ${cleanupResult.message}`);
    }
    
    // Fase 2: Aguardar propagação (pequena pausa para garantir consistência)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fase 3: Criar novo convite limpo
    // Buscar role membro_club
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'membro_club')
      .single();
      
    if (roleError || !roleData) {
      throw new Error('Role membro_club não encontrado');
    }
    
    // Criar novo convite usando RPC
    const { data: inviteResult, error: inviteError } = await supabase.rpc('create_invite_hybrid', {
      p_email: userEmail,
      p_role_id: roleData.id,
      p_phone: null,
      p_expires_in: '7 days',
      p_notes: 'Convite recriado após limpeza técnica completa - email estava contaminado',
      p_channel_preference: 'email'
    });
    
    if (inviteError) {
      throw new Error(`Erro ao criar novo convite: ${inviteError.message}`);
    }
    
    if (!inviteResult?.success) {
      throw new Error('Falha ao criar novo convite');
    }
    
    // Gerar link do convite
    const inviteLink = `${window.location.origin}/convite/${inviteResult.token}`;
    
    const result: TechnicalCleanupResult = {
      ...cleanupResult,
      newInviteId: inviteResult.invite_id,
      newInviteToken: inviteResult.token,
      inviteLink: inviteLink,
      message: `✅ Limpeza técnica completa realizada com sucesso! Novo convite criado.`
    };
    
    return result;
    
  } catch (error: any) {
    console.error('❌ Erro na limpeza técnica:', error);
    return {
      success: false,
      message: `Erro na limpeza técnica: ${error.message}`,
      details: {
        tablesProcessed: [],
        errors: [{ operation: 'technical_cleanup', error: error.message }],
        emailLiberated: false
      }
    };
  }
};

// Função para uso direto via console do admin
export const adminTechnicalCleanup = async (userEmail: string) => {
  const result = await executeTechnicalCleanup(userEmail);
  
  if (result.success) {
    toast.success('✅ Limpeza técnica concluída!', {
      description: result.message,
      duration: 8000
    });
  } else {
    toast.error('❌ Erro na limpeza técnica', {
      description: result.message,
      duration: 10000
    });
    console.error('❌ Falha na limpeza técnica:', result);
  }
  
  return result;
};

// Função para verificar se email está limpo
export const verifyEmailStatus = async (userEmail: string) => {
  try {
    const [profileCheck, inviteCheck] = await Promise.all([
      supabase.from('profiles').select('id, name').eq('email', userEmail).maybeSingle(),
      supabase.from('invites').select('id, status').eq('email', userEmail).maybeSingle()
    ]);
    
    const status = {
      email: userEmail,
      hasProfile: !!profileCheck.data,
      hasActiveInvite: !!inviteCheck.data,
      profileData: profileCheck.data,
      inviteData: inviteCheck.data,
      isClean: !profileCheck.data && !inviteCheck.data,
      timestamp: new Date().toISOString()
    };
    
    return status;
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    return null;
  }
};