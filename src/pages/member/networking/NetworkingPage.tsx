
import React from 'react';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';
import { NetworkingHeader } from '@/components/networking/NetworkingHeader';
import { NetworkingFeed } from '@/components/networking/NetworkingFeed';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building } from 'lucide-react';

const NetworkingPage = () => {
  return (
    <SmartFeatureGuard feature="networking">
      <div className="p-6 space-y-6">
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
    </SmartFeatureGuard>
  );
};

export default NetworkingPage;
