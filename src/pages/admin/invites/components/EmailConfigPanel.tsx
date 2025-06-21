
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Settings, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EmailConfigPanel = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [configStatus, setConfigStatus] = useState<any>(null);

  const checkEmailConfig = async () => {
    try {
      setIsChecking(true);
      setConfigStatus(null);

      console.log('🔍 Verificando configuração do e-mail...');

      // Testar envio de e-mail usando a função existente
      const response = await supabase.functions.invoke('send-invite-email', {
        body: {
          inviteId: 'config-test-id',
          email: 'test@viverdeia.ai',
          roleId: 'test-role',
          token: 'config-test-token',
          isResend: false,
          notes: 'Teste de configuração'
        }
      });

      console.log('🔍 Resposta do teste de configuração:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;

      if (data?.success) {
        setConfigStatus({
          hasApiKey: true,
          connectionOk: true,
          domainVerified: true,
          lastCheck: new Date(),
          details: {
            emailId: data.email_id,
            message: 'Configuração verificada com sucesso'
          }
        });
        toast.success('Configuração do e-mail verificada com sucesso!');
      } else {
        throw new Error(data?.error || 'Erro na verificação');
      }

    } catch (error: any) {
      console.error('❌ Erro na verificação:', error);
      
      let errorDetails = {
        hasApiKey: false,
        connectionOk: false,
        domainVerified: false,
        lastCheck: new Date(),
        error: error.message,
        details: {}
      };

      // Analisar o tipo de erro
      if (error.message.includes('RESEND_API_KEY')) {
        errorDetails.details = {
          issue: 'API Key não configurada',
          solution: 'Configure RESEND_API_KEY no Supabase Secrets'
        };
      } else if (error.message.includes('domain')) {
        errorDetails.details = {
          issue: 'Domínio não verificado',
          solution: 'Verifique o domínio no painel do Resend'
        };
      } else {
        errorDetails.details = {
          issue: 'Erro de conectividade',
          solution: 'Verifique as configurações do Resend'
        };
      }

      setConfigStatus(errorDetails);
      toast.error('Erro na verificação: ' + error.message);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="flex items-center gap-1">
        {status ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
        {label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Verificação de Configuração
        </CardTitle>
        <CardDescription>
          Teste a conectividade e configuração do sistema de e-mail
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={checkEmailConfig} 
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando Configuração...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Verificar Configuração
            </>
          )}
        </Button>

        {configStatus && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {getStatusBadge(configStatus.hasApiKey, 'API Key')}
              {getStatusBadge(configStatus.connectionOk, 'Conexão')}
              {getStatusBadge(configStatus.domainVerified, 'Domínio')}
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-2">Detalhes da Verificação</h4>
              
              {configStatus.connectionOk ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">
                    ✅ Sistema de e-mail funcionando corretamente
                  </p>
                  {configStatus.details?.emailId && (
                    <p className="text-xs font-mono">
                      Email ID de teste: {configStatus.details.emailId}
                    </p>
                  )}
                  <p className="text-xs">
                    Última verificação: {configStatus.lastCheck.toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">
                    ❌ {configStatus.details?.issue || 'Erro na configuração'}
                  </p>
                  <p className="text-sm">
                    <strong>Solução:</strong> {configStatus.details?.solution || 'Verifique as configurações'}
                  </p>
                  {configStatus.error && (
                    <p className="text-xs font-mono bg-red-50 p-2 rounded">
                      {configStatus.error}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Links Úteis</h4>
              <div className="space-y-2 text-sm">
                <a 
                  href="https://resend.com/domains" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Verificar domínios no Resend
                </a>
                <a 
                  href="https://resend.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Gerenciar API Keys
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Configuração necessária:</strong></p>
          <p>• RESEND_API_KEY no Supabase Secrets</p>
          <p>• Domínio viverdeia.ai verificado no Resend</p>
          <p>• DNS configurado corretamente</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailConfigPanel;
