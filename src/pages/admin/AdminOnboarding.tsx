
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const AdminOnboarding = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Onboarding</h1>
        <p className="text-muted-foreground">
          Acompanhe e gerencie o processo de onboarding dos membros do VIVER DE IA Club.
        </p>
      </div>

      <Alert variant="default" className="bg-blue-50 border-blue-200">
        <InfoIcon className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-700">Dashboard em desenvolvimento</AlertTitle>
        <AlertDescription className="text-blue-600">
          O painel de gerenciamento de onboarding está sendo aprimorado. Em breve, você terá acesso a todos os recursos.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progresso de Onboarding</CardTitle>
            <CardDescription>
              Visão geral do progresso de onboarding dos membros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Dados sendo carregados...
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuários Pendentes</CardTitle>
            <CardDescription>
              Membros que ainda não completaram o onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Dados sendo carregados...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOnboarding;
