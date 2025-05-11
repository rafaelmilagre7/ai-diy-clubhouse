
import React, { useEffect } from 'react';
import { OnboardingAnalyticsDashboard } from '@/components/admin/onboarding/OnboardingAnalyticsDashboard';

const AdminOnboarding = () => {
  useEffect(() => {
    console.log("AdminOnboarding renderizado com novo dashboard de análises");
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Análise de Onboarding</h1>
        <p className="text-muted-foreground">
          Insights e análises do processo de onboarding dos membros do VIVER DE IA Club.
        </p>
      </div>

      <OnboardingAnalyticsDashboard />
    </div>
  );
};

export default AdminOnboarding;
