
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

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Gestão de Onboarding</AlertTitle>
        <AlertDescription>
          Visualize o progresso de onboarding dos usuários, identifique gargalos no processo e 
          acompanhe quais usuários estão com o onboarding pendente ou completo.
        </AlertDescription>
      </Alert>

      <OnboardingOverview />
    </div>
  );
};

export default AdminOnboarding;
