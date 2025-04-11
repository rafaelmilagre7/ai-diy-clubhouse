
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart as RechartsBarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { 
  Users, 
  FileText, 
  Award, 
  Clock, 
  TrendingUp, 
  Activity,
  Calendar,
  BarChart as BarChartIcon,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";

// Mock data for now - will connect to Supabase later
const overviewData = {
  totalUsers: 264,
  totalSolutions: 18,
  completedImplementations: 735,
  averageTime: 28, // in minutes
  userGrowth: 12.5, // percentage
  implementationRate: 72.3, // percentage
};

const engagementData = [
  { name: "Seg", value: 34 },
  { name: "Ter", value: 42 },
  { name: "Qua", value: 67 },
  { name: "Qui", value: 53 },
  { name: "Sex", value: 49 },
  { name: "Sab", value: 22 },
  { name: "Dom", value: 19 },
];

const completionRateData = [
  { name: "Landing", completion: 100 },
  { name: "Visão Geral", completion: 92 },
  { name: "Preparação", completion: 87 },
  { name: "Implementação", completion: 76 },
  { name: "Verificação", completion: 68 },
  { name: "Resultados", completion: 61 },
  { name: "Otimização", completion: 54 },
  { name: "Celebração", completion: 52 },
];

// Card component for stats
const StatCard = ({ title, value, icon: Icon, trend, trendValue }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: "up" | "down"; 
  trendValue?: string | number;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend && trendValue && (
              <div className={`flex items-center mt-2 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span>{trendValue}% que o mês anterior</span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-md">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral da plataforma DIY
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-[400px]">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="7d">7 dias</TabsTrigger>
            <TabsTrigger value="30d">30 dias</TabsTrigger>
            <TabsTrigger value="90d">90 dias</TabsTrigger>
            <TabsTrigger value="all">Todo período</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total de Membros" 
          value={overviewData.totalUsers} 
          icon={Users} 
          trend="up" 
          trendValue={overviewData.userGrowth} 
        />
        <StatCard 
          title="Soluções Disponíveis" 
          value={overviewData.totalSolutions} 
          icon={FileText} 
        />
        <StatCard 
          title="Implementações Completas" 
          value={overviewData.completedImplementations} 
          icon={Award} 
          trend="up" 
          trendValue={8.3} 
        />
        <StatCard 
          title="Tempo Médio de Implementação" 
          value={`${overviewData.averageTime} min`} 
          icon={Clock} 
          trend="down" 
          trendValue={4.2} 
        />
        <StatCard 
          title="Taxa de Implementação" 
          value={`${overviewData.implementationRate}%`} 
          icon={TrendingUp} 
          trend="up" 
          trendValue={3.7} 
        />
        <StatCard 
          title="Atividade Diária" 
          value="36 usuários ativos" 
          icon={Activity} 
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5" />
              <span>Engajamento por Dia</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart
                data={engagementData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0ABAB5" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>Taxa de Conclusão por Módulo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart
                data={completionRateData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completion" stroke="#0ABAB5" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="h-10 w-10 rounded-full bg-viverblue/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-viverblue" />
              </div>
              <div>
                <p className="font-medium">João Silva completou a implementação</p>
                <p className="text-sm text-muted-foreground">Assistente de vendas no Instagram</p>
                <p className="text-xs text-muted-foreground mt-1">Hoje às 14:32</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="h-10 w-10 rounded-full bg-viverblue/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-viverblue" />
              </div>
              <div>
                <p className="font-medium">Nova solução publicada</p>
                <p className="text-sm text-muted-foreground">Automação de atendimento ao cliente em tempo real</p>
                <p className="text-xs text-muted-foreground mt-1">Ontem às 17:45</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="h-10 w-10 rounded-full bg-viverblue/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-viverblue" />
              </div>
              <div>
                <p className="font-medium">Maria Oliveira ganhou badge</p>
                <p className="text-sm text-muted-foreground">Especialista em Automação de Marketing</p>
                <p className="text-xs text-muted-foreground mt-1">2 dias atrás</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-viverblue/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-viverblue" />
              </div>
              <div>
                <p className="font-medium">Workshop agendado</p>
                <p className="text-sm text-muted-foreground">Implementação de IA Generativa em Vendas</p>
                <p className="text-xs text-muted-foreground mt-1">3 dias atrás</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
