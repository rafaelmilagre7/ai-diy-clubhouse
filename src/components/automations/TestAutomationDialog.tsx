import { useState } from "react";
import { Play, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AutomationEngine } from "./AutomationEngine";

interface TestAutomationDialogProps {
  ruleData: {
    name: string;
    conditions: any;
    actions: any[];
  };
}

const DEFAULT_TEST_PAYLOAD = {
  type: "hubla.product.sale",
  event: {
    userEmail: "teste@exemplo.com",
    userName: "João Teste",
    userPhone: "+5511999999999",
    productId: "prod_123",
    productName: "Curso Lovable",
    saleValue: 297.00,
    timestamp: new Date().toISOString()
  },
  customer: {
    email: "teste@exemplo.com",
    name: "João Teste",
    phone: "+5511999999999"
  },
  product_id: "prod_123"
};

export const TestAutomationDialog = ({ ruleData }: TestAutomationDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(DEFAULT_TEST_PAYLOAD, null, 2)
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Parse payload
      const payload = JSON.parse(testPayload);
      
      // Criar mock de regra temporária
      const mockRule = {
        id: 'test-rule',
        name: ruleData.name,
        conditions: ruleData.conditions,
        actions: ruleData.actions,
        is_active: true,
        rule_type: 'webhook',
        priority: 1
      };

      // Simular processamento
      const context = {
        webhookPayload: payload,
        eventType: payload.type || 'test_event',
        triggeredAt: new Date()
      };

      // Avaliar condições
      const conditionsMet = await (AutomationEngine as any).evaluateConditions(
        mockRule.conditions, 
        context
      );

      if (!conditionsMet) {
        setTestResult({
          success: false,
          conditionsMet: false,
          message: 'As condições não foram atendidas com este payload',
          actions: []
        });
        return;
      }

      // Executar ações
      const actionResults = await (AutomationEngine as any).executeActions(
        mockRule.actions,
        context,
        mockRule
      );

      setTestResult({
        success: actionResults.success,
        conditionsMet: true,
        message: actionResults.success 
          ? 'Teste executado com sucesso!' 
          : 'Teste concluído com erros',
        actions: actionResults.results || []
      });

      toast({
        title: actionResults.success ? "✅ Teste bem-sucedido" : "⚠️ Teste com erros",
        description: `${actionResults.results?.length || 0} ação(ões) executada(s)`,
        variant: actionResults.success ? "default" : "destructive"
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setTestResult({
        success: false,
        conditionsMet: false,
        message: `Erro ao executar teste: ${errorMessage}`,
        actions: []
      });

      toast({
        title: "❌ Erro no teste",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const getActionStatusIcon = (success: boolean) => {
    if (success) return <CheckCircle2 className="h-4 w-4 text-status-success" />;
    return <XCircle className="h-4 w-4 text-status-error" />;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Play className="mr-2 h-4 w-4" />
          Testar Automação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🧪 Testar Automação</DialogTitle>
          <DialogDescription>
            Simule a execução da automação com um payload de teste
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payload Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Payload de Teste (JSON)</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTestPayload(JSON.stringify(DEFAULT_TEST_PAYLOAD, null, 2))}
              >
                Restaurar exemplo
              </Button>
            </div>
            <Textarea
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              placeholder="Cole um payload JSON aqui..."
            />
            <p className="text-xs text-muted-foreground">
              💡 Dica: Use dados reais do webhook da Hubla ou customize conforme necessário
            </p>
          </div>

          {/* Test Button */}
          <Button 
            onClick={runTest} 
            disabled={testing}
            className="w-full"
            size="lg"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executando teste...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Executar Teste
              </>
            )}
          </Button>

          {/* Test Results */}
          {testResult && (
            <Card className={testResult.success ? "border-green-500" : "border-red-500"}>
              <CardContent className="pt-6 space-y-4">
                {/* Status Header */}
                <div className="flex items-center gap-3">
                  {testResult.success ? (
                    <CheckCircle2 className="h-6 w-6 text-status-success" />
                  ) : (
                    <XCircle className="h-6 w-6 text-status-error" />
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {testResult.success ? 'Teste Bem-sucedido' : 'Teste Falhou'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {testResult.message}
                    </p>
                  </div>
                </div>

                {/* Conditions Met */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  {testResult.conditionsMet ? (
                    <CheckCircle2 className="h-4 w-4 text-status-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-status-warning" />
                  )}
                  <span className="text-sm font-medium">
                    Condições: {testResult.conditionsMet ? 'Atendidas ✓' : 'Não atendidas ✗'}
                  </span>
                </div>

                {/* Actions Results */}
                {testResult.actions.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Resultado das Ações:</Label>
                    <div className="space-y-2">
                      {testResult.actions.map((action: any, index: number) => (
                        <div 
                          key={index}
                          className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                        >
                          {getActionStatusIcon(action.success)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {action.type}
                              </Badge>
                              {action.success && (
                                <Badge variant="default" className="text-xs bg-status-success">
                                  Sucesso
                                </Badge>
                              )}
                              {!action.success && (
                                <Badge variant="destructive" className="text-xs">
                                  Falhou
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {action.message || action.error}
                            </p>
                            {action.data && (
                              <details className="mt-2">
                                <summary className="text-xs cursor-pointer text-primary">
                                  Ver dados
                                </summary>
                                <pre className="text-xs mt-1 p-2 bg-background rounded overflow-auto">
                                  {JSON.stringify(action.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <p>
                    ℹ️ Este é um teste simulado. Em produção, as ações serão executadas 
                    de verdade (emails enviados, perfis atualizados, etc).
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
