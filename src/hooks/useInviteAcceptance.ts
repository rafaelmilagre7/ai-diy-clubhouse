
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

interface AcceptInviteParams {
  token: string;
  onboardingData: any;
}

export const useInviteAcceptance = () => {
  const [isAccepting, setIsAccepting] = useState(false);
  const navigate = useNavigate();

  const acceptInviteAndCompleteOnboarding = async ({ token, onboardingData }: AcceptInviteParams) => {
    const startTime = Date.now();
    setIsAccepting(true);

    try {
      logger.info('[INVITE-ACCEPTANCE] 🎯 Iniciando aceitação CORRIGIDA de convite:', {
        token: token.substring(0, 8) + '***',
        hasData: !!onboardingData,
        dataFields: Object.keys(onboardingData || {}),
        timestamp: new Date().toISOString()
      });

      // 1. PRIMEIRO: Verificar se o convite ainda é válido antes de aceitar
      logger.info('[INVITE-ACCEPTANCE] 🔍 Verificação pré-aceitação...');
      const { data: preCheckData, error: preCheckError } = await supabase
        .from('invites')
        .select(`
          id,
          token,
          email,
          role_id,
          used_at,
          expires_at
        `)
        .eq('token', token)
        .maybeSingle();

      if (preCheckError) {
        throw new Error(`Erro na verificação do convite: ${preCheckError.message}`);
      }

      if (!preCheckData) {
        throw new Error('Convite não encontrado');
      }

      if (preCheckData.used_at) {
        throw new Error('Convite já foi utilizado');
      }

      const now = new Date();
      const expiresAt = new Date(preCheckData.expires_at);
      if (now > expiresAt) {
        throw new Error('Convite expirado');
      }

      logger.info('[INVITE-ACCEPTANCE] ✅ Pré-verificação aprovada:', {
        inviteId: preCheckData.id,
        email: preCheckData.email,
        roleId: preCheckData.role_id
      });

      // 2. Aceitar o convite via RPC
      logger.info('[INVITE-ACCEPTANCE] 📋 Executando RPC accept_invite...');
      const { data: acceptResult, error: acceptError } = await supabase.rpc('accept_invite', {
        p_token: token
      });

      if (acceptError) {
        logger.error('[INVITE-ACCEPTANCE] ❌ Erro no RPC accept_invite:', acceptError);
        throw new Error(`Erro ao aceitar convite: ${acceptError.message}`);
      }

      if (!acceptResult?.success) {
        logger.error('[INVITE-ACCEPTANCE] ❌ RPC retornou falha:', acceptResult);
        throw new Error(acceptResult?.message || 'Falha ao aceitar convite');
      }

      logger.info('[INVITE-ACCEPTANCE] ✅ Convite aceito com sucesso:', {
        requiresOnboarding: acceptResult.requires_onboarding,
        duration: `${Date.now() - startTime}ms`
      });

      // 3. Atualizar dados do perfil com informações do onboarding
      logger.info('[INVITE-ACCEPTANCE] 📝 Atualizando perfil com dados do onboarding...');
      
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const profileUpdateData = {
        name: onboardingData.name || '',
        phone: onboardingData.phone || '',
        company: onboardingData.company || '',
        position: onboardingData.position || '',
        experience_level: onboardingData.experienceLevel || 'iniciante',
        main_objective: onboardingData.mainObjective || '',
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      };

      logger.info('[INVITE-ACCEPTANCE] 📊 Dados do perfil a serem atualizados:', {
        userId: currentUser.data.user.id.substring(0, 8) + '***',
        fields: Object.keys(profileUpdateData),
        hasName: !!profileUpdateData.name,
        hasPhone: !!profileUpdateData.phone
      });

      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', currentUser.data.user.id);

      if (updateError) {
        logger.error('[INVITE-ACCEPTANCE] ❌ Erro ao atualizar perfil:', updateError);
        throw new Error(`Erro ao salvar dados: ${updateError.message}`);
      }

      logger.info('[INVITE-ACCEPTANCE] 💾 Perfil atualizado com sucesso');

      // 4. Verificar se o convite foi realmente marcado como usado
      logger.info('[INVITE-ACCEPTANCE] 🔍 Verificação pós-aceitação...');
      const { data: postCheckData } = await supabase
        .from('invites')
        .select('used_at')
        .eq('token', token)
        .single();

      logger.info('[INVITE-ACCEPTANCE] 📋 Status final do convite:', {
        used_at: postCheckData?.used_at,
        wasMarkedAsUsed: !!postCheckData?.used_at
      });

      // 5. Limpar token e cache
      InviteTokenManager.clearTokenOnSuccess();
      
      // 6. Mostrar sucesso e redirecionar
      const totalDuration = Date.now() - startTime;
      logger.info('[INVITE-ACCEPTANCE] 🎉 Processo completo COM SUCESSO:', {
        totalDuration: `${totalDuration}ms`,
        redirecting: true,
        finalCheck: {
          conviteUsado: !!postCheckData?.used_at,
          perfilAtualizado: true
        }
      });

      toast.success('Bem-vindo(a) ao Viver de IA! Seu onboarding foi concluído com sucesso.');
      
      // Aguardar um pouco para o toast aparecer, então redirecionar
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);

      return { success: true };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('[INVITE-ACCEPTANCE] 💥 Erro DETALHADO no processo:', {
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`,
        token: token.substring(0, 8) + '***'
      });
      
      toast.error(`Erro ao finalizar: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsAccepting(false);
    }
  };

  return {
    acceptInviteAndCompleteOnboarding,
    isAccepting
  };
};
