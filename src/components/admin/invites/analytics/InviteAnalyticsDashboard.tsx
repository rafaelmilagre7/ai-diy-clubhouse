
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, Clock, Target, Mail, MessageSquare, Download } from 'lucide-react';
import { useAdvancedInviteAnalytics } from '@/hooks/admin/invites/useAdvancedInviteAnalytics';
import { FunnelChart } from './components/FunnelChart';
import { ConversionChart } from './components/ConversionChart';
import { TimeAnalysisChart } from './components/TimeAnalysisChart';
import { RoleSegmentationTable } from './components/RoleSegmentationTable';

export const InviteAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const { analytics, loading } = useAdvancedInviteAnalytics(timeRange);

  const MetricCard = ({ title, value, icon: Icon, trend, subtitle }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const exportReport = () => {
    // Implementar exportação de relatório
    const reportData = {
      period: timeRange,
      generated_at: new Date().toISOString(),
      overview: analytics.overview,
      funnel: analytics.funnel,
      channels: analytics.channelPerformance
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invite-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Convites</h2>
          <p className="text-muted-foreground">
            Análise detalhada do desempenho dos convites
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
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
          
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Convites"
          value={analytics.overview.totalInvites.toLocaleString()}
          icon={Mail}
          subtitle="Enviados no período"
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${analytics.overview.conversionRate.toFixed(1)}%`}
          icon={Target}
          trend="+2.1% vs período anterior"
        />
        <MetricCard
          title="Tempo Médio de Aceitação"
          value={`${analytics.overview.averageAcceptanceTime.toFixed(1)}h`}
          icon={Clock}
          subtitle="Desde o envio até cadastro"
        />
        <MetricCard
          title="Usuários Ativos"
          value={analytics.overview.activeUsers.toLocaleString()}
          icon={Users}
          subtitle="Últimos 7 dias"
        />
      </div>

      {/* Abas de análise */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Funil de Conversão</TabsTrigger>
          <TabsTrigger value="channels">Performance por Canal</TabsTrigger>
          <TabsTrigger value="timing">Análise Temporal</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentação</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funil de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <FunnelChart data={analytics.funnel} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Taxa de Conversão</span>
                  <span className="font-bold">
                    {analytics.channelPerformance.email.conversionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Custo por Conversão</span>
                  <span className="font-bold">
                    R$ {analytics.channelPerformance.email.cost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ROI</span>
                  <span className="font-bold text-green-600">
                    {analytics.channelPerformance.email.roi.toFixed(1)}x
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Taxa de Conversão</span>
                  <span className="font-bold">
                    {analytics.channelPerformance.whatsapp.conversionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Custo por Conversão</span>
                  <span className="font-bold">
                    R$ {analytics.channelPerformance.whatsapp.cost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ROI</span>
                  <span className="font-bold text-green-600">
                    {analytics.channelPerformance.whatsapp.roi.toFixed(1)}x
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Comparação de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ConversionChart data={analytics.channelPerformance} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Melhores Dias para Envio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.timeAnalysis.bestDaysToSend.map((day, index) => (
                    <div key={day} className="flex items-center justify-between">
                      <span>{day}</span>
                      <div className="w-20 bg-gray-200 rounded">
                        <div 
                          className="bg-blue-500 rounded h-2"
                          style={{ width: `${(3 - index) * 33}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Melhores Horários</CardTitle>
              </CardHeader>
              <CardContent>
                <TimeAnalysisChart data={analytics.timeAnalysis.bestHoursToSend} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pontos de Abandono</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.timeAnalysis.abandonmentPoints.map((point) => (
                  <div key={point.stage} className="flex items-center justify-between">
                    <span>{point.stage}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 font-bold">
                        {point.abandonmentRate}%
                      </span>
                      <div className="w-20 bg-gray-200 rounded">
                        <div 
                          className="bg-red-500 rounded h-2"
                          style={{ width: `${point.abandonmentRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segmentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Papel/Role</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleSegmentationTable data={analytics.roleSegmentation} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
