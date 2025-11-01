import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, Send, Brain } from 'lucide-react';
import { MyConnectionsGrid } from './MyConnectionsGrid';
import { PendingRequestsList } from './PendingRequestsList';
import { SentRequestsList } from './SentRequestsList';
import { Badge } from '@/components/ui/badge';
import { useNetworkingStats } from '@/hooks/useNetworkingStats';
import { useSearchParams } from 'react-router-dom';


export const ConnectionsHub = () => {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  
  // Converter "pending" para "received" para compatibilidade
  const initialTab = urlTab === 'pending' ? 'received' : (urlTab || 'connections');
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const { data: stats } = useNetworkingStats();

  // Atualizar tab quando URL mudar
  useEffect(() => {
    if (urlTab) {
      const tab = urlTab === 'pending' ? 'received' : urlTab;
      setActiveTab(tab);
    }
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
            value="received" 
            className="relative data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            Recebidas
            {stats.notifications > 0 && (
              <Badge variant="secondary" className="ml-2 bg-operational/10 text-operational text-xs px-1.5 py-0">
                {stats.notifications}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger 
            value="sent"
            className="relative data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviadas
          </TabsTrigger>

          <TabsTrigger 
            value="ai"
            className="relative data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Brain className="w-4 h-4 mr-2" />
            IA
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="connections" className="mt-6 space-y-6">
          <MyConnectionsGrid />
        </TabsContent>

        <TabsContent value="received" className="mt-6 space-y-6">
          <PendingRequestsList />
        </TabsContent>

        <TabsContent value="sent" className="mt-6 space-y-6">
          <SentRequestsList />
        </TabsContent>

        <TabsContent value="ai" className="mt-6 space-y-6">
          {/* Seção IA com Copy Simplificada */}
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-aurora/10 via-aurora-primary/10 to-operational/5 border border-aurora/20">
              <Brain className="w-10 h-10 text-aurora" />
            </div>

            <div className="text-center space-y-3 max-w-md">
              <h2 className="text-2xl font-bold text-foreground">
                Networking Inteligente
              </h2>
              <p className="text-muted-foreground">
                Use nossa ferramenta de IA para descobrir conexões ideais baseadas no seu perfil profissional
              </p>
            </div>

            <button
              onClick={() => setActiveTab('connections')}
              className="mt-4 px-8 py-3 rounded-lg bg-gradient-to-r from-aurora to-aurora-primary hover:from-aurora/90 hover:to-aurora-primary/90 text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              Descobrir Conexões Ideais
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
