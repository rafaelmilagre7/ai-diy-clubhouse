
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Eye, Clock, CheckCircle } from 'lucide-react';

// Dados mockados para demonstração
const accessData = [
  { name: 'Seg', acessos: 45, negados: 12 },
  { name: 'Ter', acessos: 52, negados: 8 },
  { name: 'Qua', acessos: 38, negados: 15 },
  { name: 'Qui', acessos: 65, negados: 6 },
  { name: 'Sex', acessos: 58, negados: 9 },
  { name: 'Sáb', acessos: 32, negados: 4 },
  { name: 'Dom', acessos: 28, negados: 3 }
];

const courseAccessData = [
  { curso: 'IA para Negócios', acessos: 145, conversao: 78 },
  { curso: 'Automação', acessos: 89, conversao: 65 },
  { curso: 'Data Science', acessos: 123, conversao: 82 },
  { curso: 'Machine Learning', acessos: 67, conversao: 45 }
];

const roleDistribution = [
  { name: 'Member', value: 68, color: '#0ABAB5' },
  { name: 'Admin', value: 12, color: '#8B5CF6' },
  { name: 'Formacao', value: 20, color: '#F59E0B' }
];

const AccessAnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics de Acesso</h1>
        <p className="text-muted-foreground mt-2">
          Métricas detalhadas sobre acessos aos cursos e controle de permissões
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Acessos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Negados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">-5% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">+3% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24min</div>
            <p className="text-xs text-muted-foreground">Tempo médio por sessão</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acessos por Dia</CardTitle>
            <CardDescription>Acessos permitidos vs negados na última semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="acessos" fill="#0ABAB5" name="Permitidos" />
                <Bar dataKey="negados" fill="#EF4444" name="Negados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Role</CardTitle>
            <CardDescription>Distribuição de acessos por tipo de usuário</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de cursos mais acessados */}
      <Card>
        <CardHeader>
          <CardTitle>Cursos Mais Acessados</CardTitle>
          <CardDescription>Performance de acesso por curso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courseAccessData.map((curso, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{curso.curso}</h4>
                  <p className="text-sm text-muted-foreground">{curso.acessos} acessos totais</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{curso.conversao}%</div>
                  <p className="text-xs text-muted-foreground">Taxa de conversão</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessAnalyticsDashboard;
