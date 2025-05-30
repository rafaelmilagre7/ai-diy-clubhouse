
import React from 'react';
import { OnboardingResetPanel } from '@/components/admin/onboarding/OnboardingResetPanel';

const AdminOnboardingReset: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reset de Onboarding</h1>
        <p className="text-muted-foreground">
          Ferramentas administrativas para resetar e gerenciar o sistema de onboarding.
        </p>
      </div>

      <OnboardingResetPanel />
    </div>
  );
};

export default AdminOnboardingReset;
