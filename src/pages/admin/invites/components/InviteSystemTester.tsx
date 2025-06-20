
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Mail,
  Settings,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function InviteSystemTester() {
  const [testEmail, setTestEmail] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isTestingEdgeFunction, setIsTestingEdgeFunction] = useState(false);
  const [testResults, setTestResults] = useState<{
    email?: { success: boolean; message: string; details?: any };
    edgeFunction?: { success: boolean; message: string; details?: any };
  }>({});

  const testEmailFunction = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setIsTestingEmail(true);
    const requestId = crypto.randomUUID().substring(0, 8);
    
    try {
      console.log(`🧪 [TEST-${requestId}] Testando envio de email para:`, testEmail);

      const { data, error } = await supabase.functions.invoke('test-resend-email', {
        body: { email: testEmail }
      });

      if (error) {
        console.error(`❌ [TEST-${requestId}] Erro na Edge Function:`, error);
        setTestResults(prev => ({
          ...prev,
          email: {
            success: false,
            message: 'Erro na Edge Function',
            details: error
          }
        }));
        toast.error('Falha no teste de email', {
          description: error.message
        });
        return;
      }

      if (data?.success) {
        console.log(`✅ [TEST-${requestId}] Email de teste enviado com sucesso!`);
        setTestResults(prev => ({
          ...prev,
          email: {
            success: true,
            message: 'Email de teste enviado com sucesso!',
            details: data
          }
        }));
        toast.success('Email de teste enviado!', {
          description: `Verifique sua caixa de entrada em ${testEmail}`
        });
      } else {
        console.error(`❌ [TEST-${requestId}] Falha no envio:`, data);
        setTestResults(prev => ({
          ...prev,
          email: {
            success: false,
            message: data?.error || 'Falha no envio do email',
            details: data
          }
        }));
        toast.error('Falha no envio do email', {
          description: data?.error || 'Erro desconhecido'
        });
      }

    } catch (error: any) {
      console.error(`💥 [TEST-${requestId}] Erro crítico:`, error);
      setTestResults(prev => ({
        ...prev,
        email: {
          success: false,
          message: 'Erro crítico no teste',
          details: { error: error.message }
        }
      }));
      toast.error('Erro crítico', {
        description: error.message
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const testEdgeFunctionConnectivity = async () => {
    setIsTestingEdgeFunction(true);
    const requestId = crypto.randomUUID().substring(0, 8);
    
    try {
      console.log(`🔍 [EDGE-TEST-${requestId}] Testando conectividade da Edge Function...`);

      // Teste 1: Verificar se a função responde
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: { test: true }
      });

      if (error) {
        console.error(`❌ [EDGE-TEST-${requestId}] Erro na Edge Function:`, error);
        setTestResults(prev => ({
          ...prev,
          edgeFunction: {
            success: false,
            message: 'Edge Function não acessível',
            details: error
          }
        }));
        return;
      }

      if (data && !data.success && data.error?.includes('obrigatórios')) {
        console.log(`✅ [EDGE-TEST-${requestId}] Edge Function responde corretamente!`);
        setTestResults(prev => ({
          ...prev,
          edgeFunction: {
            success: true,
            message: 'Edge Function operacional e respondendo corretamente',
            details: data
          }
        }));
        toast.success('Edge Function OK!', {
          description: 'A função está respondendo corretamente'
        });
      } else {
        console.warn(`⚠️ [EDGE-TEST-${requestId}] Resposta inesperada:`, data);
        setTestResults(prev => ({
          ...prev,
          edgeFunction: {
            success: false,
            message: 'Resposta inesperada da Edge Function',
            details: data
          }
        }));
      }

    } catch (error: any) {
      console.error(`💥 [EDGE-TEST-${requestId}] Erro crítico:`, error);
      setTestResults(prev => ({
        ...prev,
        edgeFunction: {
          success: false,
          message: 'Erro crítico no teste da Edge Function',
          details: { error: error.message }
        }
      }));
      toast.error('Erro no teste da Edge Function', {
        description: error.message
      });
    } finally {
      setIsTestingEdgeFunction(false);
    }
  };

  const getResultBadge = (result?: { success: boolean; message: string }) => {
    if (!result) return <Badge variant="secondary">Não testado</Badge>;
    
    return result.success ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Sucesso
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Falha
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Teste do Sistema de Convites
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Teste de Email */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Teste de Email (Resend)
            </h3>
            {getResultBadge(testResults.email)}
          </div>
          
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="seu-email@exemplo.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={testEmailFunction}
              disabled={isTestingEmail || !testEmail}
              size="sm"
            >
              {isTestingEmail ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Testar
            </Button>
          </div>

          {testResults.email && (
            <Alert className={testResults.email.success ? 'border-green-200 bg-green-50' : ''}>
              <AlertDescription>
                {testResults.email.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Teste da Edge Function */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Teste da Edge Function
            </h3>
            {getResultBadge(testResults.edgeFunction)}
          </div>
          
          <Button
            onClick={testEdgeFunctionConnectivity}
            disabled={isTestingEdgeFunction}
            variant="outline"
            size="sm"
          >
            {isTestingEdgeFunction ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Testar Conectividade
          </Button>

          {testResults.edgeFunction && (
            <Alert className={testResults.edgeFunction.success ? 'border-green-200 bg-green-50' : ''}>
              <AlertDescription>
                {testResults.edgeFunction.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Instruções */}
        <Alert>
          <AlertDescription>
            <strong>Como usar:</strong>
            <br />
            1. Primeiro teste a conectividade da Edge Function
            <br />
            2. Depois teste o envio de email com seu próprio email
            <br />
            3. Se ambos passarem, o sistema de convites deve funcionar normalmente
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
