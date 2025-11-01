import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, Brain, Search, ArrowRight } from 'lucide-react';
import { MyConnectionsGrid } from './MyConnectionsGrid';
import { PendingRequestsList } from './PendingRequestsList';
import { DiscoverPeopleGrid } from './DiscoverPeopleGrid';
import { Badge } from '@/components/ui/badge';
import { useNetworkingStats } from '@/hooks/useNetworkingStats';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const ConnectionsHub = () => {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<string>(urlTab || 'connections');
  const { data: stats } = useNetworkingStats();

  // Atualizar tab quando URL mudar
  useEffect(() => {
    if (urlTab) setActiveTab(urlTab);
  }, [urlTab]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tabs Simples e Limpas */}
        <TabsList className="w-full grid grid-cols-4 bg-muted/30 p-1 rounded-lg">
          <TabsTrigger 
            value="connections" 
            className="relative data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            Conexões
            {stats.connections > 0 && (
              <Badge variant="secondary" className="ml-2 bg-aurora/10 text-aurora text-xs px-1.5 py-0">
                {stats.connections}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger 
            value="pending" 
            className="relative data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            Pendentes
            {stats.notifications > 0 && (
              <Badge variant="secondary" className="ml-2 bg-operational/10 text-operational text-xs px-1.5 py-0">
                {stats.notifications}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger 
            value="discover"
            className="relative data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Search className="w-4 h-4 mr-2" />
            Descobrir
          </TabsTrigger>

          <TabsTrigger 
            value="ai"
            className="relative data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Brain className="w-4 h-4 mr-2" />
            IA
            {stats.matches > 0 && (
              <Badge variant="secondary" className="ml-2 bg-aurora-primary/10 text-aurora-primary text-xs px-1.5 py-0">
                {stats.matches}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="connections" className="mt-6 space-y-6">
          <MyConnectionsGrid />
        </TabsContent>

        <TabsContent value="pending" className="mt-6 space-y-6">
          <PendingRequestsList />
        </TabsContent>

        <TabsContent value="discover" className="mt-6 space-y-6">
          <DiscoverPeopleGrid />
        </TabsContent>

        <TabsContent value="ai" className="mt-6 space-y-6">
          {/* Seção IA Simplificada */}
          <div className="flex flex-col items-center justify-center py-16 space-y-8">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-aurora/10 via-aurora-primary/10 to-operational/5 border border-aurora/20">
              <Brain className="w-10 h-10 text-aurora" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Networking Inteligente
              </h2>
              <p className="text-muted-foreground max-w-md">
                Nossa IA encontra conexões ideais com base no seu perfil
              </p>
            </div>

            {stats.matches > 0 && (
              <div className="text-center">
                <div className="text-4xl font-bold text-aurora mb-2">
                  {stats.matches}
                </div>
                <p className="text-sm text-muted-foreground">
                  sugestões esperando por você
                </p>
              </div>
            )}

            <Button
              onClick={() => setActiveTab('discover')}
              size="lg"
              className="gap-2 bg-gradient-to-r from-aurora to-aurora-primary hover:from-aurora/90 hover:to-aurora-primary/90 text-white shadow-md hover:shadow-lg px-8"
            >
              Ver Sugestões
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
