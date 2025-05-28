
import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const usePostOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [hasCompletedTrail, setHasCompletedTrail] = useState(false);

  // Verificar se é o primeiro acesso ao dashboard
  useEffect(() => {
    if (user?.id) {
      const firstAccessKey = `first_dashboard_access_${user.id}`;
      const hasAccessed = localStorage.getItem(firstAccessKey);
      setIsFirstAccess(!hasAccessed);
    }
  }, [user?.id]);

  // Navegar para trilha de implementação
  const goToImplementationTrail = useCallback(() => {
    console.log('🚀 Navegando para trilha de implementação');
    navigate('/implementation-trail');
  }, [navigate]);

  // Navegar para dashboard
  const goToDashboard = useCallback(() => {
    console.log('🏠 Navegando para dashboard');
    navigate('/dashboard');
  }, [navigate]);

  // Marcar primeiro acesso ao dashboard como concluído
  const markFirstDashboardAccess = useCallback(() => {
    if (user?.id) {
      const firstAccessKey = `first_dashboard_access_${user.id}`;
      localStorage.setItem(firstAccessKey, 'true');
      setIsFirstAccess(false);
    }
  }, [user?.id]);

  // Iniciar tour de boas-vindas (placeholder para futura implementação)
  const startWelcomeTour = useCallback(() => {
    console.log('🎯 Iniciando tour de boas-vindas');
    // TODO: Implementar tour guiado
    goToDashboard();
  }, [goToDashboard]);

  // Verificar se tem trilha gerada
  const checkTrailStatus = useCallback(async () => {
    if (!user?.id) return false;

    try {
      console.log('🔍 Verificando status da trilha para usuário:', user.id);
      
      const { data } = await supabase
        .from('implementation_trails')
        .select('trail_data')
        .eq('user_id', user.id)
        .single();

      const hasTrail = !!data?.trail_data;
      console.log('📊 Status da trilha:', hasTrail ? 'presente' : 'ausente');
      
      setHasCompletedTrail(hasTrail);
      return hasTrail;
    } catch (error) {
      console.log('ℹ️ Trilha ainda não existe:', error);
      setHasCompletedTrail(false);
      return false;
    }
  }, [user?.id]);

  return {
    isFirstAccess,
    hasCompletedTrail,
    goToImplementationTrail,
    goToDashboard,
    markFirstDashboardAccess,
    startWelcomeTour,
    checkTrailStatus
  };
};
