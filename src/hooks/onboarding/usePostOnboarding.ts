
import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const usePostOnboarding = () => {
  const navigate = useNavigate();
  const [isFirstAccess, setIsFirstAccess] = useState(false);

  // Verificar se é o primeiro acesso ao dashboard
  useEffect(() => {
    const firstAccess = localStorage.getItem('dashboard_first_access');
    if (!firstAccess) {
      setIsFirstAccess(true);
    }
  }, []);

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

  const goToNetworking = useCallback(() => {
    console.log('🤝 Redirecionando para networking');
    toast.success('Redirecionando para o networking!');
    navigate('/networking');
  }, [navigate]);

  const goToCommunity = useCallback(() => {
    console.log('👥 Redirecionando para comunidade');
    toast.success('Redirecionando para a comunidade!');
    navigate('/comunidade');
  }, [navigate]);

  const markFirstDashboardAccess = useCallback(() => {
    console.log('✅ Marcando primeiro acesso ao dashboard como concluído');
    localStorage.setItem('dashboard_first_access', 'true');
    setIsFirstAccess(false);
  }, []);

  const checkTrailStatus = useCallback(async () => {
    console.log('✅ Verificando status da trilha de implementação');
    // Aqui poderia haver uma verificação real do status da trilha
    // Por enquanto, apenas log para debug
  }, []);

  return {
    goToImplementationTrail,
    goToDashboard,
    goToNetworking,
    goToCommunity,
    checkTrailStatus,
    isFirstAccess,
    markFirstDashboardAccess
  };
};
