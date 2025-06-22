
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Users,
  UserX,
  Calendar,
  RefreshCw,
  Trash2,
  Mail
} from 'lucide-react';

export const UserHealthDashboard = () => {
  // Dados simulados até implementarmos a lógica completa
  const healthData = {
    overview: {
      totalUsers: 1245,
      healthyUsers: 1058,
      warningUsers: 142,
      criticalUsers: 45,
      healthScore: 85
    },
    issues: [
      {
        type: 'inactive',
        title: 'Usuários Inativos',
        count: 89,
        description: 'Sem login há 30+ dias',
        severity: 'warning',
        action: 'Re-engajamento'
      },
      {
        type: 'incomplete_onboarding',
        title: 'Onboarding Incompleto',
        count: 34,
        description: 'Onboarding parado há 7+ dias',
        severity: 'warning',
        action: 'Lembrete'
      },
      {
        type: 'no_progress',
        title: 'Sem Progresso',
        count: 28,
        description: 'Nenhuma solução iniciada',
        severity: 'critical',
        action: 'Suporte'
      },
      {
        type: 'incomplete_profile',
        title: 'Perfil Incompleto',
        count: 56,
        description: 'Dados essenciais ausentes',
        severity: 'info',
        action: 'Solicitar dados'
      },
      {
        type: 'duplicates',
        title: 'Possíveis Duplicatas',
        count: 12,
        description: 'Emails similares detectados',
        severity: 'critical',
        action: 'Verificar'
      }
    ]
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'warning': return AlertTriangle;
      case 'info': return CheckCircle;
      default: return CheckCircle;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Health Check dos Usuários</h2>
          <p className="text-muted-foreground">
            Monitore a saúde geral da base de usuários e identifique problemas
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            Limpeza Automática
          </Button>
        </div>
      </div>

      {/* Score Geral de Saúde */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            Score Geral de Saúde
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getHealthColor(healthData.overview.healthScore)}`}>
                {healthData.overview.healthScore}
              </div>
              <div className="text-muted-foreground">Score de Saúde</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {healthData.overview.healthyUsers}
                </div>
                <div className="text-sm text-muted-foreground">Saudáveis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {healthData.overview.warningUsers}
                </div>
                <div className="text-sm text-muted-foreground">Atenção</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {healthData.overview.criticalUsers}
                </div>
                <div className="text-sm text-muted-foreground">Críticos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {healthData.overview.totalUsers}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problemas Identificados */}
      <div className="grid gap-4">
        {healthData.issues.map((issue, index) => {
          const SeverityIcon = getSeverityIcon(issue.severity);
          
          return (
            <Card key={index}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <SeverityIcon className={`w-8 h-8 ${getSeverityColor(issue.severity)}`} />
                  
                  <div>
                    <h3 className="font-semibold">{issue.title}</h3>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{issue.count}</div>
                    <div className="text-xs text-muted-foreground">usuários</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Ver Lista
                    </Button>
                    <Button size="sm">
                      {issue.action}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Mail className="w-6 h-6" />
              <span>Campanha de Re-engajamento</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="w-6 h-6" />
              <span>Completar Perfis</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Trash2 className="w-6 h-6" />
              <span>Limpeza de Duplicatas</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nota sobre implementação */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Sistema de Health Check</h4>
              <p className="text-sm text-blue-700">
                Este dashboard será totalmente implementado com dados reais e automações inteligentes. 
                A lógica incluirá análise de comportamento, detecção de padrões e ações automatizadas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
