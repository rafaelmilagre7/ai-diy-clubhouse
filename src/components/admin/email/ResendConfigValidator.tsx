
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  Send, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Mail,
  Key,
  Globe,
  Zap
} from 'lucide-react';
import { resendTestService } from '@/services/resendTestService';
import { toast } from 'sonner';

export const ResendConfigValidator: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isTestingHealth, setIsTestingHealth] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [healthResult, setHealthResult] = useState<any>(null);
  const [emailResult, setEmailResult] = useState<any>(null);

  const testResendHealth = async () => {
    setIsTestingHealth(true);
    try {
      console.log('🔍 Testando configuração do Resend...');
      
      const result = await resendTestService.testHealthWithDirectFetch(1, true);
      setHealthResult(result);
      
      if (result.healthy) {
        toast.success('✅ Configuração Resend validada');
      } else {
        toast.error(`❌ Problema na configuração: ${result.lastError}`);
      }
    } catch (error: any) {
      console.error('❌ Erro no teste:', error);
      setHealthResult({
        healthy: false,
        error: error.message,
        issues: [`Erro de conectividade: ${error.message}`]
      });
      toast.error(`Falha no teste: ${error.message}`);
    } finally {
      setIsTestingHealth(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setIsSendingTest(true);
    try {
      console.log(`📧 Enviando email de teste para: ${testEmail}`);
      
      const result = await resendTestService.sendTestEmailDirect(testEmail);
      setEmailResult(result);
      
      if (result.success) {
        toast.success(`✅ Email enviado! ID: ${result.emailId}`);
      } else {
        toast.error(`❌ Falha no envio: ${result.error}`);
      }
    } catch (error: any) {
      console.error('❌ Erro no envio:', error);
      setEmailResult({
        success: false,
        error: error.message
      });
      toast.error(`Erro no envio: ${error.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const getHealthBadge = (healthy: boolean) => {
    return healthy ? (
      <Badge className="bg-green-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        Saudável
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Com Problemas
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Teste de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-500" />
            Validação de Configuração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={testResendHealth}
            disabled={isTestingHealth}
            className="flex items-center gap-2"
          >
            {isTestingHealth ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            {isTestingHealth ? 'Testando...' : 'Testar Configuração Resend'}
          </Button>

          {healthResult && (
            <div className="space-y-3">
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Status Geral:</span>
                {getHealthBadge(healthResult.healthy)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-3 w-3" />
                    <span>API Key:</span>
                    <Badge variant={healthResult.apiKeyValid ? "default" : "destructive"}>
                      {healthResult.apiKeyValid ? "Válida" : "Inválida"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <span>Conectividade:</span>
                    <Badge variant={healthResult.connectivity === 'connected' ? "default" : "destructive"}>
                      {healthResult.connectivity}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    <span>Tempo Resposta:</span>
                    <span className="text-sm">{healthResult.responseTime || 0}ms</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span>Domínio:</span>
                    <Badge variant={healthResult.domainValid ? "default" : "destructive"}>
                      {healthResult.domainValid ? "Validado" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              </div>

              {healthResult.issues && healthResult.issues.length > 0 && (
                <div className="space-y-1">
                  <h4 className="font-medium text-sm text-red-900">Problemas Detectados:</h4>
                  {healthResult.issues.map((issue: string, index: number) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription className="text-sm">
                        {issue}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teste de Envio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-green-500" />
            Teste de Envio de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email para Teste</Label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="seu-email@exemplo.com"
            />
          </div>

          <Button
            onClick={sendTestEmail}
            disabled={isSendingTest || !testEmail}
            className="flex items-center gap-2"
          >
            {isSendingTest ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSendingTest ? 'Enviando...' : 'Enviar Email de Teste'}
          </Button>

          {emailResult && (
            <div className="space-y-2">
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Resultado do Envio:</span>
                <Badge variant={emailResult.success ? "default" : "destructive"}>
                  {emailResult.success ? "Sucesso" : "Falha"}
                </Badge>
              </div>

              {emailResult.success && emailResult.emailId && (
                <div className="text-sm text-green-800 bg-green-50 p-2 rounded">
                  <strong>Email ID:</strong> {emailResult.emailId}
                </div>
              )}

              {!emailResult.success && emailResult.error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-sm">
                    <strong>Erro:</strong> {emailResult.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium text-blue-900">📋 Checklist de Configuração:</h4>
            <ul className="space-y-1 text-blue-800 text-xs">
              <li>• Criar conta no Resend.com e gerar API key</li>
              <li>• Adicionar e verificar domínio viverdeia.ai no Resend</li>
              <li>• Configurar RESEND_API_KEY nos secrets do Supabase</li>
              <li>• Testar conectividade com o botão acima</li>
              <li>• Enviar email de teste para confirmar funcionamento</li>
              <li>• Verificar se emails chegam na caixa de entrada (não spam)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
