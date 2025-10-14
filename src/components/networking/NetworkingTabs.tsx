import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePendingRequests } from '@/hooks/networking/usePendingRequests';
import { useStrategicMatches } from '@/hooks/useStrategicMatches';
import { Sparkles, Users, Clock, Link as LinkIcon, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MatchesGrid } from './MatchesGrid';
import { ActiveConnectionsList } from './connections/ActiveConnectionsList';
import { PendingRequestsList } from './connections/PendingRequestsList';

export const NetworkingTabs = () => {
  const { pendingRequests } = usePendingRequests();
  const { isLoading: matchesLoading } = useStrategicMatches();

  return (
    <div className="space-y-6">
      {/* Banner CTA - Design Limpo */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-elevated to-surface border border-border/30 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-aurora/5 via-transparent to-viverblue/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-aurora/5 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-aurora/10 border border-aurora/20">
                <Sparkles className="w-5 h-5 text-aurora" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-aurora via-primary to-viverblue bg-clip-text text-transparent">
                Descubra Conexões Estratégicas
              </h3>
            </div>
            <p className="text-text-muted max-w-2xl">
              Nossa IA analisou seu perfil e encontrou matches personalizados para impulsionar seu negócio
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/networking/analytics">
              <Button variant="outline" size="lg" className="border-border/50 hover:border-primary/40 hover:bg-primary/5">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            
            <Link to="/networking/discover">
              <Button size="lg" className="bg-gradient-to-r from-aurora to-viverblue text-white hover:opacity-90 shadow-lg shadow-aurora/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Descobrir Matches
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs - Apenas Conexões e Solicitações */}
      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-surface-elevated border border-border/30 p-1.5 rounded-xl">
          <TabsTrigger 
            value="connections"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-aurora/20 data-[state=active]:to-aurora/10 data-[state=active]:text-aurora data-[state=active]:shadow-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            <span className="font-medium">Minhas Conexões</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="pending"
            className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-operational/20 data-[state=active]:to-operational/10 data-[state=active]:text-operational data-[state=active]:shadow-sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-medium">Solicitações</span>
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-operational text-white border-0 animate-pulse">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-6">
          <ActiveConnectionsList />
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <PendingRequestsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};
