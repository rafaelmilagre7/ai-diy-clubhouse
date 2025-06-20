
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  Send,
  Target
} from 'lucide-react';
import { useInvites } from '@/hooks/admin/useInvites';

export const EmailMonitoringDashboard: React.FC = () => {
  const { invites, loading } = useInvites();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calcular estatísticas baseadas nas propriedades reais do tipo Invite
  const totalInvites = invites.length;
  const usedInvites = invites.filter(invite => invite.used_at !== null).length;
  const expiredInvites = invites.filter(invite => 
    new Date(invite.expires_at) < new Date() && invite.used_at === null
  ).length;
  const pendingInvites = invites.filter(invite => 
    invite.used_at === null && new Date(invite.expires_at) >= new Date()
  ).length;

  // Calcular taxa de sucesso
  const successRate = totalInvites > 0 ? Math.round((usedInvites / totalInvites) * 100) : 0;

  // Calcular convites enviados recentemente (últimas 24h)
  const recentInvites = invites.filter(invite => {
    const createdAt = new Date(invite.created_at);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return createdAt >= yesterday;
  }).length;

  const stats = [
    {
      title: 'Total de Convites',
      value: totalInvites,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Convites Aceitos',
      value: usedInvites,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Convites Pendentes',
      value: pendingInvites,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Convites Expirados',
      value: expiredInvites,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">{successRate}%</span>
              <Badge variant={successRate >= 70 ? "default" : "secondary"}>
                {successRate >= 70 ? "Excelente" : successRate >= 50 ? "Bom" : "Precisa Melhorar"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {usedInvites} de {totalInvites} convites aceitos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{recentInvites}</span>
              <span className="text-sm text-muted-foreground">últimas 24h</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Convites enviados recentemente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Novos Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-600">{usedInvites}</span>
              <Badge variant="outline">
                Total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Usuários que aceitaram convites
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Convites Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Convites Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invites.slice(0, 5).map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Criado em {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={
                    invite.used_at 
                      ? "default" 
                      : new Date(invite.expires_at) < new Date() 
                        ? "destructive" 
                        : "secondary"
                  }
                >
                  {invite.used_at 
                    ? "Aceito" 
                    : new Date(invite.expires_at) < new Date() 
                      ? "Expirado" 
                      : "Pendente"
                  }
                </Badge>
              </div>
            ))}
            
            {invites.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum convite encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
