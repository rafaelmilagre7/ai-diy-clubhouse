
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const usePostOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFirstAccess, setIsFirstAccess] = useState(false);

  // Verificar se é o primeiro acesso ao carregar o hook
  useEffect(() => {
    const checkFirstAccess = async () => {
      if (!user?.id) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('last_active')
          .eq('id', user.id)
          .single();

        // Se não tem last_active ou é muito recente, é primeiro acesso
        if (!profile?.last_active) {
          setIsFirstAccess(true);
        }
      } catch (error) {
        console.error('Erro ao verificar primeiro acesso:', error);
      }
    };

    checkFirstAccess();
  }, [user?.id]);

  const goToImplementationTrail = useCallback(() => {
    console.log('🎯 Navegando para trilha de implementação');
    navigate('/implementation-trail');
  }, [navigate]);

  const goToDashboard = useCallback(() => {
    console.log('🏠 Navegando para dashboard');
    navigate('/dashboard');
  }, [navigate]);

  const markFirstDashboardAccess = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Marcar que o usuário acessou o dashboard pela primeira vez
      const { error } = await supabase
        .from('profiles')
        .update({
          last_active: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao marcar primeiro acesso:', error);
      } else {
        console.log('✅ Primeiro acesso ao dashboard marcado');
        setIsFirstAccess(false); // Não é mais primeiro acesso
      }
    } catch (error) {
      console.error('Erro ao marcar primeiro acesso:', error);
    }
  }, [user?.id]);

  const triggerTrailGeneration = useCallback(async () => {
    if (!user?.id) return false;

    try {
      console.log('🤖 Tentando gerar trilha de implementação...');
      
      // Verificar se o usuário tem dados de onboarding
      const { data: onboardingData } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .single();

      if (!onboardingData) {
        console.log('❌ Onboarding não encontrado ou incompleto');
        return false;
      }

      // Chamar edge function para gerar trilha
      const { data, error } = await supabase.functions.invoke('generate-implementation-trail', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('❌ Erro ao gerar trilha:', error);
        return false;
      }

      console.log('✅ Trilha gerada com sucesso');
      toast.success('Trilha personalizada gerada com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao gerar trilha:', error);
      return false;
    }
  }, [user?.id]);

  return {
    isFirstAccess,
    goToImplementationTrail,
    goToDashboard,
    markFirstDashboardAccess,
    triggerTrailGeneration
  };
};
