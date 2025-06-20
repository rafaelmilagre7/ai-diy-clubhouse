
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw, Mail } from "lucide-react";
import { resendTestService } from "@/services/resendTestService";
import { toast } from "sonner";

export const ResendConfigValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const validateConfiguration = async () => {
    setIsValidating(true);
    try {
      console.log("🔍 Iniciando validação completa do Resend...");
      
      // Teste de conectividade direta
      const connectivityResult = await resendTestService.testResendApiDirect();
      
      // Teste de saúde via Edge Function
      const healthResult = await resendTestService.testHealthWithDirectFetch(1, true);
      
      setValidationResult({
        connectivity: connectivityResult,
        health: healthResult,
        timestamp: new Date().toISOString()
      });

      if (healthResult.healthy && connectivityResult.connected) {
        toast.success("✅ Configuração do Resend validada com sucesso!");
      } else {
        toast.error("❌ Problemas detectados na configuração do Resend");
      }
    } catch (error: any) {
      console.error("❌ Erro na validação:", error);
      setValidationResult({
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast.error("Erro durante a validação");
    } finally {
      setIsValidating(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Digite um email para teste");
      return;
    }

    setIsSendingTest(true);
    try {
      console.log("📧 Enviando email de teste...");
      const result = await resendTestService.sendTestEmailDirect(testEmail);
      
      if (result.success) {
        toast.success(`✅ Email de teste enviado para ${testEmail}!`);
      } else {
        toast.error(`❌ Falha no envio: ${result.error}`);
      }
    } catch (error: any) {
      console.error("❌ Erro no envio de teste:", error);
      toast.error("Erro ao enviar email de teste");
    } finally {
      setIsSendingTest(false);
    }
  };

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === false) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (healthy: boolean | undefined) => {
    if (healthy === true) return <Badge variant="default" className="bg-green-500">Operacional</Badge>;
    if (healthy === false) return <Badge variant="destructive">Com Problemas</Badge>;
    return <Badge variant="secondary">Não Testado</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Validação da Configuração Resend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={validateConfiguration} 
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isValidating ? "Validando..." : "Validar Configuração"}
            </Button>
          </div>

          {validationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Conectividade API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(validationResult.connectivity?.connected)}
                        {getStatusBadge(validationResult.connectivity?.connected)}
                      </div>
                    </div>
                    {validationResult.connectivity?.error && (
                      <p className="text-xs text-red-600 mt-2">
                        {validationResult.connectivity.error}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Sistema de Email</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Edge Function</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(validationResult.health?.healthy)}
                        {getStatusBadge(validationResult.health?.healthy)}
                      </div>
                    </div>
                    {validationResult.health?.responseTime && (
                      <p className="text-xs text-gray-600 mt-1">
                        Tempo: {validationResult.health.responseTime}ms
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {validationResult.health?.issues && validationResult.health.issues.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Problemas detectados:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {validationResult.health.issues.map((issue: string, index: number) => (
                        <li key={index} className="text-sm">{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Erro na validação:</strong> {validationResult.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Envio de Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Digite um email para teste"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button 
              onClick={sendTestEmail} 
              disabled={isSendingTest || !testEmail}
              className="flex items-center gap-2"
            >
              {isSendingTest ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {isSendingTest ? "Enviando..." : "Enviar Teste"}
            </Button>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Este teste enviará um email diretamente via Resend para verificar se o sistema está funcionando corretamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
