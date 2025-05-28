
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const usePostOnboarding = () => {
  const navigate = useNavigate();

  const goToImplementationTrail = useCallback(() => {
    console.log('🎯 Redirecionando para trilha de implementação');
    toast.success('Redirecionando para sua trilha personalizada!');
    navigate('/implementation-trail');
  }, [navigate]);

  const goToDashboard = useCallback(() => {
    console.log('📊 Redirecionando para dashboard');
    toast.success('Redirecionando para o dashboard!');
    navigate('/dashboard');
  }, [navigate]);

  const checkTrailStatus = useCallback(async () => {
    console.log('✅ Verificando status da trilha de implementação');
    // Aqui poderia haver uma verificação real do status da trilha
    // Por enquanto, apenas log para debug
  }, []);

  return {
    goToImplementationTrail,
    goToDashboard,
    checkTrailStatus
  };
};
