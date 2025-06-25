
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tokenAudit } from '@/utils/tokenAuditLogger';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';

interface TokenDiagnosticReportProps {
  onRetry?: () => void;
}

export const TokenDiagnosticReport = ({ onRetry }: TokenDiagnosticReportProps) => {
  const report = tokenAudit.generateAuditReport();

  const downloadSupportLog = () => {
    const supportLog = tokenAudit.generateSupportLog();
    const blob = new Blob([supportLog], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-audit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-red-50 border-red-200">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Erro na Validação do Token de Convite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">Resumo do Diagnóstico:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Token Esperado:</span>
              <p className="text-gray-600">{report.expectedToken || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium">Comprimento:</span>
              <p className="text-gray-600">{report.expectedTokenLength || 'N/A'} caracteres</p>
            </div>
            <div>
              <span className="font-medium">Etapas Auditadas:</span>
              <p className="text-gray-600">{report.totalSteps}</p>
            </div>
            <div>
              <span className="font-medium">Corrupção Detectada:</span>
              <Badge variant={report.corruptionDetected ? "destructive" : "secondary"}>
                {report.corruptionDetected ? 'SIM' : 'NÃO'}
              </Badge>
            </div>
          </div>
        </div>

        {report.corruptionDetected && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">
              Primeira Corrupção Detectada:
            </h4>
            <p className="text-yellow-700 text-sm">
              Etapa: <code className="bg-yellow-100 px-1 rounded">{report.firstCorruptionStep}</code>
            </p>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
          <h4 className="font-semibold text-gray-800 mb-2">Rastro da Auditoria:</h4>
          <div className="space-y-2">
            {report.auditTrail.map((step, index) => (
              <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{step.step}</span>
                  <span className="text-gray-500 ml-2">({step.source})</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-200 px-1 rounded">{step.token}</code>
                  <span className="text-gray-500">{step.tokenLength}ch</span>
                  {step.isCorrupted && <Badge variant="destructive" className="text-xs">CORROMPIDO</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          )}
          <Button onClick={downloadSupportLog} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Baixar Log para Suporte
          </Button>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p><strong>Para Suporte Técnico:</strong></p>
          <p>Este erro indica que o token de convite foi corrompido ou truncado durante o processo de geração, envio ou captura. Use o log de auditoria para identificar exatamente onde ocorreu a falha.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenDiagnosticReport;
