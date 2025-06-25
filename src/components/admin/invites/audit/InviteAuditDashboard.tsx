
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Mail,
  MessageSquare,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useInviteAudit } from '@/hooks/admin/invites/useInviteAudit';
import { ModernLoadingState } from '@/components/admin/analytics/ModernLoadingState';

export const InviteAuditDashboard: React.FC = () => {
  const { data, isLoading, error, runAudit, isAuditing } = useInviteAudit();

  if (isLoading) {
    return <ModernLoadingState type="chart" />;
  }

  if (error) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-6 w-6" />
            Erro na Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            Erro ao carregar auditoria: {error.message}
          </p>
          <Button 
            onClick={() => runAudit()} 
            disabled={isAuditing}
            className="mt-4"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAuditing ? 'animate-spin' : ''}`} />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-500" />
            Auditoria do Sistema de Convites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Nenhuma auditoria foi executada ainda.</p>
            <Button 
              onClick={() => runAudit()} 
              disabled={isAuditing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Shield className={`h-4 w-4 mr-2 ${isAuditing ? 'animate-spin' : ''}`} />
              Executar Auditoria
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoria do Sistema de Convites</h1>
          <p className="text-gray-600">
            Última auditoria: {new Date(data.auditedAt).toLocaleString('pt-BR')}
          </p>
        </div>
        <Button 
          onClick={() => runAudit()} 
          disabled={isAuditing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isAuditing ? 'animate-spin' : ''}`} />
          Executar Nova Auditoria
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Problemas</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.totalIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Problemas Críticos</p>
                <p className="text-3xl font-bold text-red-600">{data.summary.criticalIssues}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avisos</p>
                <p className="text-3xl font-bold text-yellow-600">{data.summary.warnings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recomendações</p>
                <p className="text-3xl font-bold text-blue-600">{data.summary.recommendations}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seções de Auditoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integridade de Dados */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-purple-500" />
              Integridade de Dados
              <Badge className={getStatusColor(data.dataIntegrity.status)}>
                {getStatusIcon(data.dataIntegrity.status)}
                {data.dataIntegrity.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.dataIntegrity.issues.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Nenhum problema de integridade detectado</span>
              </div>
            ) : (
              data.dataIntegrity.issues.map((issue, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{issue.description}</span>
                    <Badge className={getStatusColor(issue.severity === 'critical' ? 'critical' : issue.severity === 'high' ? 'warning' : 'healthy')}>
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {issue.count} registro(s) afetado(s)
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Performance
              <Badge className={getStatusColor(data.performance.status)}>
                {getStatusIcon(data.performance.status)}
                {data.performance.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.performance.metrics.avgResponseTime}ms</p>
                <p className="text-sm text-gray-600">Tempo Médio</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.performance.metrics.slowQueries}</p>
                <p className="text-sm text-gray-600">Queries Lentas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.performance.metrics.cacheHitRate}%</p>
                <p className="text-sm text-gray-600">Taxa de Cache</p>
              </div>
            </div>
            
            {data.performance.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Recomendações:</h4>
                {data.performance.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integrações */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-green-500" />
              Integrações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Email</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(data.integrations.email.status)}>
                  {getStatusIcon(data.integrations.email.status)}
                  {data.integrations.email.status}
                </Badge>
                <span className="text-sm text-gray-600">
                  {data.integrations.email.errorRate.toFixed(1)}% erro
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <span className="font-medium">WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(data.integrations.whatsapp.status)}>
                  {getStatusIcon(data.integrations.whatsapp.status)}
                  {data.integrations.whatsapp.status}
                </Badge>
                <span className="text-sm text-gray-600">
                  {data.integrations.whatsapp.errorRate.toFixed(1)}% erro
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              Segurança
              <Badge className={getStatusColor(data.security.status)}>
                {getStatusIcon(data.security.status)}
                {data.security.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.security.issues.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Nenhum problema de segurança detectado</span>
              </div>
            ) : (
              data.security.issues.map((issue, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{issue.description}</span>
                    <Badge className={getStatusColor(issue.severity === 'critical' ? 'critical' : issue.severity === 'high' ? 'warning' : 'healthy')}>
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">Tipo: {issue.type}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
