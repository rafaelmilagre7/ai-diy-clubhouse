import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, MessageCircle, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useWhatsAppTemplateCheck } from '@/hooks/admin/invites/useWhatsAppTemplateCheck';
import { useWhatsAppStatusCheck } from '@/hooks/admin/invites/useWhatsAppStatusCheck';
import { useWhatsAppDeliveryTest } from '@/hooks/admin/invites/useWhatsAppDeliveryTest';

export function WhatsAppDiagnosticPanel() {
  const { checkTemplateStatus, isChecking: isCheckingTemplate, lastCheckResult } = useWhatsAppTemplateCheck();
  const { checkWhatsAppStatus, isChecking: isCheckingStatus, lastCheckResult: statusResult } = useWhatsAppStatusCheck();
  const { testDelivery, testing, lastTestResult } = useWhatsAppDeliveryTest();
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        checkTemplateStatus();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [autoRefresh, checkTemplateStatus]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const handleTestDelivery = async () => {
    // Usar número de teste padrão
    await testDelivery('+5548991657016');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Diagnóstico WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ações principais */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={checkTemplateStatus} 
            disabled={isCheckingTemplate}
            variant="outline"
          >
            {isCheckingTemplate && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            Verificar Template
          </Button>
          
          <Button 
            onClick={checkWhatsAppStatus} 
            disabled={isCheckingStatus}
            variant="outline"
          >
            {isCheckingStatus && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            Verificar Status
          </Button>

          <Button 
            onClick={handleTestDelivery} 
            disabled={testing}
            variant="outline"
          >
            {testing && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            Teste de Entrega
          </Button>

          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            Auto-refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
        </div>

        <Separator />

        {/* Status do Template */}
        {lastCheckResult && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Status do Template "convitevia"</h3>
            
            <div className="flex items-center gap-3">
              {getStatusIcon(lastCheckResult.templateStatus)}
              <span className="font-medium">Status:</span>
              {getStatusBadge(lastCheckResult.templateStatus)}
            </div>

            {lastCheckResult.templateExists ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Template encontrado e {lastCheckResult.templateStatus.toLowerCase()}
                </p>
                
                {lastCheckResult.templateStatus === 'APPROVED' && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Template aprovado! WhatsApp deve funcionar normalmente.
                    </AlertDescription>
                  </Alert>
                )}

                {lastCheckResult.templateStatus === 'PENDING' && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Template pendente de aprovação pelo Meta. Pode levar até 24h.
                    </AlertDescription>
                  </Alert>
                )}

                {lastCheckResult.templateStatus === 'REJECTED' && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Template rejeitado! Necessário ajustar e reenviar para aprovação.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Template "convitevia" não encontrado! Verifique se foi criado corretamente.
                </AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground">
              Última verificação: {new Date(lastCheckResult.timestamp).toLocaleString('pt-BR')}
            </p>
          </div>
        )}

        <Separator />

        {/* Status das Entregas */}
        {statusResult && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Status das Entregas</h3>
            
            {statusResult.success ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Verificadas:</strong> {statusResult.checked} mensagens
                </p>
                <p className="text-sm">
                  <strong>Atualizadas:</strong> {statusResult.updated} mensagens
                </p>
                
                {statusResult.results.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Resultados recentes:</h4>
                    {statusResult.results.slice(0, 5).map((result, index) => (
                      <div key={index} className="text-xs p-2 bg-muted rounded">
                        <div>ID: {result.message_id}</div>
                        <div>Status: <Badge variant="outline">{result.status}</Badge></div>
                        {result.whatsapp_status && (
                          <div>WhatsApp: <Badge variant="outline">{result.whatsapp_status}</Badge></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Erro na verificação de status das entregas.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Separator />

        {/* Teste de Entrega */}
        {lastTestResult && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Último Teste de Entrega</h3>
            
            {lastTestResult.success ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Teste enviado com sucesso para {lastTestResult.phoneNumber}
                  <br />
                  <strong>Message ID:</strong> {lastTestResult.messageId}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Falha no teste: {lastTestResult.error}
                </AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground">
              Teste realizado em: {new Date(lastTestResult.timestamp).toLocaleString('pt-BR')}
            </p>
          </div>
        )}

        {/* Alertas de configuração */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Checklist de Configuração</h3>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Edge Functions configuradas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Sistema de logs implementado</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>Webhook configurado (verificar URL no Meta)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>Template "convitevia" (verificar aprovação)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}