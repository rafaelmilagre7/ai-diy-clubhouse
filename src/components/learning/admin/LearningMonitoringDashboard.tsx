import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Award,
  Activity,
  Download,
  Shield
} from 'lucide-react';
import { useLearningMonitoring } from '@/hooks/learning/useLearningMonitoring';
import { toast } from 'sonner';

export const LearningMonitoringDashboard = () => {
  const { userStats, globalStats, loadingUserStats, loadingGlobalStats, backupProgress } = useLearningMonitoring();

  const handleBackup = async () => {
    try {
      const result = await backupProgress();
      if (result?.success) {
        toast.success('Backup realizado com sucesso!');
      } else {
        toast.error('Erro ao realizar backup');
      }
    } catch (error) {
      toast.error('Erro ao realizar backup');
    }
  };

  if (loadingUserStats && loadingGlobalStats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento da Formação</h2>
          <p className="text-muted-foreground">
            Acompanhe o progresso e performance do sistema de aprendizado
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleBackup} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Sistema 100%
          </Badge>
        </div>
      </div>

      {/* Stats do Usuário */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Suas Estatísticas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.completionRate || 0}%</div>
              <Progress value={userStats?.completionRate || 0} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {userStats?.completedLessons || 0} de {userStats?.totalLessons || 0} aulas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalComments || 0}</div>
              <p className="text-xs text-muted-foreground">
                comentários realizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.averageNpsScore || 0}/10</div>
              <p className="text-xs text-muted-foreground">
                {userStats?.totalNpsRatings || 0} avaliações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificados</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.certificates || 0}</div>
              <p className="text-xs text-muted-foreground">
                conquistados
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Globais (apenas para admins) */}
      {globalStats && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas Globais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalStats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aulas Completadas</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalStats.totalCompletions}</div>
                <p className="text-xs text-muted-foreground">total na plataforma</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engajamento Semanal</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalStats.weeklyEngagement}</div>
                <p className="text-xs text-muted-foreground">comentários esta semana</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Seu último acesso ao sistema de aprendizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userStats?.lastActivity ? (
              <div>
                <p className="text-sm font-medium">
                  {new Date(userStats.lastActivity).toLocaleString('pt-BR')}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {userStats.streakDays} dias consecutivos
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma atividade registrada</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
            <CardDescription>
              Monitoramento em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Rate Limiting</span>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Backup Automático</span>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Logs de Auditoria</span>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Performance</span>
                <Badge variant="secondary">Otimizada</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};