
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, BookOpen, AlertTriangle, Download } from 'lucide-react';

interface AccessStats {
  totalAttempts: number;
  successfulAccess: number;
  deniedAccess: number;
  uniqueUsers: number;
  topCourses: Array<{ name: string; attempts: number; success_rate: number }>;
  accessByRole: Array<{ role: string; count: number }>;
  dailyTrends: Array<{ date: string; successful: number; denied: number }>;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6'];

export const AccessAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');

  const { data: accessStats, isLoading } = useQuery({
    queryKey: ['access-analytics', dateRange],
    queryFn: async (): Promise<AccessStats> => {
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Buscar dados de analytics
      const { data: analyticsData, error } = await supabase
        .from('analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .like('event_type', 'learning_%');

      if (error) throw error;

      // Processar dados
      const totalAttempts = analyticsData?.length || 0;
      const successfulAccess = analyticsData?.filter(a => 
        a.event_data?.success === true
      ).length || 0;
      const deniedAccess = totalAttempts - successfulAccess;
      
      const uniqueUsers = new Set(analyticsData?.map(a => a.user_id)).size;

      // Top cursos
      const courseAttempts = new Map();
      analyticsData?.forEach(a => {
        const courseId = a.event_data?.course_id;
        if (courseId) {
          const current = courseAttempts.get(courseId) || { attempts: 0, successes: 0 };
          current.attempts++;
          if (a.event_data?.success) current.successes++;
          courseAttempts.set(courseId, current);
        }
      });

      const topCourses = Array.from(courseAttempts.entries())
        .map(([courseId, stats]) => ({
          name: `Curso ${courseId.substring(0, 8)}`,
          attempts: stats.attempts,
          success_rate: (stats.successes / stats.attempts) * 100
        }))
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 5);

      // Acesso por role
      const roleCount = new Map();
      analyticsData?.forEach(a => {
        const role = a.event_data?.user_role || 'unknown';
        roleCount.set(role, (roleCount.get(role) || 0) + 1);
      });

      const accessByRole = Array.from(roleCount.entries()).map(([role, count]) => ({
        role,
        count
      }));

      // Tendências diárias
      const dailyData = new Map();
      analyticsData?.forEach(a => {
        const date = new Date(a.created_at).toISOString().split('T')[0];
        const current = dailyData.get(date) || { successful: 0, denied: 0 };
        if (a.event_data?.success) {
          current.successful++;
        } else {
          current.denied++;
        }
        dailyData.set(date, current);
      });

      const dailyTrends = Array.from(dailyData.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalAttempts,
        successfulAccess,
        deniedAccess,
        uniqueUsers,
        topCourses,
        accessByRole,
        dailyTrends
      };
    }
  });

  const exportData = () => {
    if (!accessStats) return;
    
    const dataToExport = {
      generatedAt: new Date().toISOString(),
      period: dateRange,
      stats: accessStats
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-analytics-${dateRange}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Acesso</h2>
          <p className="text-muted-foreground">
            Monitore tentativas de acesso e padrões de uso dos cursos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1 border rounded-md"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tentativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessStats?.totalAttempts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Permitidos</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {accessStats?.successfulAccess || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {accessStats?.totalAttempts ? 
                Math.round((accessStats.successfulAccess / accessStats.totalAttempts) * 100) : 0}% 
              de sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Negados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {accessStats?.deniedAccess || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessStats?.uniqueUsers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="courses">Top Cursos</TabsTrigger>
          <TabsTrigger value="roles">Por Role</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Acessos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={accessStats?.dailyTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="successful" fill="#10B981" name="Permitidos" />
                  <Bar dataKey="denied" fill="#EF4444" name="Negados" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cursos Mais Acessados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accessStats?.topCourses?.map((course, index) => (
                  <div key={course.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{course.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{course.attempts} tentativas</div>
                      <div className="text-sm text-muted-foreground">
                        {course.success_rate.toFixed(1)}% sucesso
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Role</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={accessStats?.accessByRole || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ role, count }) => `${role}: ${count}`}
                  >
                    {accessStats?.accessByRole?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
