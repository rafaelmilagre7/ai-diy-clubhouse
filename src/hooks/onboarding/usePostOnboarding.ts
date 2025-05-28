
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePostOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [hasCompletedTrail, setHasCompletedTrail] = useState(false);

  // Verificar se é o primeiro acesso após onboarding
  useEffect(() => {
    const checkFirstAccess = async () => {
      if (!user?.id) return;

      try {
        const { data: onboardingData } = await supabase
          .from('quick_onboarding')
          .select('completed_at, first_dashboard_access')
          .eq('user_id', user.id)
          .single();

        if (onboardingData?.completed_at && !onboardingData?.first_dashboard_access) {
          setIsFirstAccess(true);
        }
      } catch (error) {
        console.error('Erro ao verificar primeiro acesso:', error);
      }
    };

    checkFirstAccess();
  }, [user?.id]);

  // Marcar primeiro acesso ao dashboard
  const markFirstDashboardAccess = useCallback(async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from('quick_onboarding')
        .update({ 
          first_dashboard_access: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      setIsFirstAccess(false);
    } catch (error) {
      console.error('Erro ao marcar primeiro acesso:', error);
    }
  }, [user?.id]);

  // Verificar se tem trilha gerada
  const checkTrailStatus = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data: trailData } = await supabase
        .from('implementation_trails')
        .select('status, trail_data')
        .eq('user_id', user.id)
        .single();

      setHasCompletedTrail(!!trailData?.trail_data);
    } catch (error) {
      console.log('Nenhuma trilha encontrada ainda');
      setHasCompletedTrail(false);
    }
  }, [user?.id]);

  // Navegar para trilha de implementação (corrigido)
  const goToImplementationTrail = useCallback(() => {
    // Navegar diretamente sem verificações complexas
    navigate('/implementation-trail');
  }, [navigate]);

  // Navegar para dashboard
  const goToDashboard = useCallback(() => {
    if (isFirstAccess) {
      markFirstDashboardAccess();
    }
    navigate('/dashboard');
  }, [navigate, isFirstAccess, markFirstDashboardAccess]);

  // Iniciar tour de boas-vindas
  const startWelcomeTour = useCallback(() => {
    toast.success('Bem-vindo! Vamos fazer um tour rápido pelas funcionalidades principais.', {
      duration: 5000
    });
    goToDashboard();
  }, [goToDashboard]);

  return {
    isFirstAccess,
    hasCompletedTrail,
    goToImplementationTrail,
    goToDashboard,
    startWelcomeTour,
    checkTrailStatus,
    markFirstDashboardAccess
  };
};
