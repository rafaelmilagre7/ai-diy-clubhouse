
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NetworkingHeader } from '@/components/networking/NetworkingHeader';
import { NetworkingFeed } from '@/components/networking/NetworkingFeed';
import { NetworkingBlockedState } from '@/components/networking/NetworkingBlockedState';
import { ProfileDataSync } from '@/components/networking/ProfileDataSync';
import { useNetworkingAccessGuard } from '@/hooks/networking/useNetworkingAccessGuard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building, Loader2 } from 'lucide-react';

const NetworkingPage = () => {
  const navigate = useNavigate();
  const { hasAccess, isLoading: accessLoading, needsOnboarding } = useNetworkingAccessGuard();

  const handleNavigateToOnboarding = () => {
    navigate('/onboarding-new');
  };

  // Se ainda está carregando verificação de acesso
  if (accessLoading) {
    return (
      <div className="p-6 space-y-6">
        <ProfileDataSync />
        <NetworkingHeader />
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-viverblue" />
          <p className="text-muted-foreground">Verificando acesso ao networking...</p>
        </Card>
      </div>
    );
  }

  // Se não tem acesso (onboarding incompleto)
  if (!hasAccess && needsOnboarding) {
    return (
      <div className="p-6 space-y-6">
        <ProfileDataSync />
        <NetworkingHeader />
        <NetworkingBlockedState onNavigateToOnboarding={handleNavigateToOnboarding} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ProfileDataSync />
      <NetworkingHeader />
      
      <Card className="p-6">
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Potenciais Clientes
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Potenciais Fornecedores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                5 matches mensais selecionados pela IA baseados no seu perfil de onboarding
              </p>
            </div>
            <NetworkingFeed matchType="customer" />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                3 matches mensais de fornecedores especializados baseados nas suas necessidades
              </p>
            </div>
            <NetworkingFeed matchType="supplier" />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default NetworkingPage;
