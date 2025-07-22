
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, CheckCircle, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LearningMonitoringDashboard } from "@/components/learning/admin/LearningMonitoringDashboard";

const FormacaoDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCursos: 0,
    totalAulas: 0,
    aulasCompletadas: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Buscar contagem de cursos
        const { count: cursos, error: errorCursos } = await supabase
          .from('learning_courses')
          .select('*', { count: 'exact', head: true });

        // Buscar contagem de aulas
        const { count: aulas, error: errorAulas } = await supabase
          .from('learning_lessons')
          .select('*', { count: 'exact', head: true });
          
        // Buscar aulas completadas
        const { data: completadas, error: errorCompletadas } = await supabase
          .from('learning_progress')
          .select('id')
          .not('completed_at', 'is', null)
          .limit(1000);

        if (errorCursos || errorAulas || errorCompletadas) {
          throw new Error("Erro ao buscar estatísticas");
        }

        setStats({
          totalCursos: cursos || 0,
          totalAulas: aulas || 0,
          aulasCompletadas: completadas?.length || 0
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de Formação</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="monitoring">
            <Monitor className="h-4 w-4 mr-2" />
            Monitoramento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card onClick={() => navigate("/formacao/cursos")} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="text-2xl font-bold">{stats.totalCursos}</div>
                )}
              </CardContent>
            </Card>

            <Card onClick={() => navigate("/formacao/aulas")} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="text-2xl font-bold">{stats.totalAulas}</div>
                )}
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aulas Completadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="text-2xl font-bold">{stats.aulasCompletadas}</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>Seus dados de acesso à área de formação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Nome:</span>
                    <span className="text-sm">{profile?.name || 'Não definido'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{profile?.email || 'Não definido'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tipo de acesso:</span>
                    <span className="text-sm">Formação{profile?.role === 'admin' ? ' / Admin' : ''}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Links Rápidos</CardTitle>
                <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="link" className="w-full justify-start p-0" asChild>
                    <Link to="/formacao/cursos/novo">Criar novo curso</Link>
                  </Button>
                  <Button variant="link" className="w-full justify-start p-0" asChild>
                    <Link to="/formacao/aulas/nova">Criar nova aula</Link>
                  </Button>
                  <Button variant="link" className="w-full justify-start p-0" asChild>
                    <Link to="/formacao/materiais">Gerenciar materiais</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <LearningMonitoringDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormacaoDashboard;
