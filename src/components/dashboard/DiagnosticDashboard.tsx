
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';

interface DiagnosticInfo {
  status: 'loading' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface DiagnosticDashboardProps {
  auth: DiagnosticInfo;
  database: DiagnosticInfo;
  profile: DiagnosticInfo;
  onRetry?: () => void;
}

export const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  auth,
  database,
  profile,
  onRetry
}) => {
  const getStatusIcon = (status: DiagnosticInfo['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticInfo['status']) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Carregando</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">OK</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-500">Aviso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Diagnóstico da Plataforma
        </h2>
        <p className="text-neutral-300">
          Verificando o status dos componentes principais
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {getStatusIcon(auth.status)}
              Autenticação
            </CardTitle>
            {getStatusBadge(auth.status)}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {auth.message}
            </p>
            {auth.details && (
              <p className="text-xs text-muted-foreground mt-2">
                {auth.details}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {getStatusIcon(database.status)}
              Banco de Dados
            </CardTitle>
            {getStatusBadge(database.status)}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {database.message}
            </p>
            {database.details && (
              <p className="text-xs text-muted-foreground mt-2">
                {database.details}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {getStatusIcon(profile.status)}
              Perfil
            </CardTitle>
            {getStatusBadge(profile.status)}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {profile.message}
            </p>
            {profile.details && (
              <p className="text-xs text-muted-foreground mt-2">
                {profile.details}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {onRetry && (
        <div className="text-center">
          <button
            onClick={onRetry}
            className="bg-viverblue hover:bg-viverblue/80 text-white px-6 py-3 rounded-lg font-medium"
          >
            🔄 Tentar Novamente
          </button>
        </div>
      )}
    </div>
  );
};
