
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle, TestTube } from "lucide-react";
import { useInviteCreate } from "@/hooks/admin/invites/useInviteCreate";
import { usePermissions } from "@/hooks/auth/usePermissions";

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  timestamp: string;
}

const InviteSystemTester = () => {
  const [testEmail, setTestEmail] = useState("teste@exemplo.com");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  
  const { createInvite } = useInviteCreate();
  const { roles, loading: rolesLoading } = usePermissions();

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
    if (!selectedRoleId) {
      addTestResult("VALIDAÇÃO", false, "❌ Selecione um papel antes de testar");
      return;
    }

    setIsTesting(true);
    setTestResults([]);
    
    addTestResult("INÍCIO", true, "🧪 Iniciando teste do sistema de convites");

    try {
      const selectedRole = roles.find(r => r.id === selectedRoleId);
      addTestResult("VALIDAÇÃO", true, `✅ Papel selecionado: ${selectedRole?.name || 'Desconhecido'}`);
      
      // Teste: Criar convite
      addTestResult("CRIAR CONVITE", true, `📝 Tentando criar convite para ${testEmail}...`);
      
      const result = await createInvite({
        email: testEmail,
        roleId: selectedRoleId,
        notes: "Teste automático do sistema de convites",
        expiresIn: "7 days"
      });

      if (result) {
        addTestResult("CRIAR CONVITE", true, "✅ Convite criado no banco de dados");
        
        if (result.status === 'success') {
          addTestResult("ENVIO EMAIL", true, "✅ Email enviado com sucesso!");
          if (result.emailResult?.emailId) {
            addTestResult("EMAIL ID", true, `📧 ID do email: ${result.emailResult.emailId}`);
          }
          addTestResult("TESTE COMPLETO", true, "🎉 Sistema funcionando perfeitamente!");
        } else if (result.status === 'partial_success') {
          addTestResult("ENVIO EMAIL", false, "⚠️ Convite criado mas email pode ter falhado");
          if (result.emailResult?.error) {
            addTestResult("ERRO EMAIL", false, `📧 Erro: ${result.emailResult.error}`);
          }
          addTestResult("TESTE COMPLETO", false, "⚠️ Sistema parcialmente funcional - verificar configuração do email");
        } else {
          addTestResult("TESTE COMPLETO", false, "❌ Falha no processo");
        }
      } else {
        addTestResult("CRIAR CONVITE", false, "❌ Falha ao criar convite");
        addTestResult("TESTE COMPLETO", false, "❌ Sistema com problemas críticos");
      }

    } catch (error: any) {
      addTestResult("ERRO CRÍTICO", false, `💥 ${error.message}`);
      addTestResult("TESTE COMPLETO", false, "❌ Sistema falhando - verificar logs");
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const overallSuccess = testResults.length > 0 && 
    testResults.some(r => r.step === "TESTE COMPLETO" && r.success);

  const partialSuccess = testResults.length > 0 && 
    testResults.some(r => r.step === "CRIAR CONVITE" && r.success) &&
    !overallSuccess;

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
        <div className="grid gap-4">
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

          <div className="grid gap-2">
            <Label htmlFor="test-role">Papel do Convite</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId} disabled={rolesLoading}>
              <SelectTrigger id="test-role">
                <SelectValue placeholder={rolesLoading ? "Carregando papéis..." : "Selecione um papel"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name} ({role.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={runSystemTest}
            disabled={isTesting || !testEmail || !selectedRoleId || rolesLoading}
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
          <Alert className={
            overallSuccess ? 'border-green-200 bg-green-50' : 
            partialSuccess ? 'border-yellow-200 bg-yellow-50' : 
            'border-red-200 bg-red-50'
          }>
            {overallSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className={`h-4 w-4 ${partialSuccess ? 'text-yellow-600' : 'text-red-600'}`} />
            )}
            <AlertDescription className={
              overallSuccess ? 'text-green-700' : 
              partialSuccess ? 'text-yellow-700' : 
              'text-red-700'
            }>
              {overallSuccess ? "✅ Sistema funcionando perfeitamente!" : 
               partialSuccess ? "⚠️ Sistema parcialmente funcional - emails podem falhar" :
               "❌ Sistema com problemas - verificar configuração"}
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
                  <span className="text-muted-foreground flex-1">{result.message}</span>
                  <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p><strong>Como usar:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Selecione um email válido e um papel existente</li>
            <li>Clique em "Testar Sistema" para verificar todo o fluxo</li>
            <li>Verde = sucesso total, Amarelo = convite criado mas email falhou, Vermelho = falha crítica</li>
            <li>Se der erro de email, verifique se a chave RESEND_API_KEY está configurada</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteSystemTester;
