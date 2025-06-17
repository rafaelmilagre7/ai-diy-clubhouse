
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  Mail,
  Database,
  Zap,
  Clock
} from 'lucide-react';
import { useInviteEmailDiagnostic } from '@/hooks/admin/invites/useInviteEmailDiagnostic';
import { DiagnosticData } from '@/hooks/admin/invites/types';

const StatusIcon = ({ status }: { status: 'healthy' | 'warning' | 'critical' }) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

const StatusBadge = ({ status }: { status: 'healthy' | 'warning' | 'critical' }) => {
  const variants = {
    healthy: 'success' as const,
    warning: 'warning' as const,
    critical: 'destructive' as const,
  };

  const labels = {
    healthy: 'Saudável',
    warning: 'Atenção',
    critical: 'Crítico',
  };

  return (
    <Badge variant={variants[status]}>
      <StatusIcon status={status} />
      <span className="ml-1">{labels[status]}</span>
    </Badge>
  );
};

const DiagnosticCard = ({ 
  title, 
  status, 
  icon: Icon, 
  children 
}: { 
  title: string;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}) => (
  <Card className="relative">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center justify-between text-base">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </div>
        <StatusBadge status={status} />
      </CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const RecentAttemptItem = ({ attempt }: { 
  attempt: {
    id: string;
    email: string;
    status: string;
    method_attempted: string;
    created_at: string;
    error_message?: string;
  }
}) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-sm">{attempt.email}</span>
        <Badge variant={attempt.status === 'sent' ? 'success' : 'destructive'}>
          {attempt.status}
        </Badge>
      </div>
      <div className="text-xs text-gray-500">
        Método: {attempt.method_attempted} • {new Date(attempt.created_at).toLocaleString('pt-BR')}
      </div>
      {attempt.error_message && (
        <div className="text-xs text-red-600 mt-1">
          Erro: {attempt.error_message}
        </div>
      )}
    </div>
  </div>
);

export default function InviteSystemDiagnostic() {
  const { 
    runDiagnostic, 
    isRunning, 
    lastDiagnostic, 
    systemStatus,
    testEmailSend,
    recentAttempts,
    isLoading
  } = useInviteEmailDiagnostic();

  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  const handleRunDiagnostic = async () => {
    try {
      await runDiagnostic();
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    
    const result = await testEmailSend(testEmail);
    setTestResult(result);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Diagnóstico do Sistema de Convites
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={systemStatus} />
              <Button 
                onClick={handleRunDiagnostic}
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Executar Diagnóstico
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Última verificação: {new Date(lastDiagnostic.timestamp).toLocaleString('pt-BR')}
          </div>
          {lastDiagnostic.recommendations.length > 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <strong>Recomendações:</strong>
                  <ul className="list-disc pl-4 space-y-1">
                    {lastDiagnostic.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DiagnosticCard
          title="Configurações"
          status={lastDiagnostic.configStatus}
          icon={Settings}
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Chave Resend</span>
              <Badge variant={lastDiagnostic.details.resendApiKey ? 'success' : 'destructive'}>
                {lastDiagnostic.details.resendApiKey ? 'OK' : 'Faltando'}
              </Badge>
            </div>
          </div>
        </DiagnosticCard>

        <DiagnosticCard
          title="Banco de Dados"
          status={lastDiagnostic.supabaseStatus}
          icon={Database}
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Conexão</span>
              <Badge variant={lastDiagnostic.supabaseStatus === 'healthy' ? 'success' : 'destructive'}>
                {lastDiagnostic.supabaseStatus === 'healthy' ? 'Conectado' : 'Erro'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Tentativas</span>
              <span className="font-medium">{lastDiagnostic.details.totalAttempts}</span>
            </div>
          </div>
        </DiagnosticCard>

        <DiagnosticCard
          title="Edge Function"
          status={lastDiagnostic.edgeFunctionStatus}
          icon={Zap}
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant={lastDiagnostic.edgeFunctionStatus === 'healthy' ? 'success' : 'destructive'}>
                {lastDiagnostic.edgeFunctionStatus === 'healthy' ? 'Online' : 'Problema'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Versão</span>
              <span className="text-xs text-gray-500">{lastDiagnostic.details.edgeFunctionVersion}</span>
            </div>
          </div>
        </DiagnosticCard>

        <DiagnosticCard
          title="Serviço Resend"
          status={lastDiagnostic.resendStatus}
          icon={Mail}
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Taxa de Sucesso</span>
              <span className="font-medium">{lastDiagnostic.details.successRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant={lastDiagnostic.resendStatus === 'healthy' ? 'success' : 'destructive'}>
                {lastDiagnostic.resendStatus === 'healthy' ? 'OK' : 'Problema'}
              </Badge>
            </div>
          </div>
        </DiagnosticCard>
      </div>

      {/* Test Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Teste de Envio de Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Digite um email para teste"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <Button 
              onClick={handleTestEmail}
              disabled={!testEmail || isLoading}
              size="sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Testar Envio'
              )}
            </Button>
          </div>
          
          {testResult && (
            <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                    {testResult.message}
                  </span>
                </div>
                {testResult.error && (
                  <div className="mt-2 text-sm text-red-700">
                    <strong>Erro:</strong> {testResult.error}
                  </div>
                )}
                {testResult.method && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Método:</strong> {testResult.method}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Tentativas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAttempts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma tentativa de envio registrada</p>
              <p className="text-sm mt-1">Execute um diagnóstico para verificar o sistema</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <RecentAttemptItem key={attempt.id} attempt={attempt} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
