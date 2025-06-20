
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertCircle, CheckCircle, RefreshCw, ChevronDown, Mail, Key, Globe, Clock, Bug } from 'lucide-react';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';

export const ResendDiagnostics: React.FC = () => {
  const { healthStatus, isChecking, performHealthCheck, debugInfo } = useResendHealthCheck();
  const [showDebug, setShowDebug] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'connected':
      case 'valid':
        return 'text-green-500';
      case 'error':
      case 'disconnected':
      case 'invalid':
        return 'text-red-500';
      case 'slow':
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: boolean | string, trueLabel = 'OK', falseLabel = 'Erro') => {
    const isOk = typeof status === 'boolean' ? status : status === 'operational' || status === 'connected';
    return (
      <Badge variant={isOk ? "default" : "destructive"} className={isOk ? "bg-green-500" : ""}>
        {isOk ? trueLabel : falseLabel}
      </Badge>
    );
  };

  const getDiagnosticLevel = () => {
    if (healthStatus.isHealthy) return 'success';
    if (healthStatus.apiKeyValid) return 'warning';
    return 'error';
  };

  const getDiagnosticMessage = () => {
    if (healthStatus.isHealthy) {
      return 'Sistema de email totalmente operacional';
    }
    if (healthStatus.apiKeyValid) {
      return 'API key válida, mas há problemas de conectividade';
    }
    return 'Problemas críticos detectados no sistema de email';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Diagnóstico do Resend
            </CardTitle>
            <CardDescription>
              Verificação detalhada do sistema de email
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
            ) : healthStatus.isHealthy ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            {getStatusBadge(healthStatus.isHealthy, 'Sistema OK', 'Com Problemas')}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Key className={`h-5 w-5 ${getStatusColor(healthStatus.apiKeyValid ? 'valid' : 'invalid')}`} />
            <div>
              <div className="font-medium">API Key</div>
              {getStatusBadge(healthStatus.apiKeyValid, 'Válida', 'Inválida')}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Globe className={`h-5 w-5 ${getStatusColor(healthStatus.connectivity)}`} />
            <div>
              <div className="font-medium">Conectividade</div>
              {getStatusBadge(healthStatus.connectivity === 'connected', 'Conectado', 'Erro')}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Mail className={`h-5 w-5 ${getStatusColor(healthStatus.domainValid ? 'valid' : 'invalid')}`} />
            <div>
              <div className="font-medium">Domínio</div>
              {getStatusBadge(healthStatus.domainValid, 'Verificado', 'Pendente')}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <div className="font-medium">Latência</div>
              <Badge variant="outline">
                {healthStatus.responseTime ? `${healthStatus.responseTime}ms` : '--'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Diagnóstico Geral */}
        <div className={`p-4 rounded-lg border-l-4 ${
          getDiagnosticLevel() === 'success' ? 'bg-green-50 border-green-400' :
          getDiagnosticLevel() === 'warning' ? 'bg-yellow-50 border-yellow-400' :
          'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {getDiagnosticLevel() === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : getDiagnosticLevel() === 'warning' ? (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={`font-medium ${
              getDiagnosticLevel() === 'success' ? 'text-green-800' :
              getDiagnosticLevel() === 'warning' ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              {getDiagnosticMessage()}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => performHealthCheck(true)}
            disabled={isChecking}
            variant="outline"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              'Forçar Verificação'
            )}
          </Button>

          <Button 
            onClick={() => setShowDebug(!showDebug)}
            variant="ghost"
            size="sm"
          >
            <Bug className={`h-4 w-4 mr-2`} />
            Debug Info
          </Button>

          <Button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            size="sm"
          >
            <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            Diagnóstico Avançado
          </Button>
        </div>

        {/* Erros */}
        {healthStatus.issues?.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">Problemas Detectados:</h4>
            {healthStatus.issues.map((issue, index) => (
              <div key={index} className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">{issue}</p>
              </div>
            ))}
          </div>
        )}

        {/* Informações de Debug */}
        <Collapsible open={showDebug} onOpenChange={setShowDebug}>
          <CollapsibleContent className="space-y-4">
            {debugInfo && (
              <div className="p-4 rounded-lg bg-gray-50 border">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Informações de Debug:
                </h4>
                <div className="space-y-2 text-sm font-mono">
                  <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
                  <div><strong>Tentativas:</strong> {debugInfo.attempts}</div>
                  <div><strong>Método:</strong> {debugInfo.method}</div>
                  <div><strong>Status Response:</strong> 
                    <Badge variant={debugInfo.responseStatus === 200 ? "default" : "destructive"} className="ml-2">
                      {debugInfo.responseStatus}
                    </Badge>
                  </div>
                  {debugInfo.errorDetails && (
                    <div className="bg-red-50 p-2 rounded border-l-4 border-red-400">
                      <strong>Detalhes do Erro:</strong> {debugInfo.errorDetails}
                    </div>
                  )}
                  {debugInfo.headers && (
                    <div>
                      <strong>Headers:</strong>
                      <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(debugInfo.headers, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Diagnóstico Avançado */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleContent className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 border">
              <h4 className="font-medium mb-3">Diagnóstico Avançado:</h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Status da Edge Function:</strong>
                    <Badge variant={debugInfo?.responseStatus === 200 ? "default" : "destructive"} className="ml-2">
                      {debugInfo?.responseStatus === 200 ? 'OK' : 'Erro'}
                    </Badge>
                  </div>
                  <div>
                    <strong>Tentativas realizadas:</strong>
                    <Badge variant="outline" className="ml-2">
                      {debugInfo?.attempts || 0}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-4">
                  <strong>Recomendações:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {!healthStatus.apiKeyValid && (
                      <li>Verificar se a RESEND_API_KEY está configurada corretamente</li>
                    )}
                    {healthStatus.apiKeyValid && !healthStatus.isHealthy && (
                      <li>Verificar conectividade de rede e status da API do Resend</li>
                    )}
                    {healthStatus.responseTime && healthStatus.responseTime > 10000 && (
                      <li>Latência alta detectada - verificar conexão de rede</li>
                    )}
                    {healthStatus.issues.some(issue => issue.includes('timeout')) && (
                      <li>Problemas de timeout - considerar aumentar timeout ou verificar rede</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Timestamp da última verificação */}
        {healthStatus.lastChecked && (
          <p className="text-xs text-muted-foreground">
            Última verificação: {healthStatus.lastChecked.toLocaleString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
