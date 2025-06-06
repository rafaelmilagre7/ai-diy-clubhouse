
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImplementationTrail } from '@/types/implementation-trail';

export const usePremiumTrailExperience = () => {
  const { user } = useAuth();
  const [enhancing, setEnhancing] = useState(false);

  const enhanceTrailWithAI = useCallback(async (trail: ImplementationTrail) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      setEnhancing(true);
      console.log('🤖 Iniciando aprimoramento da trilha com IA...');

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Buscar dados de implementação
      const { data: implementationData } = await supabase
        .from('implementation_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Combinar dados do perfil
      const userProfile = {
        company_name: implementationData?.company_name || profile?.company_name,
        company_sector: implementationData?.company_sector || profile?.industry,
        company_size: implementationData?.company_size,
        ai_knowledge_level: implementationData?.ai_knowledge_level,
        primary_goal: implementationData?.primary_goal,
        ...profile
      };

      console.log('📊 Enviando trilha para aprimoramento:', { user_id: user.id, userProfile });

      // Chamar edge function para aprimorar trilha
      const { data, error } = await supabase.functions.invoke('enhance-trail-with-ai', {
        body: {
          user_id: user.id,
          trail_data: trail,
          user_profile: userProfile
        }
      });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw new Error(`Erro ao aprimorar trilha: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Falha ao aprimorar trilha');
      }

      console.log('✅ Trilha aprimorada com sucesso!');
      toast.success('Trilha personalizada com IA!');
      
      return data.enhanced_trail;

    } catch (error) {
      console.error('❌ Erro ao aprimorar trilha:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao personalizar trilha com IA';
      toast.error(errorMessage);
      return null;
    } finally {
      setEnhancing(false);
    }
  }, [user?.id]);

  return {
    enhanceTrailWithAI,
    enhancing
  };
};
