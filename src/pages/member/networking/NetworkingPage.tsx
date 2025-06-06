
import React, { Suspense } from 'react';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building, Loader2 } from 'lucide-react';

// Lazy load dos componentes de networking para melhor performance
const NetworkingHeader = React.lazy(() => 
  import('@/components/networking/NetworkingHeader').then(module => ({
    default: module.NetworkingHeader
  }))
);

const NetworkingFeed = React.lazy(() => 
  import('@/components/networking/NetworkingFeed').then(module => ({
    default: module.NetworkingFeed
  }))
);

// Componente de loading personalizado
const NetworkingLoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
    <span className="ml-3 text-gray-600">Carregando networking...</span>
  </div>
);

const NetworkingPage = () => {
  return (
    <SmartFeatureGuard feature="networking">
      <div className="p-6 space-y-6">
        <Suspense fallback={<NetworkingLoadingFallback />}>
          <NetworkingHeader />
        </Suspense>
        
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
                  5 matches mensais selecionados pela IA baseados no seu perfil empresarial
                </p>
              </div>
              <Suspense fallback={<NetworkingLoadingFallback />}>
                <NetworkingFeed matchType="customer" />
              </Suspense>
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  3 matches mensais de fornecedores especializados baseados nas suas necessidades
                </p>
              </div>
              <Suspense fallback={<NetworkingLoadingFallback />}>
                <NetworkingFeed matchType="supplier" />
              </Suspense>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </SmartFeatureGuard>
  );
};

export default NetworkingPage;
