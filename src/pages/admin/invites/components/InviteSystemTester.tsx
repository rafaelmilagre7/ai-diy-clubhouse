
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, TestTube } from "lucide-react";
import { useInviteCreate } from "@/hooks/admin/invites/useInviteCreate";

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  timestamp: string;
}

const InviteSystemTester = () => {
  const [testEmail, setTestEmail] = useState("teste@exemplo.com");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  
  const { createInvite } = useInviteCreate();

  const addTestResult = (step: string, success: boolean, message: string) => {
    const result: TestResult = {
      step,
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
  };

  const runSystemTest = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    addTestResult("INÍCIO", true, "Iniciando teste do sistema de convites");

    try {
      // Teste 1: Criar convite
      addTestResult("CRIAR CONVITE", true, `Tentando criar convite para ${testEmail}...`);
      
      const result = await createInvite({
        email: testEmail,
        roleId: "default-role", // Usar um role padrão para teste
        notes: "Teste automático do sistema",
        expiresIn: "7 days"
      });

      if (result) {
        addTestResult("CRIAR CONVITE", true, "✅ Convite criado no banco de dados");
        
        if (result.status === 'success') {
          addTestResult("ENVIO EMAIL", true, "✅ Email enviado com sucesso!");
          addTestResult("TESTE COMPLETO", true, "🎉 Sistema funcionando perfeitamente!");
        } else {
          addTestResult("ENVIO EMAIL", false, "⚠️ Convite criado mas email falhou");
          addTestResult("TESTE COMPLETO", false, "⚠️ Sistema parcialmente funcional");
        }
      } else {
        addTestResult("CRIAR CONVITE", false, "❌ Falha ao criar convite");
        addTestResult("TESTE COMPLETO", false, "❌ Sistema com problemas");
      }

    } catch (error: any) {
      addTestResult("ERRO CRÍTICO", false, `❌ ${error.message}`);
      addTestResult("TESTE COMPLETO", false, "❌ Sistema falhando");
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const overallSuccess = testResults.length > 0 && 
    testResults.some(r => r.step === "TESTE COMPLETO" && r.success);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          <CardTitle>Teste do Sistema de Convites</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles do Teste */}
        <div className="grid gap-2">
          <Label htmlFor="test-email">Email para Teste</Label>
          <Input
            id="test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="teste@exemplo.com"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={runSystemTest}
            disabled={isTesting || !testEmail}
            className="flex-1"
          >
            {isTesting ? "Testando..." : "🧪 Testar Sistema"}
          </Button>
          
          <Button 
            variant="outline"
            onClick={clearResults}
            disabled={testResults.length === 0}
          >
            Limpar
          </Button>
        </div>

        {/* Status Geral */}
        {testResults.length > 0 && (
          <Alert className={overallSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {overallSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={overallSuccess ? 'text-green-700' : 'text-red-700'}>
              {overallSuccess ? "✅ Sistema funcionando!" : "❌ Sistema com problemas"}
            </AlertDescription>
          </Alert>
        )}

        {/* Resultados do Teste */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Resultados do Teste:</h4>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Badge variant={result.success ? "default" : "destructive"} className="min-w-20">
                    {result.success ? "✓" : "✗"}
                  </Badge>
                  <span className="font-medium">{result.step}:</span>
                  <span className="text-muted-foreground">{result.message}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{result.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Este teste verifica se o sistema consegue criar convites e enviar emails automaticamente.
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteSystemTester;
