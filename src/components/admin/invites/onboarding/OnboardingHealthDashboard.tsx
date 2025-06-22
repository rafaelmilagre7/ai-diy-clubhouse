
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingDown,
  Mail,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { useOnboardingHealth } from '@/hooks/admin/invites/useOnboardingHealth';

export const OnboardingHealthDashboard = () => {
  const { data, loading, refresh } = useOnboardingHealth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'personal_info': return 'bg-blue-500';
      case 'business_info': return 'bg-green-500';
      case 'goals': return 'bg-yellow-500';
      case 'ai_experience': return 'bg-purple-500';
      case 'personalization': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getStageName = (stage: string) => {
    const names = {
      'personal_info': 'Informações Pessoais',
      'business_info': 'Informações Empresariais',
      'goals': 'Objetivos',
      'ai_experience': 'Experiência com IA',
      'personalization': 'Personalização'
    };
    return names[stage as keyof typeof names] || stage;
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Painel de Onboarding Inteligente</h2>
          <p className="text-muted-foreground">
            Monitore e otimize o processo de onboarding dos usuários
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários em Onboarding</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.total} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.overview.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.overview.completed} concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.avgCompletionTime.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Para completar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisam Ajuda</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.overview.needsHelp}
            </div>
            <p className="text-xs text-muted-foreground">
              Abandonaram há 24h+
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funil de Onboarding */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.funnel.map((stage, index) => {
              const completion = data.overview.total > 0 
                ? (stage.users / data.overview.total) * 100 
                : 0;
              
              const dropoff = index > 0 
                ? data.funnel[index - 1].users > 0
                  ? ((data.funnel[index - 1].users - stage.users) / data.funnel[index - 1].users) * 100
                  : 0
                : 0;

              return (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{getStageName(stage.stage)}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{stage.users}</span>
                      <span className="text-sm text-muted-foreground">
                        ({completion.toFixed(1)}%)
                      </span>
                      {index > 0 && dropoff > 0 && (
                        <Badge variant="outline" className="text-red-600">
                          -{dropoff.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress value={completion} className="h-3" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usuários que Precisam de Ajuda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Usuários que Precisam de Ajuda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stuckUsers.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <div className="font-medium">{user.name || user.email}</div>
                  <div className="text-sm text-muted-foreground">
                    Parado em: {getStageName(user.currentStage)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Último acesso: {new Date(user.lastActivity).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={user.daysStuck > 7 ? 'destructive' : 'outline'}
                    className={user.daysStuck > 7 ? '' : 'text-orange-600'}
                  >
                    {user.daysStuck} dias
                  </Badge>
                  
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {data.stuckUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>Ótimo! Nenhum usuário precisa de ajuda no momento.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gargalos Identificados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
            Gargalos Identificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.bottlenecks.map((bottleneck, index) => (
              <div key={index} className="p-4 border rounded space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{getStageName(bottleneck.stage)}</h4>
                  <Badge variant="destructive">
                    {bottleneck.abandonmentRate.toFixed(1)}% abandono
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tempo médio na etapa: {bottleneck.avgTimeSpent.toFixed(1)} horas
                </p>
                <p className="text-sm text-muted-foreground">
                  {bottleneck.usersStuck} usuários presos nesta etapa
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Enviar Lembrete
                  </Button>
                  <Button size="sm" variant="outline">
                    Analisar Detalhes
                  </Button>
                </div>
              </div>
            ))}
            
            {data.bottlenecks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>Nenhum gargalo crítico identificado!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
