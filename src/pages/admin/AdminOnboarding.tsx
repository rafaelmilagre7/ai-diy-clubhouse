import React from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { OnboardingOverview } from '@/components/admin/onboarding/OnboardingOverview';

const AdminOnboarding = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Onboarding</h1>
        <p className="text-muted-foreground">
          Acompanhe e gerencie o processo de onboarding dos membros do VIVER DE IA Club.
        </p>
      </div>

      <OnboardingOverview />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cards adicionais podem ser implementados aqui */}
      </div>
    </div>
  );
};

export default AdminOnboarding;
