
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOnboardingWizard } from '../hooks/useOnboardingWizard';
import { useCleanOnboardingData } from '../hooks/useCleanOnboardingData';
import { useInviteCleanup } from '@/hooks/useInviteCleanup';
import { useEffect } from 'react';

interface OnboardingWizardContainerProps {
  children: (props: ReturnType<typeof useOnboardingWizard> & {
    data: any;
    memberType: 'club' | 'formacao';
    isLoading: boolean;
  }) => React.ReactNode;
}

export const OnboardingWizardContainer = ({ children }: OnboardingWizardContainerProps) => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  const { cleanupForInvite } = useInviteCleanup();
  
  const {
    data: cleanData,
    updateData,
    initializeCleanData
  } = useCleanOnboardingData(inviteToken || undefined);

  // Executar limpeza e inicialização quando há convite
  useEffect(() => {
    const setupForInvite = async () => {
      if (inviteToken) {
        console.log('[WIZARD-CONTAINER] Detectado convite, executando limpeza');
        await cleanupForInvite(inviteToken);
        initializeCleanData();
      } else {
        initializeCleanData();
      }
    };

    setupForInvite();
  }, [inviteToken, cleanupForInvite, initializeCleanData]);

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: updateData
  });

  const memberType = cleanData.memberType || 'club';
  const isLoading = Object.keys(cleanData).length <= 1;

  return (
    <>
      {children({
        ...wizardProps,
        data: cleanData,
        memberType,
        isLoading
      })}
    </>
  );
};
