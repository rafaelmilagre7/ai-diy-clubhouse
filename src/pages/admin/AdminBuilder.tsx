import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BuilderOverviewMetrics } from '@/components/admin/builder/BuilderOverviewMetrics';
import { BuilderGrowthChart } from '@/components/admin/builder/BuilderGrowthChart';
import { BuilderSolutionsTable } from '@/components/admin/builder/BuilderSolutionsTable';
import { BuilderToolsRanking } from '@/components/admin/builder/BuilderToolsRanking';
import { BuilderRoleLimits } from '@/components/admin/builder/BuilderRoleLimits';
import { Sparkles, TrendingUp, List, Wrench, Settings } from 'lucide-react';

const AdminBuilder = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['builder-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('builder_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all solutions for admin view
  const { data: allSolutions, isLoading: solutionsLoading } = useQuery({
    queryKey: ['builder-admin-solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generated_solutions')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch usage statistics
  const { data: usageStats } = useQuery({
    queryKey: ['builder-usage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_solution_usage')
        .select('*');
      
      if (error) throw error;
      
      const totalGenerations = data.reduce((acc, curr) => acc + curr.generations_count, 0);
      const activeUsers = new Set(data.map(d => d.user_id)).size;
      const avgPerUser = activeUsers > 0 ? (totalGenerations / activeUsers).toFixed(1) : '0';
      
      return {
        totalGenerations,
        activeUsers,
        avgPerUser
      };
    }
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Builder - Admin
          </h1>
          <p className="text-muted-foreground">
            Gestão e analytics do gerador de soluções com IA
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="solutions" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Soluções
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Ferramentas
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Limites
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <BuilderOverviewMetrics 
            solutions={allSolutions}
            usageStats={usageStats}
            loading={solutionsLoading}
          />
          <BuilderGrowthChart 
            analytics={analytics}
            loading={analyticsLoading}
          />
        </TabsContent>

        {/* Solutions Tab */}
        <TabsContent value="solutions" className="space-y-6">
          <BuilderSolutionsTable 
            solutions={allSolutions}
            loading={solutionsLoading}
          />
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <BuilderToolsRanking 
            solutions={allSolutions}
            loading={solutionsLoading}
          />
        </TabsContent>

        {/* Limits Tab */}
        <TabsContent value="limits" className="space-y-6">
          <BuilderRoleLimits />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Status</CardTitle>
              </CardHeader>
              <CardContent>
                {allSolutions && (
                  <div className="space-y-3">
                    {['not_started', 'in_progress', 'completed'].map(status => {
                      const count = allSolutions.filter(s => s.implementation_status === status).length;
                      const percentage = allSolutions.length > 0 
                        ? Math.round((count / allSolutions.length) * 100) 
                        : 0;
                      
                      const statusLabels = {
                        not_started: 'Não Iniciadas',
                        in_progress: 'Em Progresso',
                        completed: 'Concluídas'
                      };
                      
                      return (
                        <div key={status}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{statusLabels[status as keyof typeof statusLabels]}</span>
                            <span className="font-medium">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Geração</CardTitle>
              </CardHeader>
              <CardContent>
                {allSolutions && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary">
                        {allSolutions.length > 0 
                          ? (allSolutions.reduce((acc, s) => acc + (s.generation_time_ms || 0), 0) / allSolutions.length / 1000).toFixed(1)
                          : '0'
                        }s
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Tempo médio de processamento
                      </p>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-semibold">
                            {allSolutions.filter(s => s.generation_time_ms && s.generation_time_ms < 30000).length}
                          </p>
                          <p className="text-xs text-muted-foreground">{'< 30s'}</p>
                        </div>
                        <div>
                          <p className="text-2xl font-semibold">
                            {allSolutions.filter(s => s.generation_time_ms && s.generation_time_ms >= 30000).length}
                          </p>
                          <p className="text-xs text-muted-foreground">{'>= 30s'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBuilder;
