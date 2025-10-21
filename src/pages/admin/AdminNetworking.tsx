import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkingMetricsCards } from "@/components/admin/networking/NetworkingMetricsCards";
import { NetworkingGrowthChart } from "@/components/admin/networking/NetworkingGrowthChart";
import { OpportunitiesManagementTable } from "@/components/admin/networking/OpportunitiesManagementTable";
import { ActiveUsersTable } from "@/components/admin/networking/ActiveUsersTable";
import { RecentMatchesTable } from "@/components/admin/networking/RecentMatchesTable";
import { useNetworkingProfiles } from "@/hooks/useNetworkingProfiles";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminNetworking() {
  const { data: profiles, isLoading: profilesLoading } = useNetworkingProfiles();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-networking-metrics'],
    queryFn: async () => {
      const { count: total } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('name', 'is', null);

      const { count: active } = await supabase
        .from('member_connections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted');

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: thisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      const { data: viewsData } = await supabase
        .from('networking_analytics')
        .select('event_data')
        .eq('event_type', 'profile_view');

      const totalViews = viewsData?.length || 0;

      return {
        total: total || 0,
        active: active || 0,
        thisWeek: thisWeek || 0,
        totalViews,
        edited: 0,
        deleted: 0
      };
    },
    staleTime: 30 * 1000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Networking</h1>
        <p className="text-muted-foreground mt-2">
          Monitore e gerencie todas as atividades de networking da plataforma
        </p>
      </div>

      <NetworkingMetricsCards 
        metrics={metrics || { total: 0, active: 0, thisWeek: 0, totalViews: 0 }} 
        loading={metricsLoading}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <NetworkingGrowthChart />
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <OpportunitiesManagementTable />
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <RecentMatchesTable />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <ActiveUsersTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
