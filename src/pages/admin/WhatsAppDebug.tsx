import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Info,
  Smartphone,
  Key,
  FileText,
  Send,
  RefreshCw,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface DiagnosticResult {
  test: string;
  success: boolean;
  details: string[];
  warnings?: string[];
  errors?: string[];
}

interface DiagnosticsData {
  timestamp: string;
  overall_status: string;
  credentials: DiagnosticResult;
  whatsapp_api: DiagnosticResult | null;
  template_status: DiagnosticResult | null;
  phone_number: DiagnosticResult | null;
  summary: {
    total_checks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

const StatusCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  status: 'success' | 'error' | 'warning' | 'loading' | 'unknown';
  details: string[];
  warnings?: string[];
  errors?: string[];
  action?: () => void;
  actionLabel?: string;
  actionLoading?: boolean;
}> = ({ title, icon, status, details, warnings = [], errors = [], action, actionLabel, actionLoading }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'border-primary bg-primary/5';
      case 'error': return 'border-destructive bg-destructive/5';
      case 'warning': return 'border-orange-500 bg-orange-500/5';
      case 'loading': return 'border-muted bg-muted/5';
      default: return 'border-muted bg-muted/5';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case 'error': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'loading': return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      default: return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'success': return <Badge variant="default">✅ OK</Badge>;
      case 'error': return <Badge variant="destructive">❌ Erro</Badge>;
      case 'warning': return <Badge variant="secondary">⚠️ Aviso</Badge>;
      case 'loading': return <Badge variant="outline">🔄 Carregando</Badge>;
      default: return <Badge variant="outline">❓ Desconhecido</Badge>;
    }
  };

  return (
    <Card className={`transition-all duration-200 ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon()}
                {getStatusBadge()}
              </div>
            </div>
          </div>
          {action && (
            <Button 
              onClick={action} 
              disabled={actionLoading}
              variant="outline" 
              size="sm"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {actionLabel || 'Testar'}
            </Button>
          )}
        </div>
      </CardHeader>
      {(details.length > 0 || warnings.length > 0 || errors.length > 0) && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {details.map((detail, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-3 w-3 shrink-0" />
                <span>{detail}</span>
              </div>
            ))}
            {warnings.map((warning, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-orange-600">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>{warning}</span>
              </div>
            ))}
            {errors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="h-3 w-3 shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const WhatsAppDebug: React.FC = () => {
  const { toast } = useToast();
  
  // Estados principais
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [testingTemplate, setTestingTemplate] = useState(false);
  const [testingSend, setTestingSend] = useState(false);
  const [testPhone, setTestPhone] = useState('5511999999999');
  const [sendTestResult, setSendTestResult] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [allTemplates, setAllTemplates] = useState<any>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [testingSpecificTemplate, setTestingSpecificTemplate] = useState(false);
  
  // Estados para teste de template de convite
  const [inviteEmail, setInviteEmail] = useState('teste@exemplo.com');
  const [invitePhone, setInvitePhone] = useState('5511999999999');
  const [templateTestResult, setTemplateTestResult] = useState<any>(null);
  const [templateTesting, setTemplateTesting] = useState(false);

  // Executar diagnósticos automaticamente ao carregar
  useEffect(() => {
    runDiagnostics();
  }, []);

  // Auto-refresh a cada 30 segundos se habilitado
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      runDiagnostics();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      console.log('🔍 Executando diagnósticos completos...');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'check' }
      });

      if (error) {
        console.error('❌ Erro nos diagnósticos:', error);
        toast({
          title: "Erro nos Diagnósticos",
          description: `Falha ao executar verificações: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Diagnósticos concluídos:', data);
      setDiagnostics(data);

      // Toast de resumo
      const { summary } = data;
      if (summary.failed === 0) {
        toast({
          title: "✅ Sistema OK",
          description: `${summary.passed}/${summary.total_checks} verificações passaram`,
        });
      } else {
        toast({
          title: "⚠️ Problemas Encontrados",
          description: `${summary.failed} verificações falharam`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('❌ Erro na execução:', error);
      toast({
        title: "Erro",
        description: "Falha ao executar diagnósticos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testTemplate = async () => {
    setTestingTemplate(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'check-template' }
      });

      if (error) throw error;

      // Atualizar apenas o status do template
      if (diagnostics) {
        setDiagnostics({
          ...diagnostics,
          template_status: data
        });
      }

      if (data.success) {
        toast({
          title: "✅ Template OK",
          description: "Template 'convitevia' encontrado e aprovado",
        });
      } else {
        toast({
          title: "⚠️ Problema no Template",
          description: data.errors?.[0] || "Template não está funcionando",
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: "Erro no Teste",
        description: `Falha ao testar template: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTestingTemplate(false);
    }
  };

  const testSending = async () => {
    if (!testPhone) {
      toast({
        title: "Erro",
        description: "Digite um número de telefone para teste",
        variant: "destructive",
      });
      return;
    }

    setTestingSend(true);
    setSendTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'test-send',
          testPhone: testPhone
        }
      });

      if (error) throw error;

      setSendTestResult(data);

      if (data.success) {
        toast({
          title: "✅ Teste Enviado",
          description: `Mensagem enviada para ${testPhone}`,
        });
      } else {
        toast({
          title: "❌ Falha no Envio",
          description: data.errors?.[0] || "Não foi possível enviar a mensagem",
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: "Erro no Teste",
        description: `Falha ao testar envio: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTestingSend(false);
    }
  };

  const loadAllTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'get-all-templates' }
      });

      if (error) throw error;

      setAllTemplates(data);
      
      if (data.success) {
        toast({
          title: "✅ Templates Carregados",
          description: `${data.templates?.length || 0} templates encontrados`,
        });
      } else {
        toast({
          title: "⚠️ Problema nos Templates",
          description: data.message || "Erro ao carregar templates",
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: "Erro ao Carregar Templates",
        description: `Falha: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Carregar templates automaticamente ao montar o componente
  useEffect(() => {
    loadAllTemplates();
  }, []);

  const testSpecificTemplate = async () => {
    if (!selectedTemplate || !testPhone) {
      toast({
        title: "Erro",
        description: "Selecione um template e digite um número para teste",
        variant: "destructive",
      });
      return;
    }

    setTestingSpecificTemplate(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'test-template',
          templateName: selectedTemplate,
          testPhone: testPhone
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Template Testado",
          description: `Template "${selectedTemplate}" enviado para ${testPhone}`,
        });
      } else {
        toast({
          title: "❌ Falha no Teste",
          description: data.errors?.[0] || "Não foi possível testar o template",
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: "Erro no Teste",
        description: `Falha: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTestingSpecificTemplate(false);
    }
  };

  const testInviteTemplate = async () => {
    if (!inviteEmail || !invitePhone) {
      toast({
        title: "Erro",
        description: "Digite email e telefone para testar",
        variant: "destructive",
      });
      return;
    }

    setTemplateTesting(true);
    setTemplateTestResult(null);

    try {
      console.log('🎯 [TESTE TEMPLATE] Iniciando teste completo de convite...');
      
      // Passo 1: Buscar role_id de 'member' (ou usar um padrão)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', 'member')
        .limit(1);

      if (rolesError || !roles?.length) {
        throw new Error('Role "member" não encontrado');
      }

      const roleId = roles[0].id;
      console.log('🎯 [TESTE TEMPLATE] Role ID:', roleId);

      // Passo 2: Criar convite híbrido usando a função SQL
      const { data: inviteResult, error: inviteError } = await supabase
        .rpc('create_invite_hybrid', {
          p_email: inviteEmail,
          p_role_id: roleId,
          p_phone: invitePhone,
          p_expires_in: '7 days',
          p_notes: 'Teste de template de convite via debug',
          p_channel_preference: 'whatsapp'
        });

      console.log('🎯 [TESTE TEMPLATE] Resultado do convite:', inviteResult);

      if (inviteError || inviteResult?.status !== 'success') {
        throw new Error(inviteResult?.message || inviteError?.message || 'Erro ao criar convite');
      }

      const inviteToken = inviteResult.token;
      const inviteId = inviteResult.invite_id;
      const inviteUrl = `${window.location.origin}/convite/${inviteToken}`;

      console.log('🎯 [TESTE TEMPLATE] Convite criado:', {
        id: inviteId,
        token: inviteToken,
        url: inviteUrl
      });

      // Passo 3: Enviar via WhatsApp usando o template "convitevia"
      const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-invite', {
        body: {
          phone: invitePhone,
          inviteUrl: inviteUrl,
          roleName: 'Member',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          senderName: 'Sistema de Teste',
          notes: 'Teste de template via debug',
          inviteId: inviteId
        }
      });

      console.log('🎯 [TESTE TEMPLATE] Resultado WhatsApp:', whatsappResult);

      const result = {
        success: !whatsappError && whatsappResult?.success,
        invite: {
          id: inviteId,
          token: inviteToken,
          url: inviteUrl,
          email: inviteEmail,
          phone: invitePhone
        },
        whatsapp: whatsappResult,
        error: whatsappError?.message,
        timestamp: new Date().toISOString()
      };

      setTemplateTestResult(result);

      if (result.success) {
        toast({
          title: "✅ Template de Convite Enviado",
          description: `Template "convitevia" enviado para ${invitePhone}`,
        });
      } else {
        toast({
          title: "❌ Erro no Template",
          description: result.error || 'Erro desconhecido',
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('🎯 [TESTE TEMPLATE] Erro:', error);
      const errorResult = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      setTemplateTestResult(errorResult);
      toast({
        title: "Erro no Teste",
        description: `Falha ao testar template de convite: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTemplateTesting(false);
    }
  };

  const getOverallStatus = (): 'success' | 'error' | 'warning' | 'loading' => {
    if (loading) return 'loading';
    if (!diagnostics) return 'error';
    
    const { summary } = diagnostics;
    if (summary.failed > 0) return 'error';
    if (summary.warnings > 0) return 'warning';
    return 'success';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Smartphone className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Debug WhatsApp</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Diagnóstico completo da integração WhatsApp Business. 
            Verificação automática de credenciais, templates e funcionalidades.
          </p>
          
          {/* Status Geral e Controles */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge 
              variant={getOverallStatus() === 'success' ? 'default' : getOverallStatus() === 'error' ? 'destructive' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {getOverallStatus() === 'success' && '✅ Sistema Funcionando'}
              {getOverallStatus() === 'error' && '❌ Problemas Detectados'}
              {getOverallStatus() === 'warning' && '⚠️ Avisos Encontrados'}
              {getOverallStatus() === 'loading' && '🔄 Verificando...'}
            </Badge>
            
            <Button 
              onClick={runDiagnostics} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Atualizar
            </Button>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="auto-refresh" className="text-sm">
                Auto-refresh (30s)
              </Label>
            </div>
          </div>
        </div>

        {diagnostics && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Última verificação: {new Date(diagnostics.timestamp).toLocaleString('pt-BR')} • 
              {diagnostics.summary.passed}/{diagnostics.summary.total_checks} verificações OK
            </p>
          </div>
        )}

        {/* Cards de Status */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Credenciais do Supabase */}
          <StatusCard
            title="Credenciais Supabase"
            icon={<Key className="h-6 w-6 text-primary" />}
            status={
              loading ? 'loading' : 
              !diagnostics ? 'unknown' :
              diagnostics.credentials.success ? 'success' : 'error'
            }
            details={diagnostics?.credentials.details || []}
            warnings={diagnostics?.credentials.warnings}
            errors={diagnostics?.credentials.errors}
          />

          {/* API WhatsApp */}
          <StatusCard
            title="API WhatsApp"
            icon={<MessageSquare className="h-6 w-6 text-primary" />}
            status={
              loading ? 'loading' : 
              !diagnostics?.whatsapp_api ? 'unknown' :
              diagnostics.whatsapp_api.success ? 'success' : 'error'
            }
            details={diagnostics?.whatsapp_api?.details || []}
            warnings={diagnostics?.whatsapp_api?.warnings}
            errors={diagnostics?.whatsapp_api?.errors}
          />

          {/* Template "convitevia" */}
          <StatusCard
            title="Template 'convitevia'"
            icon={<FileText className="h-6 w-6 text-primary" />}
            status={
              testingTemplate ? 'loading' :
              loading ? 'loading' : 
              !diagnostics?.template_status ? 'unknown' :
              diagnostics.template_status.success ? 'success' : 'error'
            }
            details={diagnostics?.template_status?.details || []}
            warnings={diagnostics?.template_status?.warnings}
            errors={diagnostics?.template_status?.errors}
            action={testTemplate}
            actionLabel="Verificar Template"
            actionLoading={testingTemplate}
          />

          {/* Status do Phone Number */}
          <StatusCard
            title="Phone Number"
            icon={<Phone className="h-6 w-6 text-primary" />}
            status={
              loading ? 'loading' : 
              !diagnostics?.phone_number ? 'unknown' :
              diagnostics.phone_number.success ? 'success' : 'error'
            }
            details={diagnostics?.phone_number?.details || []}
            warnings={diagnostics?.phone_number?.warnings}
            errors={diagnostics?.phone_number?.errors}
          />
        </div>

        <Separator />

        {/* Seção de Templates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Gerenciamento de Templates</CardTitle>
                  <CardDescription>
                    Visualize todos os templates disponíveis e teste envios específicos
                  </CardDescription>
                </div>
              </div>
              <Button 
                onClick={loadAllTemplates} 
                disabled={loadingTemplates}
                variant="outline"
                size="sm"
              >
                {loadingTemplates ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Carregar Templates
              </Button>
            </div>
          </CardHeader>
          
          {allTemplates && (
            <CardContent className="space-y-4">
              {/* Resumo dos Templates */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{allTemplates.summary.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-3 bg-green-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{allTemplates.summary.approved}</div>
                  <div className="text-sm text-muted-foreground">Aprovados</div>
                </div>
                <div className="text-center p-3 bg-yellow-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{allTemplates.summary.pending}</div>
                  <div className="text-sm text-muted-foreground">Pendentes</div>
                </div>
                <div className="text-center p-3 bg-red-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{allTemplates.summary.rejected}</div>
                  <div className="text-sm text-muted-foreground">Rejeitados</div>
                </div>
              </div>

              {/* Lista de Templates */}
              {allTemplates.templates && allTemplates.templates.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Templates Disponíveis:</h4>
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {allTemplates.templates.map((template: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{template.name}</h5>
                              <Badge variant={
                                template.status === 'APPROVED' ? 'default' :
                                template.status === 'PENDING' ? 'secondary' :
                                template.status === 'REJECTED' ? 'destructive' : 'outline'
                              }>
                                {template.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex gap-4 mt-1">
                              <span>🌐 {template.language}</span>
                              <span>📁 {template.category}</span>
                              {template.quality_score && (
                                <span>⭐ {template.quality_score.score}/5</span>
                              )}
                            </div>
                          </div>
                          
                          {template.status === 'APPROVED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTemplate(template.name);
                                testSpecificTemplate();
                              }}
                              disabled={testingSpecificTemplate}
                            >
                              {testingSpecificTemplate && selectedTemplate === template.name ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Send className="h-4 w-4 mr-2" />
                              )}
                              Testar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teste Manual de Template */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Teste Manual de Template</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="template-select">Template</Label>
                    <select
                      id="template-select"
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      <option value="">Selecione um template...</option>
                      {allTemplates?.templates?.filter((t: any) => t.status === 'APPROVED').map((template: any) => (
                        <option key={template.name} value={template.name}>
                          {template.name} ({template.language})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="template-phone">Número de Teste</Label>
                    <Input
                      id="template-phone"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="5511999999999"
                      type="tel"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={testSpecificTemplate}
                      disabled={testingSpecificTemplate || !selectedTemplate || !testPhone}
                      className="w-full"
                    >
                      {testingSpecificTemplate ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Testar Template
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <Separator />

        {/* Teste de Envio */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Send className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Teste de Envio Real</CardTitle>
                <CardDescription>
                  Envie uma mensagem de teste para verificar se o sistema está funcionando
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="test-phone">Número de Teste</Label>
                <Input
                  id="test-phone"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="5511999999999"
                  type="tel"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use seu próprio número para testar (com código do país)
                </p>
              </div>
              <Button 
                onClick={testSending} 
                disabled={testingSend || !testPhone}
                className="shrink-0"
              >
                {testingSend ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Teste
              </Button>
            </div>

            {sendTestResult && (
              <Alert className={sendTestResult.success ? 'bg-primary/5 border-primary' : 'bg-destructive/5 border-destructive'}>
                <div className="flex items-center gap-2">
                  {sendTestResult.success ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <AlertDescription>
                    <div className="space-y-1">
                      {sendTestResult.details?.map((detail: string, index: number) => (
                        <div key={index}>{detail}</div>
                      ))}
                      {sendTestResult.errors?.map((error: string, index: number) => (
                        <div key={index} className="text-destructive">{error}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Teste de Template de Convite */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>🎯 Teste de Template de Convite</CardTitle>
                <CardDescription>
                  Teste completo do fluxo de convite: criação → envio via WhatsApp → template "convitevia"
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invite-email">Email do Convite</Label>
                <Input
                  id="invite-email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teste@exemplo.com"
                  type="email"
                />
              </div>
              <div>
                <Label htmlFor="invite-phone">Telefone (WhatsApp)</Label>
                <Input
                  id="invite-phone"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  placeholder="5511999999999"
                  type="tel"
                />
              </div>
            </div>

            <Button 
              onClick={testInviteTemplate} 
              disabled={templateTesting}
              className="w-full"
              size="lg"
            >
              {templateTesting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {templateTesting ? 'Enviando Template de Convite...' : 'Testar Template de Convite Completo'}
            </Button>

            {templateTestResult && (
              <Alert className={templateTestResult.success ? 'bg-primary/5 border-primary' : 'bg-destructive/5 border-destructive'}>
                <div className="flex items-start gap-3">
                  {templateTestResult.success ? (
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  )}
                  <div className="space-y-3 flex-1">
                    <AlertDescription>
                      <div className="font-medium">
                        {templateTestResult.success ? '✅ Template Enviado com Sucesso!' : '❌ Erro no Envio do Template'}
                      </div>
                    </AlertDescription>
                    
                    {templateTestResult.invite && (
                      <div className="bg-background/50 p-3 rounded border">
                        <div className="text-sm font-medium mb-2">📋 Convite Criado:</div>
                        <div className="space-y-1 text-sm">
                          <div>ID: <code className="bg-muted px-1 rounded">{templateTestResult.invite.id}</code></div>
                          <div>Token: <code className="bg-muted px-1 rounded">{templateTestResult.invite.token}</code></div>
                          <div>URL: <a href={templateTestResult.invite.url} target="_blank" className="text-primary underline break-all">{templateTestResult.invite.url}</a></div>
                        </div>
                      </div>
                    )}

                    {templateTestResult.whatsapp && (
                      <div className="bg-background/50 p-3 rounded border">
                        <div className="text-sm font-medium mb-2">📱 WhatsApp:</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span>Status:</span>
                            <Badge variant={templateTestResult.whatsapp.success ? 'default' : 'destructive'}>
                              {templateTestResult.whatsapp.success ? 'Enviado' : 'Falhou'}
                            </Badge>
                          </div>
                          <div>Método: <code className="bg-muted px-1 rounded">{templateTestResult.whatsapp.method}</code></div>
                          <div>Telefone: <code className="bg-muted px-1 rounded">{templateTestResult.whatsapp.phone}</code></div>
                          {templateTestResult.whatsapp.whatsappId && (
                            <div>Message ID: <code className="bg-muted px-1 rounded">{templateTestResult.whatsapp.whatsappId}</code></div>
                          )}
                        </div>
                      </div>
                    )}

                    {templateTestResult.error && (
                      <div className="bg-destructive/10 p-3 rounded border border-destructive/20">
                        <div className="text-sm font-medium text-destructive mb-1">🚨 Erro Detalhado:</div>
                        <div className="text-sm text-destructive">{templateTestResult.error}</div>
                      </div>
                    )}

                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        🔍 Ver Logs Completos (JSON)
                      </summary>
                      <pre className="bg-muted p-3 rounded mt-2 overflow-auto max-h-40 text-xs">
                        {JSON.stringify(templateTestResult, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              </Alert>
            )}

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="text-sm font-medium mb-2">ℹ️ Como funciona este teste:</div>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Cria um convite real no banco usando <code>create_invite_hybrid</code></li>
                <li>Gera URL válida de convite (<code>/convite/TOKEN</code>)</li>
                <li>Envia template "convitevia" via WhatsApp Business API</li>
                <li>Atualiza estatísticas de envio no banco</li>
                <li>Mostra logs detalhados de cada etapa</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Instruções de Configuração */}
        {diagnostics && diagnostics.summary.failed > 0 && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Como Configurar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm">1. Configurar Credenciais no Supabase</h4>
                  <p className="text-sm text-muted-foreground">
                    Vá para Supabase → Settings → Edge Functions e adicione:
                  </p>
                  <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                    <li>• <code>WHATSAPP_BUSINESS_TOKEN</code> - Token do WhatsApp Business API</li>
                    <li>• <code>WHATSAPP_BUSINESS_PHONE_ID</code> - ID do número do WhatsApp Business</li>
                    <li>• <code>WHATSAPP_BUSINESS_ACCOUNT_ID</code> - ID da conta Business (385471239079413)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm">2. Criar Template "convitevia"</h4>
                  <p className="text-sm text-muted-foreground">
                    No WhatsApp Business Manager, crie um template com o nome exato "convitevia".
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm">3. Links Úteis</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer">
                        Facebook Developers
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://business.facebook.com/wa/manage/message-templates" target="_blank" rel="noopener noreferrer">
                        WhatsApp Templates
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WhatsAppDebug;