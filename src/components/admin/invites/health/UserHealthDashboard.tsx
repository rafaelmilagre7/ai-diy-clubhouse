
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { HealthCheckInitButton } from './HealthCheckInitButton';
import { generateSimulatedHealthData } from '@/utils/healthCheckInitializer';
import { toast } from 'sonner';

interface HealthMetric {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  healthScore: number;
  riskLevel: 'healthy' | 'at_risk' | 'critical';
  lastActivity: string;
  engagementScore: number;
  progressScore: number;
}

export const UserHealthDashboard = () => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    healthyUsers: 0,
    atRiskUsers: 0,
    criticalUsers: 0,
    averageScore: 0
  });

  const generateMockHealthMetrics = () => {
    const mockData = generateSimulatedHealthData();
    const { totalUsers, healthyUsers, atRiskUsers, criticalUsers, averageScore } = mockData.details;
    
    setStats({
      totalUsers,
      healthyUsers,
      atRiskUsers,
      criticalUsers,
      averageScore
    });

    // Gerar dados detalhados dos usuários para a tabela
    const mockUsers: HealthMetric[] = [];
    
    // Usuários saudáveis
    for (let i = 0; i < healthyUsers; i++) {
      mockUsers.push({
        id: `healthy-${i}`,
        userId: `user-${i}`,
        userName: `Usuário Saudável ${i + 1}`,
        userEmail: `usuario${i + 1}@exemplo.com`,
        healthScore: Math.floor(Math.random() * 30) + 70, // 70-100
        riskLevel: 'healthy',
        lastActivity: `${Math.floor(Math.random() * 7) + 1} dias atrás`,
        engagementScore: Math.floor(Math.random() * 30) + 70,
        progressScore: Math.floor(Math.random() * 30) + 70
      });
    }

    // Usuários em risco
    for (let i = 0; i < atRiskUsers; i++) {
      mockUsers.push({
        id: `at-risk-${i}`,
        userId: `user-risk-${i}`,
        userName: `Usuário Em Risco ${i + 1}`,
        userEmail: `risco${i + 1}@exemplo.com`,
        healthScore: Math.floor(Math.random() * 40) + 30, // 30-69
        riskLevel: 'at_risk',
        lastActivity: `${Math.floor(Math.random() * 14) + 7} dias atrás`,
        engagementScore: Math.floor(Math.random() * 40) + 30,
        progressScore: Math.floor(Math.random() * 40) + 30
      });
    }

    // Usuários críticos
    for (let i = 0; i < criticalUsers; i++) {
      mockUsers.push({
        id: `critical-${i}`,
        userId: `user-critical-${i}`,
        userName: `Usuário Crítico ${i + 1}`,
        userEmail: `critico${i + 1}@exemplo.com`,
        healthScore: Math.floor(Math.random() * 30), // 0-29
        riskLevel: 'critical',
        lastActivity: `${Math.floor(Math.random() * 30) + 15} dias atrás`,
        engagementScore: Math.floor(Math.random() * 30),
        progressScore: Math.floor(Math.random() * 30)
      });
    }

    setHealthMetrics(mockUsers);
  };

  const handleInitialized = () => {
    generateMockHealthMetrics();
    toast.success('Dashboard de Health Check atualizado com sucesso!');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      generateMockHealthMetrics();
      setIsLoading(false);
      toast.success('Dados atualizados com sucesso!');
    }, 1000);
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'healthy': return 'Saudável';
      case 'at_risk': return 'Em Risco';
      case 'critical': return 'Crítico';
      default: return 'Desconhecido';
    }
  };

  useEffect(() => {
    generateMockHealthMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Health Check</h2>
          <p className="text-muted-foreground">
            Monitore a saúde e engajamento dos usuários em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <HealthCheckInitButton onInitialized={handleInitialized} />
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saudáveis</p>
                <p className="text-2xl font-bold text-green-600">{stats.healthyUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Risco</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.atRiskUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Detalhes dos Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Usuário</th>
                    <th className="text-left p-2">Health Score</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Última Atividade</th>
                    <th className="text-left p-2">Engajamento</th>
                    <th className="text-left p-2">Progresso</th>
                  </tr>
                </thead>
                <tbody>
                  {healthMetrics.slice(0, 10).map((metric) => (
                    <tr key={metric.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{metric.userName}</p>
                          <p className="text-sm text-muted-foreground">{metric.userEmail}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{metric.healthScore}</span>
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${metric.riskLevel === 'healthy' ? 'bg-green-500' : metric.riskLevel === 'at_risk' ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${metric.healthScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge className={getRiskBadgeColor(metric.riskLevel)}>
                          {getRiskLabel(metric.riskLevel)}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {metric.lastActivity}
                      </td>
                      <td className="p-2 text-sm">
                        {metric.engagementScore}%
                      </td>
                      <td className="p-2 text-sm">
                        {metric.progressScore}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado de health check disponível</p>
              <p className="text-sm">Use o botão "Inicializar Health Check" para gerar dados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
