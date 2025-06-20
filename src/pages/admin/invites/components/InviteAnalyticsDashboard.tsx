
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mail, 
  MessageCircle, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useInviteAnalytics } from "@/hooks/admin/invites/useInviteAnalytics";
import { Progress } from "@/components/ui/progress";

const InviteAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const { analytics, loading, fetchAnalytics } = useInviteAnalytics(timeRange);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'opened':
      case 'clicked':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'default';
      case 'opened':
      case 'clicked':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Convites</h2>
          <p className="text-muted-foreground">
            Acompanhe o desempenho dos convites por canal de comunicação
          </p>
        </div>
        <div className="flex gap-2">
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
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Convites</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalInvites}</div>
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
              {analytics.totalInvites > 0 
                ? Math.round((analytics.sentByChannel.email / analytics.totalInvites) * 100)
                : 0}% do total
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
              {analytics.totalInvites > 0 
                ? Math.round((analytics.sentByChannel.whatsapp / analytics.totalInvites) * 100)
                : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ambos os Canais</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.sentByChannel.both}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalInvites > 0 
                ? Math.round((analytics.sentByChannel.both / analytics.totalInvites) * 100)
                : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance por canal */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Canal</CardTitle>
            <CardDescription>
              Taxas de entrega e engajamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Email</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Taxa de Envio</span>
                  <span>{analytics.channelPerformance.email.sentRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.channelPerformance.email.sentRate} />
                
                <div className="flex justify-between text-sm">
                  <span>Taxa de Entrega</span>
                  <span>{analytics.channelPerformance.email.deliveryRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.channelPerformance.email.deliveryRate} />
                
                <div className="flex justify-between text-sm">
                  <span>Taxa de Abertura</span>
                  <span>{analytics.channelPerformance.email.openRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.channelPerformance.email.openRate} />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium">WhatsApp</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Taxa de Envio</span>
                  <span>{analytics.channelPerformance.whatsapp.sentRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.channelPerformance.whatsapp.sentRate} />
                
                <div className="flex justify-between text-sm">
                  <span>Taxa de Entrega</span>
                  <span>{analytics.channelPerformance.whatsapp.deliveryRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.channelPerformance.whatsapp.deliveryRate} />
                
                <div className="flex justify-between text-sm">
                  <span>Taxa de Visualização</span>
                  <span>{analytics.channelPerformance.whatsapp.openRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.channelPerformance.whatsapp.openRate} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividade recente */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas entregas de convites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.length > 0 ? (
                analytics.recentActivity.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      {activity.channel === 'email' ? (
                        <Mail className="h-4 w-4 text-blue-500" />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-green-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {activity.email || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(activity.status)}
                      <Badge variant={getStatusColor(activity.status) as any}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas de entrega detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Entrega</CardTitle>
          <CardDescription>
            Detalhamento dos status de entrega
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.deliveryStats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.deliveryStats.sent}
              </div>
              <div className="text-sm text-muted-foreground">Enviados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {analytics.deliveryStats.delivered}
              </div>
              <div className="text-sm text-muted-foreground">Entregues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.deliveryStats.opened}
              </div>
              <div className="text-sm text-muted-foreground">Abertos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.deliveryStats.clicked}
              </div>
              <div className="text-sm text-muted-foreground">Clicados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analytics.deliveryStats.failed}
              </div>
              <div className="text-sm text-muted-foreground">Falharam</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAnalyticsDashboard;
