
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const usePostOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  // Verificar se tem trilha gerada (opcional)
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
      
      return hasTrail;
    } catch (error) {
      console.log('ℹ️ Trilha ainda não existe:', error);
      return false;
    }
  }, [user?.id]);

  return {
    goToImplementationTrail,
    goToDashboard,
    checkTrailStatus
  };
};
