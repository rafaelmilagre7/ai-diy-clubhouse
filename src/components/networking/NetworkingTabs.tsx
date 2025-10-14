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
          {matchesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4 p-6 rounded-xl border border-border/50 bg-surface">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <MatchesGrid />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
