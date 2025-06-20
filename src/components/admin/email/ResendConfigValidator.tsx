
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Mail,
  Shield
} from 'lucide-react';
import { resendTestService } from '@/services/resendTestService';
import { toast } from 'sonner';

export const ResendConfigValidator: React.FC = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [configStatus, setConfigStatus] = useState<{
    apiKeyValid: boolean;
    domainValid: boolean;
    connectivity: 'connected' | 'disconnected' | 'unknown';
    lastChecked?: Date;
    issues: string[];
  } | null>(null);

  const validateConfiguration = async () => {
    setIsValidating(true);
    try {
      console.log('🔧 Validando configuração do Resend...');
      
      const healthResult = await resendTestService.testHealthWithDirectFetch(1, true);
      
      setConfigStatus({
        apiKeyValid: healthResult.apiKeyValid,
        domainValid: healthResult.domainValid,
        connectivity: healthResult.connectivity,
        lastChecked: new Date(),
        issues: healthResult.issues || []
      });

      if (healthResult.healthy) {
        toast.success('✅ Configuração Resend válida!');
      } else {
        toast.error('❌ Problemas na configuração Resend');
      }
    } catch (error: any) {
      console.error('❌ Erro na validação:', error);
      setConfigStatus({
        apiKeyValid: false,
        domainValid: false,
        connectivity: 'disconnected',
        lastChecked: new Date(),
        issues: [error.message]
      });
      toast.error('❌ Erro ao validar configuração');
    } finally {
      setIsValidating(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Digite um email válido');
      return;
    }

    setIsValidating(true);
    try {
      console.log(`📧 Enviando email de teste para: ${testEmail}`);
      
      const result = await resendTestService.sendTestEmailDirect(testEmail);
      
      if (result.success) {
        toast.success(`✅ Email teste enviado para ${testEmail}!`, {
          description: `ID: ${result.emailId}`
        });
      } else {
        toast.error('❌ Falha no envio do email teste', {
          description: result.error
        });
      }
    } catch (error: any) {
      console.error('❌ Erro no teste de email:', error);
      toast.error('❌ Erro no teste de email');
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: boolean | string) => {
    if (status === true || status === 'connected') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === false || status === 'disconnected') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const openResendDashboard = () => {
    window.open('https://resend.com/dashboard', '_blank');
  };

  const openSupabaseSecrets = () => {
    const projectUrl = import.meta.env.VITE_SUPABASE_URL;
    const projectId = projectUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (projectId) {
      window.open(`https://supabase.com/dashboard/project/${projectId}/settings/secrets`, '_blank');
    } else {
      window.open('https://supabase.com/dashboard', '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-500" />
          Validação e Configuração Resend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={validateConfiguration}
            disabled={isValidating}
            className="flex items-center gap-2"
          >
            {isValidating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {isValidating ? 'Validando...' : 'Validar Configuração'}
          </Button>
          
          <Button
            onClick={openResendDashboard}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Dashboard Resend
          </Button>
          
          <Button
            onClick={openSupabaseSecrets}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Key className="h-4 w-4" />
            Secrets Supabase
          </Button>
        </div>

        {configStatus && (
          <div className="space-y-4">
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">API Key</h4>
                  <p className="text-xs text-muted-foreground">RESEND_API_KEY</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.apiKeyValid)}
                  <Badge variant={configStatus.apiKeyValid ? "default" : "destructive"}>
                    {configStatus.apiKeyValid ? "Válida" : "Inválida"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Domínio</h4>
                  <p className="text-xs text-muted-foreground">viverdeia.ai</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.domainValid)}
                  <Badge variant={configStatus.domainValid ? "default" : "destructive"}>
                    {configStatus.domainValid ? "Configurado" : "Não configurado"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Conectividade</h4>
                  <p className="text-xs text-muted-foreground">Status da conexão</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.connectivity)}
                  <Badge variant={configStatus.connectivity === 'connected' ? "default" : "destructive"}>
                    {configStatus.connectivity === 'connected' ? "Conectado" : "Desconectado"}
                  </Badge>
                </div>
              </div>
            </div>

            {configStatus.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-red-900">Problemas Detectados:</h4>
                {configStatus.issues.map((issue, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {issue}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Teste de Envio de Email</h4>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="test-email" className="sr-only">
                Email para teste
              </Label>
              <Input
                id="test-email"
                type="email"
                placeholder="Digite um email para teste"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button
              onClick={sendTestEmail}
              disabled={isValidating || !testEmail}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Enviar Teste
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="space-y-1 text-sm">
            <h4 className="font-medium text-blue-900">🔧 Passos para Configuração:</h4>
            <ul className="space-y-0.5 text-blue-800 text-xs">
              <li>1. Acessar Dashboard Resend e verificar domínio verificado</li>
              <li>2. Copiar API Key válida do Resend</li>
              <li>3. Adicionar RESEND_API_KEY nos Secrets do Supabase</li>
              <li>4. Restart das Edge Functions para carregar novo secret</li>
              <li>5. Testar envio de email usando este painel</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
