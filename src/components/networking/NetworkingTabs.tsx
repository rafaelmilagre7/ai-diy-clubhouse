import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePendingRequests } from '@/hooks/networking/usePendingRequests';
import { Sparkles, Users, Clock, Link as LinkIcon, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MatchesGrid } from './MatchesGrid';
import { ActiveConnectionsList } from './connections/ActiveConnectionsList';
import { PendingRequestsList } from './connections/PendingRequestsList';

export const NetworkingTabs = () => {
  const { pendingRequests } = usePendingRequests();

  return (
    <div className="space-y-6">
      {/* Discover CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-aurora/5 border border-aurora/20 p-6">
        <div className="absolute inset-0 aurora-gradient opacity-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-aurora" />
              <h3 className="text-lg font-bold aurora-text-gradient">Descubra Conexões Estratégicas</h3>
            </div>
            <p className="text-text-muted max-w-xl text-sm">
              Nossa IA analisou seu perfil e encontrou matches personalizados para impulsionar seu negócio
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/networking/analytics">
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            
            <Link to="/networking/discover">
              <Button size="lg" className="aurora-gradient text-white hover:opacity-90">
                <Sparkles className="w-4 h-4 mr-2" />
                Ver Matches
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-surface-elevated border border-border/30 p-1">
          <TabsTrigger 
            value="connections"
            className="data-[state=active]:bg-aurora/20 data-[state=active]:text-aurora data-[state=active]:border-aurora/40"
          >
            <Users className="w-4 h-4 mr-2" />
            Conexões
          </TabsTrigger>
          
          <TabsTrigger 
            value="pending"
            className="relative data-[state=active]:bg-operational/20 data-[state=active]:text-operational data-[state=active]:border-operational/40"
          >
            <Clock className="w-4 h-4 mr-2" />
            Solicitações
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-operational/30 text-operational border-operational/50 animate-pulse">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-viverblue/20 data-[state=active]:text-viverblue data-[state=active]:border-viverblue/40"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Todos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-6">
          <ActiveConnectionsList />
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <PendingRequestsList />
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <MatchesGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
};
