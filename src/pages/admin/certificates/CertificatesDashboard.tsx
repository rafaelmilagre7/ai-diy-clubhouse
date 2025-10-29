import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, FileText, Users, TrendingUp, Download, Clock, CheckCircle, Settings, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useDynamicSEO } from "@/hooks/seo/useDynamicSEO";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--strategy))', 'hsl(var(--operational))'];

export default function CertificatesDashboard() {
  useDynamicSEO({
    title: 'Dashboard de Certificados',
    description: 'Gerencie e monitore todos os aspectos dos certificados da plataforma.',
    keywords: 'certificados, dashboard, gestão, relatórios'
  });

  // Buscar estatísticas gerais
  const { data: stats, isLoading } = useQuery({
    queryKey: ['certificates-stats'],
    queryFn: async () => {
      const [solutionCerts, learningCerts, templates] = await Promise.all([
        supabase.from('solution_certificates').select('id, issued_at'),
        supabase.from('learning_certificates').select('id, issued_at'),
        supabase.from('solution_certificate_templates').select('id, is_active')
      ]);

      const totalEmitidos = (solutionCerts.data?.length || 0) + (learningCerts.data?.length || 0);
      
      // Emissões do mês
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const emissoesMes = [...(solutionCerts.data || []), ...(learningCerts.data || [])].filter(
        cert => new Date(cert.issued_at) >= inicioMes
      ).length;

      // Taxa de conversão (aproximada)
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      const taxaConversao = totalUsers ? ((totalEmitidos / totalUsers) * 100).toFixed(1) : '0';

      return {
        totalEmitidos,
        emissoesMes,
        taxaConversao,
        templatesAtivos: templates.data?.filter(t => t.is_active).length || 0,
        templatesTotal: templates.data?.length || 0,
        certificadosSolucoes: solutionCerts.data?.length || 0,
        certificadosCursos: learningCerts.data?.length || 0
      };
    }
  });

  // Dados para o gráfico de emissões ao longo do tempo
  const { data: chartData } = useQuery({
    queryKey: ['certificates-timeline'],
    queryFn: async () => {
      const ultimos30Dias = subDays(new Date(), 30);
      
      const [solutionCerts, learningCerts] = await Promise.all([
        supabase
          .from('solution_certificates')
          .select('issued_at')
          .gte('issued_at', ultimos30Dias.toISOString()),
        supabase
          .from('learning_certificates')
          .select('issued_at')
          .gte('issued_at', ultimos30Dias.toISOString())
      ]);

      // Agrupar por dia
      const dayMap: Record<string, number> = {};
      [...(solutionCerts.data || []), ...(learningCerts.data || [])].forEach(cert => {
        const day = format(new Date(cert.issued_at), 'dd/MM');
        dayMap[day] = (dayMap[day] || 0) + 1;
      });

      return Object.entries(dayMap)
        .map(([day, count]) => ({ day, count }))
        .slice(-14); // Últimos 14 dias
    }
  });

  // Dados para o gráfico de distribuição
  const pieData = stats ? [
    { name: 'Soluções', value: stats.certificadosSolucoes },
    { name: 'Cursos', value: stats.certificadosCursos }
  ] : [];

  return (
    <div className="container mx-auto py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Award className="h-8 w-8 text-primary" />
            Dashboard de Certificados
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e monitore todos os aspectos dos certificados da plataforma
          </p>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Total Emitidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalEmitidos || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Desde o início</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Emissões do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-status-success">{stats?.emissoesMes || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{format(new Date(), 'MMMM yyyy', { locale: ptBR })}</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-strategy">{stats?.taxaConversao || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Usuários com certificado</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-operational">
              {stats?.templatesAtivos || 0}
              <span className="text-base text-muted-foreground">/{stats?.templatesTotal || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Templates disponíveis</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Emissões ao Longo do Tempo */}
        <Card>
          <CardHeader>
            <CardTitle>Emissões nos Últimos 14 Dias</CardTitle>
            <CardDescription>Evolução diária de certificados emitidos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
            <CardDescription>Certificados de soluções vs cursos</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Ação Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Templates
            </CardTitle>
            <CardDescription>Gerencie templates de certificados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Customize designs e crie novos templates para certificados
            </p>
            <Button asChild className="w-full">
              <Link to="/admin/certificates/templates">
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar Templates
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-strategy" />
              Sincronização de Vídeos
            </CardTitle>
            <CardDescription>Atualize durações dos vídeos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sincronize durações para cálculo preciso de carga horária
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/certificates/video-sync">
                <Zap className="h-4 w-4 mr-2" />
                Sincronizar Durações
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-status-success" />
              Geração Retroativa
            </CardTitle>
            <CardDescription>Gere certificados pendentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Emita certificados para completações anteriores
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/certificates/retroactive">
                <Award className="h-4 w-4 mr-2" />
                Gerar Retroativos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Links para Outras Páginas */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento por Tipo</CardTitle>
          <CardDescription>Acesse certificados específicos por categoria</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button asChild variant="outline" className="h-auto py-4">
            <Link to="/admin/certificates/solutions" className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-semibold">Certificados de Soluções</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Gerencie certificados de implementações de IA
              </span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-4">
            <Link to="/admin/certificates/courses" className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-strategy" />
                <span className="font-semibold">Certificados de Cursos</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Gerencie certificados de cursos da formação
              </span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
