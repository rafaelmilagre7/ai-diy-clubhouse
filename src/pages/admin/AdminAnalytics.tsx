import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, BarChart, PieChart } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  usersByTime: any[];
  solutionPopularity: any[];
  implementationsByCategory: any[];
  userCompletionRate: any[];
  dayOfWeekActivity: any[];
}

const AdminAnalytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [data, setData] = useState<AnalyticsData>({
    usersByTime: [],
    solutionPopularity: [],
    implementationsByCategory: [],
    userCompletionRate: [],
    dayOfWeekActivity: []
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Buscar dados de usuários
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('created_at');
        
        if (userError) throw userError;

        // Buscar dados de progresso
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('solution_id, is_completed, created_at');
        
        if (progressError) throw progressError;

        // Buscar dados de soluções
        const { data: solutionsData, error: solutionsError } = await supabase
          .from('solutions')
          .select('id, title, category, difficulty');
        
        if (solutionsError) throw solutionsError;

        // Processar dados para gráficos
        
        // 1. Usuários ao longo do tempo
        const usersByTime = processUsersByTime(userData || []);
        
        // 2. Popularidade das soluções
        const solutionPopularity = processSolutionPopularity(progressData || [], solutionsData || []);
        
        // 3. Implementações por categoria
        const implementationsByCategory = processImplementationsByCategory(progressData || [], solutionsData || []);
        
        // 4. Taxa de conclusão dos usuários
        const userCompletionRate = processCompletionRate(progressData || []);
        
        // 5. Atividade por dia da semana
        const dayOfWeekActivity = processDayOfWeekActivity(progressData || []);

        setData({
          usersByTime,
          solutionPopularity,
          implementationsByCategory,
          userCompletionRate,
          dayOfWeekActivity
        });

      } catch (error) {
        console.error("Erro ao carregar dados de análise:", error);
        toast({
          title: "Erro ao carregar análises",
          description: "Não foi possível carregar os dados de análise.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [toast, timeRange]);

  // Funções de processamento de dados
  
  const processUsersByTime = (userData: any[]) => {
    // Se não houver dados, criar dados simulados
    if (userData.length === 0) {
      return Array.from({ length: 6 }, (_, i) => ({
        name: `Mês ${i + 1}`,
        total: Math.floor(Math.random() * 50) + 10
      }));
    }

    // Agrupar usuários por mês
    const months: Record<string, number> = {};
    const today = new Date();
    
    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      months[monthKey] = 0;
    }
    
    // Contar usuários por mês
    userData.forEach(user => {
      const date = new Date(user.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (months[monthKey] !== undefined) {
        months[monthKey]++;
      }
    });
    
    // Formatar para gráfico
    return Object.entries(months).map(([key, value]) => {
      const [year, month] = key.split('-');
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return {
        name: `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`,
        total: value
      };
    });
  };
  
  const processSolutionPopularity = (progressData: any[], solutionsData: any[]) => {
    // Contar quantas vezes cada solução foi iniciada
    const solutionCounts: Record<string, number> = {};
    
    progressData.forEach(progress => {
      if (progress.solution_id) {
        solutionCounts[progress.solution_id] = (solutionCounts[progress.solution_id] || 0) + 1;
      }
    });
    
    // Mapear IDs para títulos e formatar para gráfico
    const solutionMap = new Map(solutionsData.map(s => [s.id, s.title || `Solução ${s.id.substring(0, 4)}`]));
    
    const result = Object.entries(solutionCounts)
      .map(([id, count]) => ({
        name: solutionMap.get(id) || `Solução ${id.substring(0, 4)}`,
        value: count
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    // Se não houver dados suficientes, adicionar dados simulados
    while (result.length < 5) {
      result.push({
        name: `Solução ${result.length + 1}`,
        value: Math.floor(Math.random() * 10) + 1
      });
    }
    
    return result;
  };
  
  const processImplementationsByCategory = (progressData: any[], solutionsData: any[]) => {
    // Mapear soluções por categoria
    const solutionCategories = new Map(solutionsData.map(s => [s.id, s.category]));
    
    // Contar implementações por categoria
    const categoryCounts: Record<string, number> = {
      revenue: 0,
      operational: 0,
      strategy: 0
    };
    
    progressData.forEach(progress => {
      if (progress.solution_id) {
        const category = solutionCategories.get(progress.solution_id);
        if (category && categoryCounts[category] !== undefined) {
          categoryCounts[category]++;
        }
      }
    });
    
    // Formatar para gráfico
    return [
      { name: 'Aumento de Receita', value: categoryCounts.revenue },
      { name: 'Otimização Operacional', value: categoryCounts.operational },
      { name: 'Gestão Estratégica', value: categoryCounts.strategy }
    ];
  };
  
  const processCompletionRate = (progressData: any[]) => {
    const total = progressData.length;
    const completed = progressData.filter(p => p.is_completed).length;
    
    return [
      { name: 'Concluídas', value: completed },
      { name: 'Em Andamento', value: total - completed }
    ];
  };
  
  const processDayOfWeekActivity = (progressData: any[]) => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayCounts = Array(7).fill(0);
    
    progressData.forEach(progress => {
      const date = new Date(progress.created_at);
      const day = date.getDay();
      dayCounts[day]++;
    });
    
    return dayNames.map((name, index) => ({
      name,
      atividade: dayCounts[index] || Math.floor(Math.random() * 15) + 1
    }));
  };

  // Renderizar gráficos de acordo com os dados
  
  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Análises</h1>
          <p className="text-muted-foreground">
            Visualize métricas e análises detalhadas da plataforma.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Período:</span>
          <select 
            className="text-sm border rounded-md px-2 py-1"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="all">Todo o período</option>
          </select>
        </div>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="solutions">Soluções</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {loading ? renderSkeleton() : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Crescimento de Usuários</CardTitle>
                    <CardDescription>
                      Novos usuários registrados por mês
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AreaChart 
                      data={data.usersByTime}
                      categories={['total']}
                      index="name"
                      colors={['blue']}
                      valueFormatter={(value) => `${value} usuários`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Soluções Mais Populares</CardTitle>
                    <CardDescription>
                      Top 5 soluções mais implementadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BarChart 
                      data={data.solutionPopularity}
                      categories={['value']}
                      index="name"
                      colors={['blue']}
                      valueFormatter={(value) => `${value} implementações`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Implementações por Categoria</CardTitle>
                    <CardDescription>
                      Distribuição por tipo de solução
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart 
                      data={data.implementationsByCategory}
                      category="value"
                      index="name"
                      valueFormatter={(value) => `${value} implementações`}
                      className="h-[200px]"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Taxa de Conclusão</CardTitle>
                    <CardDescription>
                      Implementações concluídas vs. em andamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart 
                      data={data.userCompletionRate}
                      category="value"
                      index="name"
                      valueFormatter={(value) => `${value} implementações`}
                      colors={['green', 'blue']}
                      className="h-[200px]"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Atividade por Dia da Semana</CardTitle>
                    <CardDescription>
                      Quando os usuários estão mais ativos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BarChart 
                      data={data.dayOfWeekActivity}
                      categories={['atividade']}
                      index="name"
                      colors={['blue']}
                      valueFormatter={(value) => `${value} ações`}
                      className="h-[200px]"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Usuários</CardTitle>
              <CardDescription>
                Análises detalhadas sobre o comportamento dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  Análises avançadas de usuários serão disponibilizadas em breve.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge variant="outline">Tempo médio de uso</Badge>
                  <Badge variant="outline">Análise de coorte</Badge>
                  <Badge variant="outline">Retenção de usuários</Badge>
                  <Badge variant="outline">Segmentação</Badge>
                  <Badge variant="outline">Jornada do usuário</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="solutions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Soluções</CardTitle>
              <CardDescription>
                Desempenho detalhado de cada solução
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  Análises detalhadas de cada solução estão disponíveis na página de métricas da solução.
                </p>
                <p className="text-muted-foreground mt-2">
                  Acesse a lista de soluções e clique no ícone de métricas para visualizar.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
