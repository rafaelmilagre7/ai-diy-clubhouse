
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useInviteDetails } from './useInviteDetails';
import { useInviteFlow } from './useInviteFlow';
import { toast } from 'sonner';

interface InviteJourneyState {
  phase: 'detecting' | 'registering' | 'accepting' | 'onboarding' | 'complete';
  inviteToken?: string;
  userEmail?: string;
  roleName?: string;
  isLoading: boolean;
  error?: string;
}

export const useInviteJourney = (token?: string) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { inviteDetails, loading: detailsLoading } = useInviteDetails(token);
  const { acceptInvite, isProcessing } = useInviteFlow();

  const [journeyState, setJourneyState] = useState<InviteJourneyState>({
    phase: 'detecting',
    inviteToken: token,
    isLoading: detailsLoading
  });

  const startJourney = useCallback(async () => {
    if (!token || !inviteDetails) return;

    console.log('🚀 [INVITE-JOURNEY] Iniciando jornada com token:', token.substring(0, 8) + '...');

    setJourneyState(prev => ({
      ...prev,
      phase: 'detecting',
      userEmail: inviteDetails.email,
      roleName: inviteDetails.role.name,
      isLoading: true
    }));

    try {
      // Se usuário já está logado, aceitar convite diretamente
      if (user?.id) {
        console.log('👤 [INVITE-JOURNEY] Usuário logado - aceitando convite');
        
        setJourneyState(prev => ({ ...prev, phase: 'accepting' }));
        
        const result = await acceptInvite(token);
        
        if (result.success) {
          toast.success('Convite aceito com sucesso!');
          setJourneyState(prev => ({ ...prev, phase: 'complete', isLoading: false }));
          
          // Verificar se precisa de onboarding
          const needsOnboarding = user && !user.user_metadata?.onboarding_completed;
          
          if (needsOnboarding) {
            console.log('📋 [INVITE-JOURNEY] Redirecionando para onboarding');
            navigate(`/onboarding?token=${token}`);
          } else {
            console.log('✅ [INVITE-JOURNEY] Redirecionando para dashboard');
            navigate('/dashboard');
          }
        } else {
          setJourneyState(prev => ({ 
            ...prev, 
            phase: 'detecting', 
            isLoading: false,
            error: result.message 
          }));
          toast.error(result.message);
        }
      } else {
        // Usuário não logado - redirecionar para registro
        console.log('🔐 [INVITE-JOURNEY] Usuário não logado - redirecionando para registro');
        setJourneyState(prev => ({ ...prev, phase: 'registering' }));
        navigate(`/register?token=${token}&email=${encodeURIComponent(inviteDetails.email)}`);
      }
    } catch (error: any) {
      console.error('❌ [INVITE-JOURNEY] Erro na jornada:', error);
      setJourneyState(prev => ({ 
        ...prev, 
        phase: 'detecting', 
        isLoading: false,
        error: error.message 
      }));
      toast.error('Erro ao processar convite');
    }
  }, [token, inviteDetails, user, acceptInvite, navigate]);

  const getJourneyProgress = useCallback(() => {
    const phases = ['detecting', 'registering', 'accepting', 'onboarding', 'complete'];
    const currentIndex = phases.indexOf(journeyState.phase);
    return {
      current: currentIndex + 1,
      total: phases.length,
      percentage: ((currentIndex + 1) / phases.length) * 100
    };
  }, [journeyState.phase]);

  return {
    journeyState: {
      ...journeyState,
      isLoading: journeyState.isLoading || detailsLoading || isProcessing
    },
    inviteDetails,
    startJourney,
    getJourneyProgress
  };
};
