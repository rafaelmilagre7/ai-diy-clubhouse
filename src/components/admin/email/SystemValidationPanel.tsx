import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlayCircle, CheckCircle, AlertTriangle, Clock, RefreshCw, Zap, TestTube2 } from 'lucide-react';
import { useEmailSystemValidator } from '@/hooks/admin/email/useEmailSystemValidator';
export const SystemValidationPanel: React.FC = () => {
  const {
    isValidating,
    validationReport,
    runCompleteValidation,
    clearReport
  } = useEmailSystemValidator();
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  const getOverallBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">✅ Sistema Operacional</Badge>;
      case 'warning':
        return <Badge variant="secondary">⚠️ Atenção Necessária</Badge>;
      case 'error':
        return <Badge variant="destructive">❌ Problemas Detectados</Badge>;
      default:
        return <Badge variant="outline">⏳ Aguardando Validação</Badge>;
    }
  };
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube2 className="h-5 w-5 text-blue-500" />
          Validação Completa do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button onClick={runCompleteValidation} disabled={isValidating} className="flex items-center gap-2">
            {isValidating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            {isValidating ? 'Validando...' : 'Executar Validação Completa'}
          </Button>
          
          {validationReport && <Button onClick={clearReport} variant="outline" size="sm">
              Limpar Relatório
            </Button>}
        </div>

        {validationReport && <div className="space-y-4">
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">Resultado da Validação</h4>
                <p className="text-sm text-muted-foreground">
                  Executado em {new Date(validationReport.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
              {getOverallBadge(validationReport.overall)}
            </div>

            <div className="p-3 rounded space-y-1 text-sm bg-gray-700">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                <span><strong>Duração:</strong> {validationReport.duration}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span><strong>Testes Executados:</strong> {validationReport.results.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" />
                <span><strong>Erros:</strong> {validationReport.results.filter(r => r.status === 'error').length}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Detalhes dos Testes:</h4>
              {validationReport.results.map((result, index) => <div key={index} className="flex items-center justify-between p-2 border rounded bg-gray-800">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium text-sm">{result.step}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {result.message}
                  </span>
                </div>)}
            </div>
          </div>}

        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="space-y-1 text-sm">
            <h4 className="font-medium text-blue-900">🔍 O que é validado:</h4>
            <ul className="space-y-0.5 text-blue-800 text-xs">
              <li>• Configuração e conectividade do Resend</li>
              <li>• Geração de links de convite</li>
              <li>• Template React Email</li>
              <li>• Sistema de fallback</li>
              <li>• Performance e tempo de resposta</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>;
};