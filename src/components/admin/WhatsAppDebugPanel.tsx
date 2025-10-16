import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle, Smartphone, Send, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DiagnosticsResult {
  timestamp: string;
  overall_status: 'success' | 'error' | 'unknown';
  credentials: {
    test: string;
    success: boolean;
    details: string[];
    errors: string[];
    warnings: string[];
    credentials: {
      access_token: boolean;
      phone_number_id: boolean;
      account_id: boolean;
    };
  };
  whatsapp_api: {
    test: string;
    success: boolean;
    details: string[];
    errors: string[];
    warnings: string[];
  } | null;
  template_status: {
    test: string;
    success: boolean;
    details: string[];
    errors: string[];
    warnings: string[];
    template: any;
  } | null;
  phone_number: {
    test: string;
    success: boolean;
    details: string[];
    errors: string[];
    warnings: string[];
  } | null;
  summary: {
    total_checks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export function WhatsAppDebugPanel() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testingPhone, setTestingPhone] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      console.log('🔍 [WhatsApp Debug] Iniciando diagnósticos...');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'check' }
      });

      if (error) {
        console.error('❌ [WhatsApp Debug] Erro:', error);
        toast.error('Erro ao executar diagnósticos');
        return;
      }

      console.log('✅ [WhatsApp Debug] Resultado:', data);
      setDiagnostics(data);
      
      if (data.overall_status === 'success') {
        toast.success('✅ WhatsApp configurado corretamente!');
      } else {
        toast.error('❌ Problemas encontrados na configuração');
      }

    } catch (err: any) {
      console.error('❌ [WhatsApp Debug] Erro inesperado:', err);
      toast.error('Erro inesperado nos diagnósticos');
    } finally {
      setLoading(false);
    }
  };

  const testSend = async () => {
    if (!testPhone.trim()) {
      toast.error('Número de teste obrigatório');
      return;
    }

    setTestingPhone(true);
    try {
      console.log('🧪 [WhatsApp Debug] Testando envio para:', testPhone.substring(0, 5) + '***');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'test-send',
          testPhone 
        }
      });

      if (error) {
        console.error('❌ [WhatsApp Debug] Erro no teste:', error);
        toast.error('Erro no teste de envio');
        return;
      }

      if (data?.success) {
        toast.success(`✅ Teste enviado! ID: ${data.messageId || 'N/A'}`);
      } else {
        toast.error(`❌ Falha no teste: ${data?.errors?.[0] || 'Erro desconhecido'}`);
      }

    } catch (err: any) {
      console.error('❌ [WhatsApp Debug] Erro inesperado no teste:', err);
      toast.error('Erro inesperado no teste');
    } finally {
      setTestingPhone(false);
    }
  };

  useEffect(() => {
    // Executar diagnósticos automaticamente ao carregar
    runDiagnostics();
  }, []);

  const renderCheckResult = (check: any, title: string) => {
    if (!check) return null;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant={check.success ? 'default' : 'destructive'}>
              {check.success ? (
                <CheckCircle className="mr-1 h-3 w-3" />
              ) : (
                <XCircle className="mr-1 h-3 w-3" />
              )}
              {check.success ? 'OK' : 'Erro'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {check.details?.map((detail: string, index: number) => (
            <div key={index} className="text-sm text-success flex items-center">
              <CheckCircle className="mr-2 h-3 w-3" />
              {detail}
            </div>
          ))}
          {check.warnings?.map((warning: string, index: number) => (
            <div key={index} className="text-sm text-warning flex items-center">
              <AlertCircle className="mr-2 h-3 w-3" />
              {warning}
            </div>
          ))}
          {check.errors?.map((error: string, index: number) => (
            <div key={index} className="text-sm text-destructive flex items-center">
              <XCircle className="mr-2 h-3 w-3" />
              {error}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">WhatsApp Debug</h2>
          <p className="text-muted-foreground">
            Diagnóstico completo da configuração do WhatsApp
          </p>
        </div>
        <Button 
          onClick={runDiagnostics} 
          disabled={loading}
          variant="outline"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Verificar Status
        </Button>
      </div>

      {/* Status Geral */}
      {diagnostics && (
        <Alert variant={diagnostics.overall_status === 'success' ? 'default' : 'destructive'}>
          {diagnostics.overall_status === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <div className="font-medium">
              {diagnostics.overall_status === 'success' 
                ? '✅ WhatsApp configurado e funcionando!' 
                : '❌ Problemas encontrados na configuração'
              }
            </div>
            <div className="text-sm mt-1">
              {diagnostics.summary.passed} de {diagnostics.summary.total_checks} verificações passaram
              {diagnostics.summary.warnings > 0 && ` • ${diagnostics.summary.warnings} avisos`}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="test">Teste de Envio</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Executando diagnósticos...</span>
            </div>
          ) : diagnostics ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credenciais</CardTitle>
                  {diagnostics.credentials?.success ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </CardHeader>
                <CardContent>
                  <Badge variant={diagnostics.credentials?.success ? 'default' : 'destructive'}>
                    {diagnostics.credentials?.success ? 'Configuradas' : 'Faltando'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API WhatsApp</CardTitle>
                  {diagnostics.whatsapp_api?.success ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </CardHeader>
                <CardContent>
                  <Badge variant={diagnostics.whatsapp_api?.success ? 'default' : 'destructive'}>
                    {diagnostics.whatsapp_api?.success ? 'Conectada' : 'Falha'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Template</CardTitle>
                  {diagnostics.template_status?.success ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </CardHeader>
                <CardContent>
                  <Badge variant={diagnostics.template_status?.success ? 'default' : 'destructive'}>
                    {diagnostics.template_status?.success ? 'Aprovado' : 'Pendente'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Número</CardTitle>
                  {diagnostics.phone_number?.success ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </CardHeader>
                <CardContent>
                  <Badge variant={diagnostics.phone_number?.success ? 'default' : 'destructive'}>
                    {diagnostics.phone_number?.success ? 'Ativo' : 'Problema'}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Clique em "Verificar Status" para executar os diagnósticos
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {diagnostics && (
            <div className="space-y-4">
              {renderCheckResult(diagnostics.credentials, 'Credenciais do Supabase')}
              {renderCheckResult(diagnostics.whatsapp_api, 'API do WhatsApp')}
              {renderCheckResult(diagnostics.template_status, 'Status do Template')}
              {renderCheckResult(diagnostics.phone_number, 'Número do WhatsApp')}
            </div>
          )}
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="mr-2 h-5 w-5" />
                Teste de Envio
              </CardTitle>
              <CardDescription>
                Envie uma mensagem de teste para verificar se o WhatsApp está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testPhone">Número de Teste (com DDD e país)</Label>
                <Input
                  id="testPhone"
                  type="tel"
                  placeholder="5511999999999"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
              </div>
              <Button 
                onClick={testSend} 
                disabled={testingPhone || !testPhone.trim()}
                className="w-full"
              >
                {testingPhone ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Enviar Teste
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}