
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  AlertTriangle,
  Mail,
  Zap
} from 'lucide-react';
import { useEmailSystemValidator } from '@/hooks/admin/email/useEmailSystemValidator';

export const EmailDiagnosticsPanel = () => {
  const { 
    isValidating, 
    validationReport, 
    runCompleteValidation, 
    clearReport 
  } = useEmailSystemValidator();

  const getStatusIcon = (status: 'pending' | 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getOverallBadge = () => {
    if (!validationReport) return null;
    
    switch (validationReport.overall) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">✅ Sistema Saudável</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800">⚠️ Atenção Necessária</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">❌ Problemas Críticos</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Diagnóstico do Sistema de Email</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {validationReport && getOverallBadge()}
            <Button
              onClick={runCompleteValidation}
              disabled={isValidating}
              size="sm"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Validando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Executar Diagnóstico
                </>
              )}
            </Button>
            {validationReport && (
              <Button
                onClick={clearReport}
                variant="outline"
                size="sm"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!validationReport && !isValidating && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Execute o diagnóstico para verificar a saúde do sistema de email.
            </AlertDescription>
          </Alert>
        )}

        {isValidating && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Executando validação completa do sistema de email...
            </AlertDescription>
          </Alert>
        )}

        {validationReport && (
          <div className="space-y-4">
            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Status Geral</div>
                <div className="font-semibold">
                  {validationReport.overall === 'success' ? '✅ Funcionando' :
                   validationReport.overall === 'warning' ? '⚠️ Com Avisos' : 
                   '❌ Com Problemas'}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Duração</div>
                <div className="font-semibold">{validationReport.duration}ms</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Timestamp</div>
                <div className="font-semibold text-xs">
                  {new Date(validationReport.timestamp).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            {/* Resultados Detalhados */}
            <div className="space-y-3">
              <h4 className="font-semibold">Resultados da Validação</h4>
              {validationReport.results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium">{result.step}</div>
                    <div className={`text-sm ${getStatusColor(result.status)}`}>
                      {result.message}
                    </div>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          Ver detalhes
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
