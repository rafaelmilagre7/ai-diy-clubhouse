import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  AlertCircle, 
  CheckCircle2, 
  Database,
  Users,
  FileText,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ChecklistDataMigrationTool from './ChecklistDataMigrationTool';

interface ChecklistStats {
  unifiedChecklists: {
    total: number;
    templates: number;
    userProgress: number;
    completed: number;
    solutionsWithChecklists: number;
    uniqueUsers: number;
  };
  legacyData: {
    implementationCheckpoints: number;
    userChecklists: number;
    needsMigration: boolean;
  };
  solutionBreakdown: Array<{
    solution_id: string;
    solution_title: string;
    template_count: number;
    user_progress_count: number;
    total_users: number;
  }>;
}

const ChecklistAuditDashboard: React.FC = () => {
  const [stats, setStats] = useState<ChecklistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Estatísticas da unified_checklists
      const { data: unifiedData, error: unifiedError } = await supabase
        .from('unified_checklists')
        .select('*');

      if (unifiedError) throw unifiedError;

      // 2. Estatísticas das tabelas legadas
      const { data: checkpointsData, error: checkpointsError } = await supabase
        .from('implementation_checkpoints')
        .select('id, solution_id, user_id');

      const { data: userChecklistsData, error: userChecklistsError } = await supabase
        .from('user_checklists')
        .select('id, solution_id, user_id');

      if (checkpointsError) throw checkpointsError;
      if (userChecklistsError) throw userChecklistsError;

      // 3. Detalhes por solução
      const { data: solutionsData, error: solutionsError } = await supabase
        .from('solutions')
        .select('id, title')
        .eq('published', true);

      if (solutionsError) throw solutionsError;

      // Processar dados
      const unifiedStats = {
        total: unifiedData?.length || 0,
        templates: unifiedData?.filter(item => item.is_template).length || 0,
        userProgress: unifiedData?.filter(item => !item.is_template).length || 0,
        completed: unifiedData?.filter(item => item.is_completed).length || 0,
        solutionsWithChecklists: new Set(unifiedData?.map(item => item.solution_id)).size,
        uniqueUsers: new Set(unifiedData?.filter(item => !item.is_template).map(item => item.user_id)).size
      };

      const legacyStats = {
        implementationCheckpoints: checkpointsData?.length || 0,
        userChecklists: userChecklistsData?.length || 0,
        needsMigration: (checkpointsData?.length || 0) > 0 || (userChecklistsData?.length || 0) > 0
      };

      // Breakdown por solução
      const solutionBreakdown = (solutionsData || []).map(solution => {
        const templateCount = unifiedData?.filter(item => 
          item.solution_id === solution.id && item.is_template
        ).length || 0;
        
        const userProgressCount = unifiedData?.filter(item => 
          item.solution_id === solution.id && !item.is_template
        ).length || 0;
        
        const totalUsers = new Set(
          unifiedData?.filter(item => 
            item.solution_id === solution.id && !item.is_template
          ).map(item => item.user_id)
        ).size;

        return {
          solution_id: solution.id,
          solution_title: solution.title,
          template_count: templateCount,
          user_progress_count: userProgressCount,
          total_users: totalUsers
        };
      }).filter(solution => solution.template_count > 0 || solution.user_progress_count > 0);

      setStats({
        unifiedChecklists: unifiedStats,
        legacyData: legacyStats,
        solutionBreakdown
      });

    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Erro ao carregar dados: {error}</span>
          </div>
          <Button onClick={fetchStats} className="mt-4">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Auditoria de Checklists</h2>
        <Button onClick={fetchStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Unificado</p>
                <p className="text-2xl font-bold">{stats.unifiedChecklists.total}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">{stats.unifiedChecklists.templates}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progresso Usuários</p>
                <p className="text-2xl font-bold">{stats.unifiedChecklists.userProgress}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{stats.unifiedChecklists.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status de migração */}
      {stats.legacyData.needsMigration && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Dados Legados Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-orange-700">
                Foram encontrados dados nas tabelas antigas que precisam ser migrados:
              </p>
              <div className="flex gap-4">
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  implementation_checkpoints: {stats.legacyData.implementationCheckpoints}
                </Badge>
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  user_checklists: {stats.legacyData.userChecklists}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="solutions">Por Solução</TabsTrigger>
          <TabsTrigger value="migration">Migração</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Sistema Unificado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Soluções com Checklists:</span>
                  <Badge>{stats.unifiedChecklists.solutionsWithChecklists}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Usuários Únicos:</span>
                  <Badge>{stats.unifiedChecklists.uniqueUsers}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Conclusão:</span>
                  <Badge variant={stats.unifiedChecklists.userProgress > 0 ? "default" : "secondary"}>
                    {stats.unifiedChecklists.userProgress > 0 
                      ? `${Math.round((stats.unifiedChecklists.completed / stats.unifiedChecklists.userProgress) * 100)}%`
                      : '0%'
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status de Integridade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {stats.legacyData.needsMigration ? (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <span className={stats.legacyData.needsMigration ? "text-orange-700" : "text-green-700"}>
                    {stats.legacyData.needsMigration 
                      ? "Migração Pendente" 
                      : "Sistema Totalmente Migrado"
                    }
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-700">Sistema Unificado Ativo</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-700">RLS Policies Aplicadas</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="solutions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Checklists por Solução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.solutionBreakdown.map(solution => (
                  <div 
                    key={solution.solution_id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{solution.solution_title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {solution.total_users} usuários ativos
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        T: {solution.template_count}
                      </Badge>
                      <Badge variant="default">
                        P: {solution.user_progress_count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migration" className="space-y-4">
          <ChecklistDataMigrationTool />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChecklistAuditDashboard;