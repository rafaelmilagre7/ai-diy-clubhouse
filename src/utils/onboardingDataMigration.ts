
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const migrateUserOnboardingData = async (userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`[Migration] Iniciando migração de dados para usuário: ${userId}`);
    
    // Buscar dados atuais
    const { data: currentProgress, error: fetchError } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !currentProgress) {
      return { success: false, message: 'Usuário não encontrado ou sem dados de progresso' };
    }
    
    let needsUpdate = false;
    const updateData: any = {};
    
    // Verificar e corrigir estrutura de AI Experience
    if (currentProgress.ai_experience && 
        currentProgress.ai_experience.ai_experience && 
        typeof currentProgress.ai_experience.ai_experience === 'object') {
      
      console.log('[Migration] Estrutura aninhada detectada em ai_experience, normalizando...');
      
      updateData.ai_experience = {
        ...currentProgress.ai_experience.ai_experience,
        onboarding_type: currentProgress.ai_experience.onboarding_type || 'club'
      };
      
      needsUpdate = true;
    }
    
    // Verificar completed_steps
    const requiredSteps = [
      'personal_info',
      'professional_info',
      'business_context',
      'ai_experience', 
      'business_goals',
      'experience_personalization',
      'complementary_info',
      'review'
    ];
    
    const currentSteps = currentProgress.completed_steps || [];
    const hasAllSteps = requiredSteps.every(step => currentSteps.includes(step));
    
    // Verificar se todos os dados necessários estão presentes
    const hasPersonalInfo = currentProgress.personal_info?.name && currentProgress.personal_info?.email;
    const hasProfessionalInfo = currentProgress.professional_info?.company_name;
    const hasBusinessGoals = currentProgress.business_goals?.primary_goal;
    
    let aiExperience = updateData.ai_experience || currentProgress.ai_experience;
    if (aiExperience?.ai_experience) {
      aiExperience = aiExperience.ai_experience;
    }
    const hasAIExperience = aiExperience?.knowledge_level;
    
    console.log('[Migration] Verificação de dados:', {
      hasPersonalInfo,
      hasProfessionalInfo, 
      hasBusinessGoals,
      hasAIExperience,
      hasAllSteps
    });
    
    // Se todos os dados estão presentes mas não está marcado como completo
    if (hasPersonalInfo && hasProfessionalInfo && hasBusinessGoals && hasAIExperience && !currentProgress.is_completed) {
      updateData.is_completed = true;
      updateData.completed_steps = requiredSteps;
      updateData.current_step = 'completed';
      needsUpdate = true;
      console.log('[Migration] Marcando onboarding como completo');
    }
    
    // Aplicar atualizações se necessário
    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('onboarding_progress')
        .update(updateData)
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('[Migration] Erro ao atualizar dados:', updateError);
        return { success: false, message: 'Erro ao atualizar dados no banco' };
      }
      
      console.log('[Migration] Dados migrados com sucesso:', updateData);
      return { success: true, message: 'Dados migrados e normalizados com sucesso' };
    }
    
    return { success: true, message: 'Dados já estão na estrutura correta' };
    
  } catch (error) {
    console.error('[Migration] Erro durante migração:', error);
    return { success: false, message: 'Erro interno durante migração' };
  }
};

// Função para admins executarem migração via console
export const adminMigrateUserData = async (userEmail: string) => {
  try {
    // Buscar usuário pelo email
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (profileError || !userProfile) {
      toast.error('Usuário não encontrado');
      return false;
    }
    
    const result = await migrateUserOnboardingData(userProfile.id);
    
    if (result.success) {
      toast.success(`Migração concluída: ${result.message}`);
    } else {
      toast.error(`Erro na migração: ${result.message}`);
    }
    
    return result.success;
  } catch (error) {
    console.error('Erro na migração via admin:', error);
    toast.error('Erro interno na migração');
    return false;
  }
};
