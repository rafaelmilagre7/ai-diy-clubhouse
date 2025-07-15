import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para enriquecimento de dados do usuário
 * Garante que todos os dados do onboarding sejam sincronizados com o perfil
 */
export const useDataEnrichment = () => {
  
  const enrichProfileData = useCallback(async (userId: string, onboardingData: any) => {
    try {
      console.log('🔄 [DATA-ENRICHMENT] Iniciando enriquecimento de dados para:', userId);
      
      const profileUpdates: any = {};
      
      // Mapear dados pessoais
      if (onboardingData.personal_info?.name) {
        profileUpdates.name = onboardingData.personal_info.name;
      }
      
      if (onboardingData.personal_info?.email) {
        profileUpdates.email = onboardingData.personal_info.email;
      }
      
      if (onboardingData.personal_info?.phone) {
        profileUpdates.phone = onboardingData.personal_info.phone;
      }
      
      if (onboardingData.personal_info?.instagram) {
        profileUpdates.instagram = onboardingData.personal_info.instagram;
      }
      
      if (onboardingData.personal_info?.linkedin) {
        profileUpdates.linkedin = onboardingData.personal_info.linkedin;
      }
      
      if (onboardingData.personal_info?.profilePicture) {
        profileUpdates.avatar_url = onboardingData.personal_info.profilePicture;
      }
      
      // Mapear dados empresariais
      if (onboardingData.business_info?.companyName || onboardingData.business_info?.company_name) {
        profileUpdates.company_name = onboardingData.business_info.companyName || onboardingData.business_info.company_name;
      }
      
      if (onboardingData.business_info?.businessSector || onboardingData.business_info?.business_sector) {
        profileUpdates.industry = onboardingData.business_info.businessSector || onboardingData.business_info.business_sector;
      }
      
      if (onboardingData.business_info?.position) {
        profileUpdates.position = onboardingData.business_info.position;
      }
      
      // Mapear dados de localização
      if (onboardingData.personal_info?.state) {
        profileUpdates.state = onboardingData.personal_info.state;
      }
      
      if (onboardingData.personal_info?.city) {
        profileUpdates.city = onboardingData.personal_info.city;
      }
      
      if (onboardingData.personal_info?.country) {
        profileUpdates.country = onboardingData.personal_info.country;
      }
      
      // Marcar onboarding como completo
      profileUpdates.onboarding_completed = true;
      profileUpdates.onboarding_completed_at = new Date().toISOString();
      profileUpdates.updated_at = new Date().toISOString();
      
      console.log('📝 [DATA-ENRICHMENT] Atualizações do perfil:', profileUpdates);
      
      // Atualizar perfil no banco
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);
      
      if (error) {
        console.error('❌ [DATA-ENRICHMENT] Erro ao atualizar perfil:', error);
        throw error;
      }
      
      console.log('✅ [DATA-ENRICHMENT] Perfil enriquecido com sucesso');
      
      // Registrar telemetria do enriquecimento
      await supabase.from('analytics').insert({
        user_id: userId,
        event_type: 'profile_enrichment_completed',
        event_data: {
          fields_updated: Object.keys(profileUpdates),
          timestamp: new Date().toISOString()
        }
      });
      
      return { success: true, updatedFields: Object.keys(profileUpdates) };
      
    } catch (error) {
      console.error('❌ [DATA-ENRICHMENT] Erro no enriquecimento:', error);
      return { success: false, error };
    }
  }, []);
  
  const validateDataCompleteness = useCallback((onboardingData: any) => {
    const requiredFields = {
      'personal_info.name': onboardingData.personal_info?.name,
      'personal_info.email': onboardingData.personal_info?.email,
      'business_info.position': onboardingData.business_info?.position,
      'business_info.businessSector': onboardingData.business_info?.businessSector,
      'ai_experience.ai_knowledge_level': onboardingData.ai_experience?.ai_knowledge_level,
      'goals_info.main_objective': onboardingData.goals_info?.main_objective
    };
    
    const missing = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
    
    const completeness = ((Object.keys(requiredFields).length - missing.length) / Object.keys(requiredFields).length) * 100;
    
    console.log('📊 [DATA-ENRICHMENT] Completude dos dados:', {
      completeness: Math.round(completeness),
      missing_fields: missing,
      total_fields: Object.keys(requiredFields).length
    });
    
    return {
      isComplete: missing.length === 0,
      completeness: Math.round(completeness),
      missingFields: missing
    };
  }, []);
  
  return {
    enrichProfileData,
    validateDataCompleteness
  };
};