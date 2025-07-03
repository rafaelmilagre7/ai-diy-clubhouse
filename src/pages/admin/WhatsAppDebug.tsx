import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusCard } from '@/components/debug/StatusCard';
import { JsonViewer } from '@/components/debug/JsonViewer';
import { LogsViewer } from '@/components/debug/LogsViewer';
import { 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  MessageSquare, 
  Zap,
  Shield,
  Smartphone,
  Loader2,
  RefreshCw,
  Eye,
  Search,
  Bug,
  Globe,
  Key,
  ArrowRight,
  BookOpen,
  ExternalLink,
  HelpCircle,
  Rocket,
  Play,
  Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ConfigTestResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
  category?: 'config' | 'connectivity' | 'templates' | 'permissions';
  suggestion?: string;
}

interface BusinessAccount {
  id: string;
  name: string;
  verification_status: string;
}

interface AdvancedConfigCheck {
  tokenAnalysis: {
    type: string;
    expiresAt?: string;
    permissions: string[];
    missingPermissions: string[];
  };
  businessDiscovery: {
    strategies: Array<{
      name: string;
      success: boolean;
      businessId?: string;
      accounts?: BusinessAccount[];
      error?: string;
    }>;
    recommendedBusinessId?: string;
  };
  connectivityTests: ConfigTestResult[];
  templates: {
    available: any[];
    approved: number;
    pending: number;
    rejected: number;
  };
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

const WhatsAppDebug: React.FC = () => {
  const [config, setConfig] = useState({
    token: '',
    businessId: '',
    phoneNumberId: '',
    webhookToken: ''
  });
  
  const [testResults, setTestResults] = useState<ConfigTestResult[]>([]);
  const [advancedResults, setAdvancedResults] = useState<AdvancedConfigCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('wizard');
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [autoTestEnabled, setAutoTestEnabled] = useState(true);
  
  const [credentialsStatus, setCredentialsStatus] = useState<{
    loaded: boolean;
    lastChecked: Date | null;
    isValid: boolean | null;
    autoVerifying: boolean;
    score: number;
  }>({
    loaded: false,
    lastChecked: null,
    isValid: null,
    autoVerifying: false,
    score: 0
  });

  const wizardSteps: WizardStep[] = [
    {
      id: 'token',
      title: 'Token de Acesso',
      description: 'Configure seu token de acesso do WhatsApp Business API',
      completed: !!config.token,
      required: true
    },
    {
      id: 'phone',
      title: 'Phone Number ID',
      description: 'Informe o ID do número de telefone autorizado',
      completed: !!config.phoneNumberId,
      required: true
    },
    {
      id: 'business',
      title: 'Business Account ID',
      description: 'Configure o ID da conta comercial (opcional - pode ser descoberto automaticamente)',
      completed: !!config.businessId,
      required: false
    },
    {
      id: 'webhook',
      title: 'Webhook Token',
      description: 'Token de verificação para webhooks (opcional)',
      completed: !!config.webhookToken,
      required: false
    },
    {
      id: 'test',
      title: 'Teste Final',
      description: 'Validar toda a configuração',
      completed: credentialsStatus.isValid === true,
      required: true
    }
  ];

  const completedSteps = wizardSteps.filter(step => step.completed).length;
  const wizardProgress = (completedSteps / wizardSteps.length) * 100;

  // Carregar configuração salva e auto-verificar
  useEffect(() => {
    loadSavedConfigAndVerify();
  }, []);

  // Auto-teste quando config mudar
  useEffect(() => {
    if (autoTestEnabled && config.token && config.phoneNumberId) {
      const timer = setTimeout(() => {
        autoVerifyCredentials(config);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [config.token, config.phoneNumberId, autoTestEnabled]);

  const addLog = (message: string, category: string = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] [${category.toUpperCase()}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
  };

  const calculateCredentialScore = (configToCheck: any) => {
    let score = 0;
    if (configToCheck.token) score += 40;
    if (configToCheck.phoneNumberId) score += 40;
    if (configToCheck.businessId) score += 15;
    if (configToCheck.webhookToken) score += 5;
    return score;
  };

  const loadSavedConfigAndVerify = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'whatsapp_config')
        .single();

      if (data && !error) {
        const savedConfig = data.value;
        const newConfig = {
          token: savedConfig.access_token || '',
          businessId: savedConfig.business_account_id || '',
          phoneNumberId: savedConfig.phone_number_id || '',
          webhookToken: savedConfig.webhook_verify_token || ''
        };
        
        setConfig(newConfig);
        setCredentialsStatus(prev => ({ 
          ...prev, 
          loaded: true,
          score: calculateCredentialScore(newConfig)
        }));
        addLog('✅ Configuração carregada do banco de dados', 'success');
        
        // Auto-verificar se temos credenciais válidas
        if (savedConfig.access_token && savedConfig.phone_number_id) {
          addLog('🔍 Credenciais encontradas - executando verificação automática...', 'info');
          await autoVerifyCredentials(newConfig);
        }
      } else {
        setCredentialsStatus(prev => ({ ...prev, loaded: true }));
        addLog('⚠️ Nenhuma configuração salva encontrada', 'warning');
      }
    } catch (error) {
      setCredentialsStatus(prev => ({ ...prev, loaded: true }));
      addLog(`❌ Erro ao carregar configuração: ${error}`, 'error');
    }
  };

  const autoVerifyCredentials = async (configToVerify: any) => {
    setCredentialsStatus(prev => ({ ...prev, autoVerifying: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'basic_test',
          config: configToVerify
        }
      });

      const isValid = data?.results?.every((result: ConfigTestResult) => result.success) || false;
      
      setCredentialsStatus(prev => ({
        ...prev,
        isValid,
        lastChecked: new Date(),
        autoVerifying: false,
        score: calculateCredentialScore(configToVerify)
      }));

      if (isValid) {
        addLog('✅ Verificação automática: Credenciais válidas e funcionando', 'success');
        toast.success('WhatsApp configurado corretamente!');
      } else {
        addLog('❌ Verificação automática: Problemas detectados nas credenciais', 'error');
        if (data?.results) {
          data.results.forEach((result: ConfigTestResult) => {
            if (!result.success) {
              addLog(`  • ${result.test}: ${result.message}`, 'error');
              if (result.suggestion) {
                addLog(`    💡 Sugestão: ${result.suggestion}`, 'info');
              }
            }
          });
        }
      }
      
    } catch (error) {
      setCredentialsStatus(prev => ({
        ...prev,
        isValid: false,
        lastChecked: new Date(),
        autoVerifying: false
      }));
      addLog(`❌ Erro na verificação automática: ${error}`, 'error');
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      const configToSave = {
        access_token: config.token,
        business_account_id: config.businessId,
        phone_number_id: config.phoneNumberId,
        webhook_verify_token: config.webhookToken
      };

      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'whatsapp_config',
          value: configToSave
        });

      if (error) throw error;
      
      addLog('✅ Configuração salva com sucesso', 'success');
      toast.success('Configuração salva!');
      
      // Re-verificar credenciais após salvar
      if (config.token && config.phoneNumberId) {
        await autoVerifyCredentials(config);
      }
    } catch (error) {
      addLog(`❌ Erro ao salvar configuração: ${error}`, 'error');
      toast.error('Erro ao salvar configuração');
    } finally {
      setIsLoading(false);
    }
  };

  const runAdvancedDiagnostics = async () => {
    setIsLoading(true);
    setAdvancedResults(null);
    addLog('🔍 Iniciando diagnósticos avançados', 'info');

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'advanced_diagnostics',
          config 
        }
      });

      if (error) throw error;

      setAdvancedResults(data);
      addLog('✅ Diagnósticos avançados concluídos', 'success');

      // Log dos resultados detalhados
      if (data.tokenAnalysis) {
        addLog(`🔑 Token Type: ${data.tokenAnalysis.type}`, 'info');
        addLog(`📋 Permissões: ${data.tokenAnalysis.permissions.join(', ')}`, 'info');
        if (data.tokenAnalysis.missingPermissions.length > 0) {
          addLog(`⚠️ Permissões em falta: ${data.tokenAnalysis.missingPermissions.join(', ')}`, 'warning');
        }
      }

      if (data.businessDiscovery?.recommendedBusinessId) {
        addLog(`💼 Business ID recomendado: ${data.businessDiscovery.recommendedBusinessId}`, 'success');
      }

    } catch (error) {
      addLog(`❌ Erro nos diagnósticos avançados: ${error}`, 'error');
      toast.error('Erro ao executar diagnósticos avançados');
    } finally {
      setIsLoading(false);
    }
  };

  const testManualBusinessId = async (businessId: string) => {
    if (!businessId.trim()) return;
    
    addLog(`🔍 Testando Business ID manual: ${businessId}`, 'info');
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'test_business_id',
          config: { ...config, businessId }
        }
      });

      if (error) throw error;

      if (data.success) {
        addLog(`✅ Business ID ${businessId} validado com sucesso`, 'success');
        setConfig(prev => ({ ...prev, businessId }));
        toast.success('Business ID válido!');
      } else {
        addLog(`❌ Business ID ${businessId} inválido: ${data.message}`, 'error');
        toast.error('Business ID inválido');
      }
    } catch (error) {
      addLog(`❌ Erro ao testar Business ID: ${error}`, 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('🧹 Logs limpos', 'info');
  };

  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderWizardStep = () => {
    const step = wizardSteps[currentStep];
    
    switch (step.id) {
      case 'token':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token">Token de Acesso do WhatsApp Business API</Label>
              <div className="relative">
                <Input
                  id="token"
                  type={showPassword ? "text" : "password"}
                  value={config.token}
                  onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
                  placeholder="Seu token de acesso da Meta for Developers"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Token permanente obtido no Meta for Developers
              </p>
            </div>
            
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Como obter o token:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Acesse <a href="https://developers.facebook.com/" target="_blank" className="text-blue-400 hover:underline">Meta for Developers</a></li>
                    <li>Vá para "Meus Apps" → Seu App → WhatsApp</li>
                    <li>Copie o "Token de Acesso" permanente</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        );
        
      case 'phone':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phoneNumberId">Phone Number ID</Label>
              <Input
                id="phoneNumberId"
                value={config.phoneNumberId}
                onChange={(e) => setConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                placeholder="ex: 123456789012345"
              />
              <p className="text-sm text-muted-foreground">
                ID do número de telefone registrado no WhatsApp Business
              </p>
            </div>
            
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Como encontrar o Phone Number ID:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>No Meta for Developers, acesse WhatsApp → Introdução</li>
                    <li>Localize a seção "Enviar mensagens"</li>
                    <li>Copie o número que aparece em "De: Phone number ID"</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        );
        
      case 'business':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessId">Business Account ID (Opcional)</Label>
              <Input
                id="businessId"
                value={config.businessId}
                onChange={(e) => setConfig(prev => ({ ...prev, businessId: e.target.value }))}
                placeholder="ex: 123456789012345"
              />
              <p className="text-sm text-muted-foreground">
                Deixe em branco para descoberta automática
              </p>
            </div>
            
            {advancedResults?.businessDiscovery?.recommendedBusinessId && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>Business ID recomendado: <strong>{advancedResults.businessDiscovery.recommendedBusinessId}</strong></span>
                    <Button 
                      size="sm" 
                      onClick={() => testManualBusinessId(advancedResults.businessDiscovery.recommendedBusinessId!)}
                    >
                      Usar este ID
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              variant="outline" 
              onClick={runAdvancedDiagnostics}
              disabled={!config.token}
            >
              <Search className="h-4 w-4 mr-2" />
              Descobrir Business ID Automaticamente
            </Button>
          </div>
        );
        
      case 'webhook':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="webhookToken">Webhook Verify Token (Opcional)</Label>
              <Input
                id="webhookToken"
                value={config.webhookToken}
                onChange={(e) => setConfig(prev => ({ ...prev, webhookToken: e.target.value }))}
                placeholder="Token personalizado para verificação"
              />
              <p className="text-sm text-muted-foreground">
                Token usado para verificar webhooks do WhatsApp
              </p>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Este token é usado apenas se você planeja receber webhooks do WhatsApp. 
                Para apenas enviar mensagens, pode deixar em branco.
              </AlertDescription>
            </Alert>
          </div>
        );
        
      case 'test':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Rocket className="h-16 w-16 mx-auto text-green-400" />
              <h3 className="text-xl font-semibold">Pronto para Testar!</h3>
              <p className="text-muted-foreground">
                Vamos validar sua configuração completa do WhatsApp
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatusCard
                title="Token de Acesso"
                success={!!config.token}
                value={config.token ? 'Configurado' : 'Pendente'}
                icon={<Key className="h-4 w-4" />}
              />
              <StatusCard
                title="Phone Number ID"
                success={!!config.phoneNumberId}
                value={config.phoneNumberId ? 'Configurado' : 'Pendente'}
                icon={<Phone className="h-4 w-4" />}
              />
              <StatusCard
                title="Business ID"
                success={true}
                value={config.businessId ? 'Configurado' : 'Auto-descoberta'}
                icon={<Globe className="h-4 w-4" />}
              />
              <StatusCard
                title="Status Geral"
                success={credentialsStatus.isValid === true}
                warning={credentialsStatus.autoVerifying}
                value={
                  credentialsStatus.autoVerifying ? 'Testando...' :
                  credentialsStatus.isValid === true ? 'Válido' :
                  credentialsStatus.isValid === false ? 'Erro' :
                  'Não testado'
                }
                icon={credentialsStatus.autoVerifying ? 
                  <Loader2 className="h-4 w-4 animate-spin" /> : 
                  <Shield className="h-4 w-4" />}
              />
            </div>
            
            {credentialsStatus.isValid === true && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ Parabéns! Sua configuração do WhatsApp está funcionando perfeitamente.
                </AlertDescription>
              </Alert>
            )}
            
            {credentialsStatus.isValid === false && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Problemas detectados na configuração. Verifique os logs na aba "Monitoramento" para mais detalhes.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-8 w-8 text-green-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">WhatsApp Debug Center</h1>
          <p className="text-slate-400">Centro de configuração e diagnóstico inteligente</p>
        </div>
      </div>

      {/* Resumo do Status */}
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status Geral</p>
              <div className="flex items-center gap-2">
                {credentialsStatus.isValid === true ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : credentialsStatus.isValid === false ? (
                  <XCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                )}
                <span className="font-medium">
                  {credentialsStatus.isValid === true ? 'Operacional' : 
                   credentialsStatus.isValid === false ? 'Com Problemas' : 'Não Configurado'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pontuação da Config</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{credentialsStatus.score}/100</span>
                  <Badge variant={credentialsStatus.score >= 80 ? "default" : credentialsStatus.score >= 40 ? "secondary" : "destructive"}>
                    {credentialsStatus.score >= 80 ? "Excelente" : credentialsStatus.score >= 40 ? "Bom" : "Incompleto"}
                  </Badge>
                </div>
                <Progress value={credentialsStatus.score} className="h-2" />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Última Verificação</p>
              <p className="font-medium">
                {credentialsStatus.lastChecked 
                  ? credentialsStatus.lastChecked.toLocaleString() 
                  : 'Nunca'}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Auto-teste</p>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoTestEnabled}
                  onChange={(e) => setAutoTestEnabled(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Ativado</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wizard" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Configuração Guiada
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Diagnósticos
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração Manual
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Monitoramento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assistente de Configuração</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Passo {currentStep + 1} de {wizardSteps.length}: {wizardSteps[currentStep].title}
                  </p>
                </div>
                <Badge variant="secondary">
                  {completedSteps}/{wizardSteps.length} concluídos
                </Badge>
              </div>
              <div className="space-y-2">
                <Progress value={wizardProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {wizardSteps.map((step, index) => (
                    <span key={step.id} className={index === currentStep ? "text-primary font-medium" : ""}>
                      {step.title}
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderWizardStep()}
              
              <div className="flex items-center justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Anterior
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={saveConfig}
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Settings className="h-4 w-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                  
                  {currentStep < wizardSteps.length - 1 ? (
                    <Button onClick={nextStep}>
                      Próximo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => autoVerifyCredentials(config)}
                      disabled={credentialsStatus.autoVerifying || !config.token || !config.phoneNumberId}
                    >
                      {credentialsStatus.autoVerifying ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Testar Configuração
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="flex gap-3 mb-4">
            <Button 
              onClick={runAdvancedDiagnostics}
              disabled={isLoading || !config.token}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bug className="h-4 w-4 mr-2" />
              )}
              Executar Diagnósticos Completos
            </Button>
            
            <Button variant="outline" asChild>
              <a href="https://developers.facebook.com/docs/whatsapp" target="_blank">
                <BookOpen className="h-4 w-4 mr-2" />
                Documentação
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>

          {advancedResults && (
            <div className="space-y-6">
              {/* Token Analysis */}
              {advancedResults.tokenAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Análise do Token
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <StatusCard
                        title="Tipo do Token"
                        success={advancedResults.tokenAnalysis.type === 'page'}
                        value={advancedResults.tokenAnalysis.type}
                        icon={<Shield className="h-4 w-4" />}
                      />
                      
                      {advancedResults.tokenAnalysis.expiresAt && (
                        <StatusCard
                          title="Expira em"
                          success={new Date(advancedResults.tokenAnalysis.expiresAt) > new Date()}
                          value={new Date(advancedResults.tokenAnalysis.expiresAt).toLocaleDateString()}
                          icon={<AlertTriangle className="h-4 w-4" />}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-400">Permissões Disponíveis:</h4>
                      <div className="flex flex-wrap gap-2">
                        {advancedResults.tokenAnalysis.permissions.map(permission => (
                          <Badge key={permission} variant="secondary" className="bg-green-900/20 text-green-400">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {advancedResults.tokenAnalysis.missingPermissions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-red-400">Permissões em Falta:</h4>
                        <div className="flex flex-wrap gap-2">
                          {advancedResults.tokenAnalysis.missingPermissions.map(permission => (
                            <Badge key={permission} variant="destructive">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Configure as permissões faltantes no Meta for Developers → App Settings → Permissions.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Business Discovery */}
              {advancedResults.businessDiscovery && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Descoberta de Business ID
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {advancedResults.businessDiscovery.recommendedBusinessId && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span>Business ID recomendado: <strong>{advancedResults.businessDiscovery.recommendedBusinessId}</strong></span>
                            <Button 
                              size="sm" 
                              onClick={() => testManualBusinessId(advancedResults.businessDiscovery.recommendedBusinessId!)}
                            >
                              Usar este ID
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-3">
                      <h4 className="font-semibold">Estratégias de Descoberta:</h4>
                      {advancedResults.businessDiscovery.strategies.map((strategy, index) => (
                        <StatusCard
                          key={index}
                          title={strategy.name}
                          success={strategy.success}
                          value={strategy.success ? 'Sucesso' : 'Falhou'}
                          icon={strategy.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Templates */}
              {advancedResults.templates && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Templates de Mensagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <StatusCard
                        title="Aprovados"
                        success={advancedResults.templates.approved > 0}
                        value={advancedResults.templates.approved.toString()}
                      />
                      <StatusCard
                        title="Pendentes"
                        success={advancedResults.templates.pending === 0}
                        value={advancedResults.templates.pending.toString()}
                        warning={advancedResults.templates.pending > 0}
                      />
                      <StatusCard
                        title="Rejeitados"
                        success={advancedResults.templates.rejected === 0}
                        value={advancedResults.templates.rejected.toString()}
                      />
                    </div>
                    
                    {advancedResults.templates.available.length > 0 && (
                      <JsonViewer 
                        data={advancedResults.templates.available} 
                        title="Templates Disponíveis"
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Manual Avançada</CardTitle>
              <p className="text-sm text-muted-foreground">
                Para usuários experientes - configure cada campo individualmente
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-token">Token de Acesso</Label>
                  <div className="relative">
                    <Input
                      id="manual-token"
                      type={showPassword ? "text" : "password"}
                      value={config.token}
                      onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
                      placeholder="Token da API do WhatsApp"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-businessId">Business Account ID</Label>
                  <Input
                    id="manual-businessId"
                    value={config.businessId}
                    onChange={(e) => setConfig(prev => ({ ...prev, businessId: e.target.value }))}
                    placeholder="ID da conta de negócios"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-phoneNumberId">Phone Number ID</Label>
                  <Input
                    id="manual-phoneNumberId"
                    value={config.phoneNumberId}
                    onChange={(e) => setConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                    placeholder="ID do número de telefone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-webhookToken">Webhook Token</Label>
                  <Input
                    id="manual-webhookToken"
                    value={config.webhookToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, webhookToken: e.target.value }))}
                    placeholder="Token do webhook"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={saveConfig} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  Salvar Configuração
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => autoVerifyCredentials(config)}
                  disabled={credentialsStatus.autoVerifying || !config.token}
                >
                  {credentialsStatus.autoVerifying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Testar Conectividade
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Testes Manuais */}
          <Card>
            <CardHeader>
              <CardTitle>Testes Manuais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Testar Business ID Específico</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o Business ID para testar"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        testManualBusinessId(target.value);
                      }
                    }}
                  />
                  <Button 
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input');
                      if (input?.value) testManualBusinessId(input.value);
                    }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Testar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados dos Testes */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados dos Testes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="space-y-2">
                      <StatusCard
                        title={result.test}
                        success={result.success}
                        value={result.success ? 'OK' : 'Erro'}
                      />
                      {!result.success && result.suggestion && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Sugestão:</strong> {result.suggestion}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <LogsViewer 
            logs={logs} 
            onClear={clearLogs}
          />
          
          {/* Links Úteis */}
          <Card>
            <CardHeader>
              <CardTitle>Links Úteis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" asChild>
                  <a href="https://developers.facebook.com/" target="_blank" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Meta for Developers
                  </a>
                </Button>
                
                <Button variant="outline" asChild>
                  <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    WhatsApp Cloud API Docs
                  </a>
                </Button>
                
                <Button variant="outline" asChild>
                  <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks" target="_blank" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Configurar Webhooks
                  </a>
                </Button>
                
                <Button variant="outline" asChild>
                  <a href="https://business.whatsapp.com/" target="_blank" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    WhatsApp Business Manager
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppDebug;