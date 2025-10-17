
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingScreen from "@/components/common/LoadingScreen";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { chartColors } from '@/lib/chart-utils';

const SolutionMetrics = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch solution details
        const { data: solutionData, error: solutionError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();
        
        if (solutionError) {
          throw solutionError;
        }
        
        setSolution(solutionData as Solution);
        
        // Fetch solution metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from("solution_metrics")
          .select("*")
          .eq("solution_id", id)
          .single();
        
        if (!metricsError) {
          setMetrics(metricsData);
        } else if (metricsError.code !== "PGRST116") { // Not found error
          throw metricsError;
        }
        
        // Fetch modules
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("solution_id", id)
          .order("module_order", { ascending: true });
        
        if (modulesError) {
          throw modulesError;
        }
        
        setModules(modulesData);
        
        // Fetch analytics data for this solution
        const { data: analyticsData, error: analyticsError } = await supabase
          .from("analytics")
          .select("*")
          .eq("solution_id", id);
        
        if (analyticsError) {
          throw analyticsError;
        }
        
        // Process analytics data to generate metrics if none exist
        if (!metricsData && analyticsData && analyticsData.length > 0) {
          generateMetricsFromAnalytics(analyticsData);
        }
      } catch (error) {
        console.error("Error fetching solution metrics:", error);
        toast({
          title: "Erro ao carregar métricas",
          description: "Ocorreu um erro ao tentar carregar as métricas da solução.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, toast]);
  
  const generateMetricsFromAnalytics = (analyticsData: any[]) => {
    // Example: count views, starts, completions
    const viewEvents = analyticsData.filter(event => event.event_type === "view").length;
    const startEvents = analyticsData.filter(event => event.event_type === "start").length;
    const completeEvents = analyticsData.filter(event => event.event_type === "complete").length;
    
    // Generate module abandonment data
    const abandonmentRates: Record<string, number> = {};
    modules.forEach((module, index) => {
      const moduleViews = analyticsData.filter(
        event => event.module_id === module.id && event.event_type === "view"
      ).length;
      
      const moduleCompletions = analyticsData.filter(
        event => event.module_id === module.id && event.event_type === "complete"
      ).length;
      
      if (moduleViews > 0) {
        abandonmentRates[`module_${index}`] = Math.round((1 - (moduleCompletions / moduleViews)) * 100);
      } else {
        abandonmentRates[`module_${index}`] = 0;
      }
    });
    
    // Set metrics state with generated data
    setMetrics({
      total_views: viewEvents,
      total_starts: startEvents,
      total_completions: completeEvents,
      abandonment_rates: abandonmentRates,
      average_completion_time: 0, // Would need more detailed data to calculate this
    });
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!solution) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Solução não encontrada</h3>
        <p className="text-muted-foreground mt-1">
          A solução que você está procurando não existe ou foi removida.
        </p>
        <Button 
          variant="link" 
          className="mt-4"
          onClick={() => navigate("/admin/solutions")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para lista de soluções
        </Button>
      </div>
    );
  }
  
  // Prepare chart data
  const moduleNames = modules.map(m => m.title || `Módulo ${m.module_order + 1}`);
  
  const completionFunnelData = metrics ? [
    { name: "Visualizações", value: metrics.total_views || 0 },
    { name: "Início da Implementação", value: metrics.total_starts || 0 },
    { name: "Implementações Completas", value: metrics.total_completions || 0 },
  ] : [];
  
  const abandonmentRateData = metrics && metrics.abandonment_rates
    ? Object.keys(metrics.abandonment_rates).map((key, index) => ({
        name: moduleNames[index] || `Módulo ${index + 1}`,
        rate: metrics.abandonment_rates[key] || 0,
      }))
    : modules.map((_, index) => ({
        name: moduleNames[index] || `Módulo ${index + 1}`,
        rate: 0,
      }));
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/solutions")}
            className="mb-2"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para soluções
          </Button>
          <h1 className="text-3xl font-bold">{solution.title}</h1>
          <p className="text-muted-foreground mt-1">Métricas e análises de implementação</p>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">
                    {metrics?.total_views || 0}
                  </CardTitle>
                  <CardDescription>Visualizações</CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">
                    {metrics?.total_starts || 0}
                  </CardTitle>
                  <CardDescription>Implementações iniciadas</CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">
                    {metrics?.total_completions || 0}
                  </CardTitle>
                  <CardDescription>Implementações concluídas</CardDescription>
                </CardHeader>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funil de Implementação</CardTitle>
                  <CardDescription>
                    Conversão em cada etapa do processo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={completionFunnelData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Bar dataKey="value">
                          {completionFunnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors.categorical[index % chartColors.categorical.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Conclusão</CardTitle>
                  <CardDescription>
                    Porcentagem de usuários que concluíram a implementação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Concluídas', value: metrics?.total_completions || 0 },
                            { name: 'Não concluídas', value: (metrics?.total_starts || 0) - (metrics?.total_completions || 0) },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="hsl(var(--aurora-primary))" />
                          <Cell fill="hsl(var(--muted))" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Abandono por Módulo</CardTitle>
                <CardDescription>
                  Porcentagem de usuários que não completaram cada módulo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={abandonmentRateData}
                      margin={{ top: 20, right: 30, left: 30, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis label={{ value: 'Taxa de Abandono (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="rate" fill={chartColors.categorical[1]} name="Taxa de Abandono (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Progresso dos Módulos</CardTitle>
                <CardDescription>
                  Número de visualizações e conclusões por módulo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={modules.map((module, index) => ({
                        name: module.title || `Módulo ${index + 1}`,
                        views: Math.round(Math.random() * 100), // Simulated data
                        completions: Math.round(Math.random() * 70), // Simulated data
                      }))}
                      margin={{ top: 20, right: 30, left: 30, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke={chartColors.categorical[2]} name="Visualizações" />
                      <Line type="monotone" dataKey="completions" stroke={chartColors.categorical[3]} name="Conclusões" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Usuário</CardTitle>
                <CardDescription>
                  Esta aba mostrará dados dos usuários quando disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  Dados detalhados de usuários ainda não estão disponíveis para esta solução.
                </p>
                <p className="text-muted-foreground mt-2">
                  À medida que mais usuários interagirem com a solução, os dados serão exibidos aqui.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SolutionMetrics;
