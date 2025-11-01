import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, Sparkles, Compass, Inbox, Send } from 'lucide-react';
import { MyConnectionsGrid } from './MyConnectionsGrid';
import { PendingRequestsList } from './PendingRequestsList';
import { SentRequestsList } from './SentRequestsList';
import { DiscoverPeopleGrid } from './DiscoverPeopleGrid';
import { useNetworkingStats } from '@/hooks/useNetworkingStats';
import { usePendingRequests } from '@/hooks/networking/usePendingRequests';
import { useSentRequests } from '@/hooks/networking/useSentRequests';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

export const ConnectionsHub = () => {
  const [activeTab, setActiveTab] = useState<string>('connections');
  const [pendingSubTab, setPendingSubTab] = useState<string>('received');
  const { data: stats } = useNetworkingStats();
  const { pendingRequests } = usePendingRequests();
  const { sentRequests } = useSentRequests();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className="grid w-full sm:w-auto grid-cols-4 bg-muted/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="connections" className="gap-2 data-[state=active]:bg-background">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Conexões</span>
              {stats.connections > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  {stats.connections}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-background">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Pendentes</span>
              {stats.notifications > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-operational/20 text-operational text-xs font-medium animate-pulse">
                  {stats.notifications}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="discover" className="gap-2 data-[state=active]:bg-background">
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline">Descobrir</span>
            </TabsTrigger>
            
            <TabsTrigger value="ai" className="gap-2 data-[state=active]:bg-background">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">IA</span>
              {stats.matches > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-aurora/20 text-aurora text-xs font-medium">
                  {stats.matches}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Botão para acessar sugestões de IA */}
          {activeTab === 'ai' && (
            <Button
              onClick={() => navigate('/networking')}
              className="gap-2 bg-gradient-to-r from-aurora via-aurora-primary to-operational hover:from-aurora/90 hover:via-aurora-primary/90 hover:to-operational/90"
            >
              <Brain className="h-4 w-4" />
              Ver Sugestões com IA
            </Button>
          )}
        </div>

        <TabsContent value="connections" className="mt-0">
          <MyConnectionsGrid />
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <Tabs value={pendingSubTab} onValueChange={setPendingSubTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/30">
              <TabsTrigger value="received" className="gap-2">
                <Inbox className="h-4 w-4" />
                Recebidas
                {pendingRequests.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-operational/20 text-operational text-xs font-medium">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="gap-2">
                <Send className="h-4 w-4" />
                Enviadas
                {sentRequests.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                    {sentRequests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="mt-6">
              <PendingRequestsList />
            </TabsContent>

            <TabsContent value="sent" className="mt-6">
              <SentRequestsList />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="discover" className="mt-0">
          <DiscoverPeopleGrid />
        </TabsContent>

        <TabsContent value="ai" className="mt-0">
          <div className="text-center py-20 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-aurora/20 to-aurora-primary/20 border border-aurora/30">
              <Sparkles className="w-10 h-10 text-aurora" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold text-text-primary">
                Sugestões Inteligentes de Conexão
              </h3>
              <p className="text-text-muted leading-relaxed">
                Nossa IA analisa perfis e gera matches personalizados baseados em seus interesses, 
                indústria e objetivos profissionais
              </p>
            </div>
            <Button
              onClick={() => navigate('/networking')}
              size="lg"
              className="gap-2 bg-gradient-to-r from-aurora via-aurora-primary to-operational hover:from-aurora/90 hover:via-aurora-primary/90 hover:to-operational/90 shadow-lg"
            >
              <Brain className="h-5 w-5" />
              Descobrir Conexões com IA
            </Button>
            {stats.matches > 0 && (
              <p className="text-sm text-muted-foreground">
                Você tem {stats.matches} {stats.matches === 1 ? 'nova sugestão' : 'novas sugestões'} esperando por você
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
