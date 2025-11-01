import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, Send } from 'lucide-react';
import { MyConnectionsGrid } from './MyConnectionsGrid';
import { PendingRequestsList } from './PendingRequestsList';
import { SentRequestsList } from './SentRequestsList';
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
        {/* Tabs Premium com Glassmorphism - Estilo Soluções */}
        <div className="relative group">
          {/* Aurora glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
          
          {/* Container das tabs com glassmorphism avançado */}
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl p-2 shadow-2xl shadow-primary/10">
            <TabsList className="bg-transparent p-0 h-auto w-full grid grid-cols-3 gap-2">
              <TabsTrigger 
                value="connections" 
                className="relative px-6 py-4 text-sm font-medium transition-all duration-300 rounded-xl group
                         data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 
                         data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30
                         data-[state=active]:scale-105 data-[state=active]:border-0
                         hover:bg-muted/50 hover:scale-102 hover:text-foreground hover:shadow-md
                         text-muted-foreground border border-transparent"
              >
                <Users className="w-4 h-4 mr-2" />
                <span className="relative z-10">Conexões</span>
                {stats.connections > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20 text-white data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary transition-colors">
                    {stats.connections}
                  </span>
                )}
                {/* Hover shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
              </TabsTrigger>

              <TabsTrigger 
                value="received" 
                className="relative px-6 py-4 text-sm font-medium transition-all duration-300 rounded-xl group
                         data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 
                         data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30
                         data-[state=active]:scale-105 data-[state=active]:border-0
                         hover:bg-muted/50 hover:scale-102 hover:text-foreground hover:shadow-md
                         text-muted-foreground border border-transparent"
              >
                <Clock className="w-4 h-4 mr-2" />
                <span className="relative z-10">Recebidas</span>
                {stats.notifications > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20 text-white data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary transition-colors">
                    {stats.notifications}
                  </span>
                )}
                {/* Hover shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
              </TabsTrigger>

              <TabsTrigger 
                value="sent"
                className="relative px-6 py-4 text-sm font-medium transition-all duration-300 rounded-xl group
                         data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 
                         data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30
                         data-[state=active]:scale-105 data-[state=active]:border-0
                         hover:bg-muted/50 hover:scale-102 hover:text-foreground hover:shadow-md
                         text-muted-foreground border border-transparent"
              >
                <Send className="w-4 h-4 mr-2" />
                <span className="relative z-10">Enviadas</span>
                {/* Hover shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        <TabsContent value="connections" className="mt-8 animate-fade-in">
          <MyConnectionsGrid />
        </TabsContent>

        <TabsContent value="received" className="mt-8 animate-fade-in">
          <PendingRequestsList />
        </TabsContent>

        <TabsContent value="sent" className="mt-8 animate-fade-in">
          <SentRequestsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};
