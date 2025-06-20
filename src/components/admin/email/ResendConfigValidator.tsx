
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
  AlertTriangle, 
  Mail, 
  Clock, 
  Zap,
  RefreshCw,
  Settings,
  Shield
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const ResendConfigValidator: React.FC = () => {
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  const [isValidatingConfig, setIsValidatingConfig] = useState(false);
  const [configStatus, setConfigStatus] = useState<any>(null);

  const validateResendConfig = async () => {
    setIsValidatingConfig(true);
    
    try {
      console.log("🔧 Validando configuração do Resend...");
      
      const { data, error } = await supabase.functions.invoke('test-resend-health', {
        body: {
          testType: 'config_validation',
          requestId: crypto.randomUUID().substring(0, 8),
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error("❌ Erro na validação:", error);
        setConfigStatus({
          success: false,
          error: error.message,
          details: 'Falha na comunicação com sistema de validação'
        });
        toast.error("Erro na validação", { description: error.message });
        return;
      }

      setConfigStatus(data);

      if (data?.success) {
        toast.success("Configuração válida!", { 
          description: "Resend configurado corretamente" 
        });
      } else {
        toast.warning("Problemas detectados", { 
          description: data?.error || "Verificar configuração" 
        });
      }

    } catch (error: any) {
      console.error("❌ Erro crítico:", error);
      setConfigStatus({
        success: false,
        error: error.message,
        details: 'Erro de conectividade'
      });
      toast.error("Erro crítico", { description: error.message });
    } finally {
      setIsValidatingConfig(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error("Email inválido", { description: "Digite um email válido" });
      return;
    }

    setIsTestingEmail(true);
    
    try {
      console.log("📧 Enviando email de teste para:", testEmail);
      
      const { data, error } = await supabase.functions.invoke('test-resend-email', {
        body: {
          email: testEmail,
          requestId: crypto.randomUUID().substring(0, 8),
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error("❌ Erro no envio:", error);
        setLastTestResult({
          success: false,
          error: error.message,
          email: testEmail
        });
        toast.error("Falha no envio", { description: error.message });
        return;
      }

      setLastTestResult({
        success: true,
        email: testEmail,
        emailId: data?.emailId,
        responseTime: data?.responseTime,
        timestamp: new Date().toISOString()
      });

      if (data?.success) {
        toast.success("Email enviado!", { 
          description: `Verifique a caixa de entrada de ${testEmail}` 
        });
      } else {
        toast.warning("Problema no envio", { 
          description: data?.error || "Verificar logs" 
        });
      }

    } catch (error: any) {
      console.error("❌ Erro crítico no teste:", error);
      setLastTestResult({
        success: false,
        error: error.message,
        email: testEmail
      });
      toast.error("Erro crítico", { description: error.message });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge className="bg-green-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        Funcionando
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Com Problemas
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Validação de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Validação de Configuração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={validateResendConfig}
              disabled={isValidatingConfig}
              className="flex items-center gap-2"
            >
              {isValidatingConfig ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              {isValidatingConfig ? 'Validando...' : 'Validar Configuração'}
            </Button>
          </div>

          {configStatus && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium">Status da Configuração:</span>
                {getStatusBadge(configStatus.success)}
              </div>
              
              {configStatus.success ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ Resend configurado corretamente
                    <br />
                    • API Key válida
                    <br />
                    • Domínio verificado
                    <br />
                    • Sistema operacional
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Problema detectado:</strong> {configStatus.error}
                    <br />
                    {configStatus.details && (
                      <>Detalhes: {configStatus.details}</>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teste de Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-purple-500" />
            Teste de Envio de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Email para Teste</Label>
            <div className="flex gap-2">
              <Input
                id="testEmail"
                type="email"
                placeholder="seu@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={sendTestEmail}
                disabled={isTestingEmail}
                className="flex items-center gap-2"
              >
                {isTestingEmail ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isTestingEmail ? 'Enviando...' : 'Enviar Teste'}
              </Button>
            </div>
          </div>

          {lastTestResult && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium">Último Teste:</span>
                {getStatusBadge(lastTestResult.success)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div><strong>Email:</strong> {lastTestResult.email}</div>
                {lastTestResult.success ? (
                  <div className="space-y-1">
                    {lastTestResult.emailId && (
                      <div><strong>ID do Email:</strong> {lastTestResult.emailId}</div>
                    )}
                    {lastTestResult.responseTime && (
                      <div><strong>Tempo de Resposta:</strong> {lastTestResult.responseTime}ms</div>
                    )}
                    <div><strong>Enviado em:</strong> {new Date(lastTestResult.timestamp).toLocaleString('pt-BR')}</div>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <strong>Erro:</strong> {lastTestResult.error}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Mail className="h-5 w-5" />
            Sistema de Email Profissional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <span>Resend Premium configurado</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3" />
            <span>Template React Email profissional</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            <span>Sistema de fallback automático</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Monitoramento em tempo real</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
