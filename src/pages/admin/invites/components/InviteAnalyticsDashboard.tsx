
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Mail, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { useInviteAnalytics } from '@/hooks/admin/invites/useInviteAnalytics';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const InviteAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const { analytics, loading, fetchAnalytics } = useInviteAnalytics(timeRange);

  const channelData = [
    { name: 'Email', value: analytics.sentByChannel.email, color: '#8884d8' },
    { name: 'WhatsApp', value: analytics.sentByChannel.whatsapp, color: '#82ca9d' },
    { name: 'Ambos', value: analytics.sentByChannel.both, color: '#ffc658' }
  ];

  const performanceData = [
    {
      channel: 'Email',
      envio: analytics.channelPerformance.email.sentRate,
      entrega: analytics.channelPerformance.email.deliveryRate,
      abertura: analytics.channelPerformance.email.openRate,
      clique: analytics.channelPerformance.email.clickRate
    },
    {
      channel: 'WhatsApp',
      envio: analytics.channelPerformance.whatsapp.sentRate,
      entrega: analytics.channelPerformance.whatsapp.deliveryRate,
      abertura: analytics.channelPerformance.whatsapp.openRate,
      clique: analytics.channelPerformance.whatsapp.clickRate
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
      case 'opened':
      case 'clicked':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'sent':
        return 'secondary';
      case 'delivered':
        return 'default';
      case 'opened':
        return 'default';
      case 'clicked':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando analytics...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics de Convites</h2>
          <p className="text-muted-foreground">
            Métricas de desempenho dos convites por canal de comunicação
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Convites</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalInvites}</div>
            <p className="text-xs text-muted-foreground">
              Nos últimos {timeRange === '7d' ? '7 dias' : timeRange === '30d' ? '30 dias' : '90 dias'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.deliveryStats.total > 0 
                ? formatPercentage((analytics.deliveryStats.delivered / analytics.deliveryStats.total) * 100)
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.deliveryStats.delivered} de {analytics.deliveryStats.total} enviados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Via Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.sentByChannel.email}</div>
            <p className="text-xs text-muted-foreground">
              Taxa: {formatPercentage(analytics.channelPerformance.email.deliveryRate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Via WhatsApp</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.sentByChannel.whatsapp}</div>
            <p className="text-xs text-muted-foreground">
              Taxa: {formatPercentage(analytics.channelPerformance.whatsapp.deliveryRate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Gráficos */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="channels">Por Canal</TabsTrigger>
          <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Canal</CardTitle>
                <CardDescription>Como os convites foram enviados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status de Entrega</CardTitle>
                <CardDescription>Estado atual das mensagens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Enviados</span>
                    <Badge variant="secondary">{analytics.deliveryStats.sent}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Entregues</span>
                    <Badge variant="default">{analytics.deliveryStats.delivered}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Abertos</span>
                    <Badge variant="default">{analytics.deliveryStats.opened}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clicados</span>
                    <Badge variant="default">{analytics.deliveryStats.clicked}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Falharam</span>
                    <Badge variant="destructive">{analytics.deliveryStats.failed}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Canal</CardTitle>
              <CardDescription>Comparação de métricas entre email e WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatPercentage(Number(value)), '']} />
                  <Bar dataKey="envio" fill="#8884d8" name="Taxa de Envio" />
                  <Bar dataKey="entrega" fill="#82ca9d" name="Taxa de Entrega" />
                  <Bar dataKey="abertura" fill="#ffc658" name="Taxa de Abertura" />
                  <Bar dataKey="clique" fill="#ff7300" name="Taxa de Clique" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas 50 entregas de convites</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recentActivity.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analytics.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(activity.status)}
                        <div>
                          <div className="font-medium">{activity.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.channel === 'email' ? 'Email' : 'WhatsApp'} • {' '}
                            {new Date(activity.created_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma atividade recente encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InviteAnalyticsDashboard;
