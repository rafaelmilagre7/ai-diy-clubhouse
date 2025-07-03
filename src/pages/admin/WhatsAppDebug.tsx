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
import { Phone, CheckCircle, XCircle, AlertTriangle, Settings, MessageSquare, Zap, Shield, Smartphone, Loader2, RefreshCw, Eye, Search, Bug, Globe, Key, ArrowRight, BookOpen, ExternalLink, HelpCircle, Rocket, Play, Info } from 'lucide-react';
import { TemplateCard } from '@/components/admin/whatsapp/TemplateCard';
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
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);
  const [lastDiagnostics, setLastDiagnostics] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('wizard');
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [autoTestEnabled, setAutoTestEnabled] = useState(false);
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

  const [supabaseSecretsStatus, setSupabaseSecretsStatus] = useState<{
    testing: boolean;
    lastChecked: Date | null;
    results: any | null;
    isValid: boolean | null;
  }>({
    testing: false,
    lastChecked: null,
    results: null,
    isValid: null
  });

  const [templatesStatus, setTemplatesStatus] = useState<{
    loading: boolean;
    lastChecked: Date | null;
    templates: any[];
    stats: any | null;
    filters: {
      search: string;
      status: string;
      category: string;
    };
  }>({
    loading: false,
    lastChecked: null,
    templates: [],
    stats: null,
    filters: {
      search: '',
      status: '',
      category: ''
    }
  });


  const wizardSteps: WizardStep[] = [{
    id: 'token',
    title: 'Token de Acesso',
    description: 'Configure seu token de acesso do WhatsApp Business API',
    completed: !!config.token,
    required: true
  }, {
    id: 'phone',
    title: 'Phone Number ID',
    description: 'Informe o ID do número de telefone autorizado',
    completed: !!config.phoneNumberId,
    required: true
  }, {
    id: 'business',
    title: 'Business Account ID',
    description: 'Configure o ID da conta comercial (opcional - pode ser descoberto automaticamente)',
    completed: !!config.businessId,
    required: false
  }, {
    id: 'webhook',
    title: 'Webhook Token',
    description: 'Token de verificação para webhooks (opcional)',
    completed: !!config.webhookToken,
    required: false
  }, {
    id: 'test',
    title: 'Teste Final',
    description: 'Validar toda a configuração',
    completed: credentialsStatus.isValid === true,
    required: true
  }];
  const completedSteps = wizardSteps.filter(step => step.completed).length;
  const wizardProgress = completedSteps / wizardSteps.length * 100;

  // Carregar configuração salva e auto-verificar
  useEffect(() => {
    loadSavedConfigAndVerify();
  }, []);

  // Auto-teste quando config mudar (com rate limiting)
  useEffect(() => {
    if (autoTestEnabled && config.token && config.phoneNumberId) {
      // Verificar se a última verificação foi há menos de 2 minutos
      const lastCheck = credentialsStatus.lastChecked;
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      
      if (lastCheck && lastCheck > twoMinutesAgo) {
        addLog('⏱️ Auto-teste pulado - última verificação muito recente', 'info');
        return;
      }
      
      const timer = setTimeout(() => {
        autoVerifyCredentials(config);
      }, 30000); // Aumentado para 30 segundos
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
      const {
        data,
        error
      } = await supabase.from('admin_settings').select('value').eq('key', 'whatsapp_config').single();
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

        // Auto-verificar se temos credenciais válidas (somente se auto-teste estiver habilitado)
        if (autoTestEnabled && savedConfig.access_token && savedConfig.phone_number_id) {
          addLog('🔍 Credenciais encontradas - executando verificação automática...', 'info');
          await autoVerifyCredentials(newConfig);
        } else if (savedConfig.access_token && savedConfig.phone_number_id) {
          addLog('ℹ️ Auto-teste desabilitado - use o botão "Testar Configuração" para verificar', 'info');
        }
      } else {
        setCredentialsStatus(prev => ({
          ...prev,
          loaded: true
        }));
        addLog('⚠️ Nenhuma configuração salva encontrada', 'warning');
      }
    } catch (error) {
      setCredentialsStatus(prev => ({
        ...prev,
        loaded: true
      }));
      addLog(`❌ Erro ao carregar configuração: ${error}`, 'error');
    }
  };
  const autoVerifyCredentials = async (configToVerify: any) => {
    setCredentialsStatus(prev => ({
      ...prev,
      autoVerifying: true
    }));
    addLog('🔍 Iniciando verificação automática das credenciais...', 'info');
    try {
      // Converter formato para o edge function
      const configForEdgeFunction = {
        access_token: configToVerify.token || configToVerify.access_token,
        phone_number_id: configToVerify.phoneNumberId || configToVerify.phone_number_id,
        business_account_id: configToVerify.businessId || configToVerify.business_account_id,
        webhook_verify_token: configToVerify.webhookToken || configToVerify.webhook_verify_token
      };
      addLog('📤 Enviando configuração para edge function:', 'info');
      addLog(`  • Token: ${configForEdgeFunction.access_token ? '✓' : '✗'}`, 'info');
      addLog(`  • Phone ID: ${configForEdgeFunction.phone_number_id ? '✓' : '✗'}`, 'info');
      const {
        data,
        error
      } = await supabase.functions.invoke('whatsapp-config-check', {
        body: {
          config: configForEdgeFunction
        }
      });
      if (error) {
        addLog(`❌ Erro na chamada da edge function: ${error.message}`, 'error');
        throw error;
      }
      addLog('📥 Resposta recebida da edge function', 'info');
      console.log('Resposta da edge function:', data);

      // Analisar resultados
      let isValid = false;
      if (data?.results) {
        const successCount = data.results.filter((r: any) => r.success).length;
        const totalTests = data.results.length;
        isValid = successCount >= totalTests * 0.75; // 75% dos testes devem passar

        addLog(`📊 Resultados: ${successCount}/${totalTests} testes passaram`, 'info');
      } else if (data?.summary) {
        isValid = data.summary.passed > 0 && data.summary.failed === 0;
        addLog(`📊 Resumo: ${data.summary.passed} sucessos, ${data.summary.failed} falhas`, 'info');
      }
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

        // Log detalhado dos problemas
        if (data?.results) {
          data.results.forEach((result: any) => {
            if (!result.success) {
              addLog(`  • ${result.test}: ${result.errors?.[0] || 'Erro desconhecido'}`, 'error');
              if (result.warnings?.length > 0) {
                result.warnings.forEach((warning: string) => {
                  addLog(`    ⚠️ ${warning}`, 'warning');
                });
              }
            } else {
              addLog(`  ✅ ${result.test}: OK`, 'success');
            }
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
      setCredentialsStatus(prev => ({
        ...prev,
        isValid: false,
        lastChecked: new Date(),
        autoVerifying: false
      }));
      addLog(`❌ Erro na verificação automática: ${errorMessage}`, 'error');

      // Sugestões específicas baseadas no tipo de erro
      if (errorMessage.includes('Function not found')) {
        addLog('💡 Sugestão: A edge function whatsapp-config-check não foi encontrada', 'info');
      } else if (errorMessage.includes('Unauthorized')) {
        addLog('💡 Sugestão: Verifique suas permissões de acesso', 'info');
      } else if (errorMessage.includes('timeout')) {
        addLog('💡 Sugestão: Timeout na verificação - tente novamente', 'info');
      }
      console.error('Erro completo na verificação:', error);
    }
  };
  const saveConfig = async () => {
    if (!config.token || !config.phoneNumberId) {
      addLog('❌ Token e Phone Number ID são obrigatórios', 'error');
      toast.error('Preencha pelo menos o Token e Phone Number ID');
      return;
    }
    setIsLoading(true);
    addLog('💾 Iniciando salvamento da configuração...', 'info');
    try {
      const configToSave = {
        access_token: config.token.trim(),
        business_account_id: config.businessId.trim(),
        phone_number_id: config.phoneNumberId.trim(),
        webhook_verify_token: config.webhookToken.trim()
      };
      addLog('📝 Dados a serem salvos:', 'info');
      addLog(`  • access_token: ${configToSave.access_token ? '✓ Preenchido' : '✗ Vazio'}`, 'info');
      addLog(`  • phone_number_id: ${configToSave.phone_number_id ? '✓ Preenchido' : '✗ Vazio'}`, 'info');
      addLog(`  • business_account_id: ${configToSave.business_account_id ? '✓ Preenchido' : '✗ Vazio'}`, 'info');
      const {
        error,
        data
      } = await supabase.from('admin_settings').upsert({
        key: 'whatsapp_config',
        value: configToSave,
        category: 'whatsapp',
        description: 'Configurações da API do WhatsApp Business',
        updated_by: (await supabase.auth.getUser()).data.user?.id
      }, {
        onConflict: 'key'
      });
      if (error) {
        addLog(`❌ Erro do Supabase: ${error.message}`, 'error');
        addLog(`❌ Detalhes: ${JSON.stringify(error)}`, 'error');
        throw new Error(`Erro ao salvar no banco: ${error.message}`);
      }
      addLog('✅ Configuração salva com sucesso no banco de dados', 'success');
      toast.success('Configuração salva com sucesso!');

      // Atualizar score das credenciais
      setCredentialsStatus(prev => ({
        ...prev,
        score: calculateCredentialScore(config),
        lastChecked: new Date()
      }));

      // Re-verificar credenciais após salvar (somente se auto-teste estiver habilitado)
      if (autoTestEnabled && config.token && config.phoneNumberId) {
        addLog('🔍 Executando verificação automática...', 'info');
        await autoVerifyCredentials(config);
      } else if (config.token && config.phoneNumberId) {
        addLog('ℹ️ Auto-teste desabilitado - use "Testar Configuração" para verificar', 'info');
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
      addLog(`❌ Erro ao salvar configuração: ${errorMessage}`, 'error');

      // Erro específico para diferentes tipos de problemas
      if (errorMessage.includes('permission')) {
        addLog('💡 Sugestão: Verifique se você tem permissões de administrador', 'info');
        toast.error('Erro de permissão - Verifique se você é administrador');
      } else if (errorMessage.includes('network')) {
        addLog('💡 Sugestão: Verifique sua conexão com a internet', 'info');
        toast.error('Erro de conectividade - Verifique sua internet');
      } else {
        toast.error(`Erro ao salvar: ${errorMessage}`);
      }
      console.error('Erro completo ao salvar configuração:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const runAdvancedDiagnostics = async () => {
    if (!config.token || !config.phoneNumberId) {
      toast.error("Access Token e Phone Number ID são obrigatórios para diagnósticos avançados");
      return;
    }
    setIsLoadingDiagnostics(true);
    addLog('🔍 Iniciando diagnósticos avançados com descoberta automática...', 'info');
    try {
      const configForEdgeFunction = {
        access_token: config.token,
        business_account_id: config.businessId,
        phone_number_id: config.phoneNumberId,
        webhook_verify_token: config.webhookToken
      };
      const {
        data,
        error
      } = await supabase.functions.invoke('whatsapp-config-check', {
        body: {
          action: 'advanced_diagnostics',
          config: configForEdgeFunction
        }
      });
      addLog('📥 Resposta recebida da edge function', 'info');
      console.log('Resposta da edge function:', data);
      if (error) {
        addLog(`❌ Erro na edge function: ${error.message}`, 'error');
        toast.error(`Erro nos diagnósticos: ${error.message}`);
        setLastDiagnostics(null);
        return;
      }
      if (data) {
        setLastDiagnostics(data);
        addLog('✅ Diagnósticos avançados concluídos', 'success');
        if (data.businessId) {
          addLog(`🎉 Business ID descoberto: ${data.businessId}`, 'success');
          
          // Aplicar automaticamente o Business ID descoberto
          setConfig(prev => ({
            ...prev,
            businessId: data.businessId
          }));
          
          addLog('✅ Business ID aplicado automaticamente', 'success');
          toast.success(`🎉 Business ID descoberto e aplicado: ${data.businessId}`);
          
          // Salvar automaticamente se temos os campos obrigatórios
          if (config.token && config.phoneNumberId) {
            addLog('💾 Salvando configuração atualizada...', 'info');
            setTimeout(async () => {
              await saveConfig();
            }, 1000);
          }
        } else {
          addLog('⚠️ Não foi possível descobrir o Business ID automaticamente', 'warning');
          toast.warning("⚠️ Não foi possível descobrir o Business ID automaticamente");
        }

        // Log estratégias de descoberta
        if (data.discoveryStrategies && data.discoveryStrategies.length > 0) {
          addLog(`📊 Estratégias testadas: ${data.discoveryStrategies.length}`, 'info');
          data.discoveryStrategies.forEach((strategy: any) => {
            const status = strategy.success ? '✅' : '❌';
            addLog(`  ${status} ${strategy.name} (${strategy.duration})`, strategy.success ? 'success' : 'error');
            if (!strategy.success && strategy.error) {
              addLog(`    └─ Erro: ${strategy.error}`, 'error');
            }
          });
        }
      }
    } catch (error: any) {
      addLog(`❌ Erro inesperado: ${error.message}`, 'error');
      toast.error("Erro inesperado ao executar diagnósticos");
      setLastDiagnostics(null);
    } finally {
      setIsLoadingDiagnostics(false);
    }
  };

  const searchTemplates = async () => {
    if (!config.token) {
      toast.error('Access Token é obrigatório para buscar templates');
      return;
    }
    
    setTemplatesStatus(prev => ({ ...prev, loading: true }));
    addLog('📋 Iniciando busca de templates...', 'info');
    
    try {
      const configForEdgeFunction = {
        access_token: config.token,
        business_account_id: config.businessId,
        phone_number_id: config.phoneNumberId
      };
      
      const filtersToSend = {
        status: templatesStatus.filters.status || undefined,
        name: templatesStatus.filters.search || undefined,
        category: templatesStatus.filters.category || undefined
      };
      
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: {
          action: 'search-templates',
          config: configForEdgeFunction,
          filters: filtersToSend
        }
      });
      
      if (error) {
        addLog(`❌ Erro ao buscar templates: ${error.message}`, 'error');
        throw error;
      }
      
      if (data.success) {
        setTemplatesStatus(prev => ({
          ...prev,
          templates: data.templates,
          stats: data.stats,
          lastChecked: new Date()
        }));
        
        addLog(`✅ ${data.templates.length} templates encontrados`, 'success');
        addLog(`📊 ${data.stats.approved} aprovados, ${data.stats.pending} pendentes, ${data.stats.rejected} rejeitados`, 'info');
        
        if (data.businessId && !config.businessId) {
          addLog(`🎉 Business ID descoberto: ${data.businessId}`, 'success');
          setConfig(prev => ({ ...prev, businessId: data.businessId }));
        }
        
        toast.success(`${data.templates.length} templates encontrados!`);
      } else {
        addLog(`❌ Erro na busca: ${data.error}`, 'error');
        toast.error(`Erro ao buscar templates: ${data.error}`);
      }
      
    } catch (error: any) {
      addLog(`❌ Erro inesperado: ${error.message}`, 'error');
      toast.error(`Erro ao buscar templates: ${error.message}`);
    } finally {
      setTemplatesStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const testSupabaseSecrets = async () => {
    setSupabaseSecretsStatus(prev => ({ ...prev, testing: true }));
    addLog('🔐 Testando secrets do Supabase...', 'info');
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: {
          action: 'check-config'
        }
      });
      
      if (error) {
        addLog(`❌ Erro ao testar secrets: ${error.message}`, 'error');
        throw error;
      }
      
      const isValid = data?.results?.some((r: any) => r.success) || false;
      
      setSupabaseSecretsStatus({
        testing: false,
        lastChecked: new Date(),
        results: data,
        isValid
      });
      
      if (isValid) {
        addLog('✅ Secrets do Supabase válidos e funcionando', 'success');
        toast.success('Secrets do Supabase configurados corretamente!');
      } else {
        addLog('❌ Problemas detectados nos secrets do Supabase', 'error');
        toast.error('Problemas nos secrets do Supabase');
      }
      
    } catch (error: any) {
      setSupabaseSecretsStatus({
        testing: false,
        lastChecked: new Date(),
        results: null,
        isValid: false
      });
      
      const errorMessage = error?.message || 'Erro desconhecido';
      addLog(`❌ Erro ao testar secrets do Supabase: ${errorMessage}`, 'error');
      toast.error(`Erro ao testar secrets: ${errorMessage}`);
    }
  };

  const testManualBusinessId = async (businessId: string) => {
    if (!businessId.trim()) return;
    addLog(`🔍 Testando Business ID manual: ${businessId}`, 'info');
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('whatsapp-config-check', {
        body: {
          action: 'test_business_id',
          config: {
            ...config,
            businessId
          }
        }
      });
      if (error) throw error;
      if (data.success) {
        addLog(`✅ Business ID ${businessId} validado com sucesso`, 'success');
        setConfig(prev => ({
          ...prev,
          businessId
        }));
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
        return <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token">Token de Acesso do WhatsApp Business API</Label>
              <div className="relative">
                <Input id="token" type={showPassword ? "text" : "password"} value={config.token} onChange={e => setConfig(prev => ({
                ...prev,
                token: e.target.value
              }))} placeholder="Seu token de acesso da Meta for Developers" className="pr-10" />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
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
          </div>;
      case 'phone':
        return <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phoneNumberId">Phone Number ID</Label>
              <Input id="phoneNumberId" value={config.phoneNumberId} onChange={e => setConfig(prev => ({
              ...prev,
              phoneNumberId: e.target.value
            }))} placeholder="ex: 123456789012345" />
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
          </div>;
      case 'business':
        return <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessId">Business Account ID (Opcional)</Label>
              <Input id="businessId" value={config.businessId} onChange={e => setConfig(prev => ({
              ...prev,
              businessId: e.target.value
            }))} placeholder="ex: 123456789012345" />
              <p className="text-sm text-muted-foreground">
                Deixe em branco para descoberta automática
              </p>
            </div>
            
            <Button variant="outline" onClick={runAdvancedDiagnostics} disabled={isLoadingDiagnostics || !config.token}>
              {isLoadingDiagnostics ? <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Descobrindo...
                </> : <>
                  <Search className="h-4 w-4 mr-2" />
                  Descobrir Business ID Automaticamente
                </>}
            </Button>

            {/* Mostrar resultados da descoberta */}
            {lastDiagnostics && <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Resultado da Descoberta
                    {lastDiagnostics.businessId && <Badge variant="secondary" className="ml-2">
                        Business ID Descoberto
                      </Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Resumo dos Resultados */}
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{lastDiagnostics.summary?.passed || 0}</div>
                      <div className="text-sm text-gray-600">Passou</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{lastDiagnostics.summary?.failed || 0}</div>
                      <div className="text-sm text-gray-600">Falhou</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{lastDiagnostics.summary?.warnings || 0}</div>
                      <div className="text-sm text-gray-600">Avisos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{lastDiagnostics.summary?.total || 0}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>

                  {/* Business ID Descoberto */}
                  {lastDiagnostics.businessId && <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-semibold text-green-800">Business ID Descoberto!</span>
                      </div>
                      <div className="text-green-700 font-mono text-sm">{lastDiagnostics.businessId}</div>
                      <Button size="sm" className="mt-2" onClick={() => {
                  setConfig(prev => ({
                    ...prev,
                    businessId: lastDiagnostics.businessId
                  }));
                  toast.success("Business ID aplicado!");
                }}>
                        Aplicar Business ID
                      </Button>
                    </div>}

                  {/* Estratégias de Descoberta */}
                  {lastDiagnostics.discoveryStrategies && lastDiagnostics.discoveryStrategies.length > 0 && <div className="space-y-2">
                      <h4 className="font-semibold">Estratégias de Descoberta Testadas:</h4>
                      {lastDiagnostics.discoveryStrategies.map((strategy: any, index: number) => <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{strategy.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{strategy.duration}</span>
                            {strategy.success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                        </div>)}
                    </div>}

                  {/* Resultados Detalhados */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">Ver Diagnósticos Detalhados</summary>
                    <pre className="whitespace-pre-wrap text-xs p-4 rounded mt-2 overflow-auto max-h-96 bg-slate-900">
                      {JSON.stringify(lastDiagnostics, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              </Card>}
          </div>;
      case 'webhook':
        return <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="webhookToken">Webhook Verify Token (Opcional)</Label>
              <Input id="webhookToken" value={config.webhookToken} onChange={e => setConfig(prev => ({
              ...prev,
              webhookToken: e.target.value
            }))} placeholder="Token personalizado para verificação" />
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
          </div>;
      case 'test':
        return <div className="space-y-6">
            <div className="text-center space-y-4">
              <Rocket className="h-16 w-16 mx-auto text-green-400" />
              <h3 className="text-xl font-semibold">Pronto para Testar!</h3>
              <p className="text-muted-foreground">
                Vamos validar sua configuração completa do WhatsApp
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatusCard title="Token de Acesso" success={!!config.token} value={config.token ? 'Configurado' : 'Pendente'} icon={<Key className="h-4 w-4" />} />
              <StatusCard title="Phone Number ID" success={!!config.phoneNumberId} value={config.phoneNumberId ? 'Configurado' : 'Pendente'} icon={<Phone className="h-4 w-4" />} />
              <StatusCard title="Business ID" success={true} value={config.businessId ? 'Configurado' : 'Auto-descoberta'} icon={<Globe className="h-4 w-4" />} />
              <StatusCard title="Status Geral" success={credentialsStatus.isValid === true} warning={credentialsStatus.autoVerifying} value={credentialsStatus.autoVerifying ? 'Testando...' : credentialsStatus.isValid === true ? 'Válido' : credentialsStatus.isValid === false ? 'Erro' : 'Não testado'} icon={credentialsStatus.autoVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />} />
            </div>
            
            {credentialsStatus.isValid === true && <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ Parabéns! Sua configuração do WhatsApp está funcionando perfeitamente.
                </AlertDescription>
              </Alert>}
            
            {credentialsStatus.isValid === false && <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Problemas detectados na configuração. Verifique os logs na aba "Monitoramento" para mais detalhes.
                </AlertDescription>
              </Alert>}
          </div>;
      default:
        return null;
    }
  };
  return <div className="container mx-auto p-6 space-y-6">
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
                {credentialsStatus.isValid === true ? <CheckCircle className="h-5 w-5 text-green-400" /> : credentialsStatus.isValid === false ? <XCircle className="h-5 w-5 text-red-400" /> : <AlertTriangle className="h-5 w-5 text-amber-400" />}
                <span className="font-medium">
                  {credentialsStatus.isValid === true ? 'Operacional' : credentialsStatus.isValid === false ? 'Com Problemas' : 'Não Configurado'}
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
                {credentialsStatus.lastChecked ? credentialsStatus.lastChecked.toLocaleString() : 'Nunca'}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Auto-teste</p>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={autoTestEnabled} onChange={e => setAutoTestEnabled(e.target.checked)} className="rounded" />
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
                  {wizardSteps.map((step, index) => <span key={step.id} className={index === currentStep ? "text-primary font-medium" : ""}>
                      {step.title}
                    </span>)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderWizardStep()}
              
              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                  Anterior
                </Button>
                
                <div className="flex gap-2">
                  <Button onClick={saveConfig} disabled={isLoading} variant="outline">
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
                    Salvar
                  </Button>
                  
                  {currentStep < wizardSteps.length - 1 ? <Button onClick={nextStep}>
                      Próximo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button> : <Button onClick={() => autoVerifyCredentials(config)} disabled={credentialsStatus.autoVerifying || !config.token || !config.phoneNumberId}>
                      {credentialsStatus.autoVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                      Testar Configuração
                    </Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="flex gap-3 mb-4">
            <Button onClick={runAdvancedDiagnostics} disabled={isLoadingDiagnostics || !config.token}>
              {isLoadingDiagnostics ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bug className="h-4 w-4 mr-2" />}
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

          {advancedResults && <div className="space-y-6">
              {/* Token Analysis */}
              {advancedResults.tokenAnalysis && <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Análise do Token
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <StatusCard title="Tipo do Token" success={advancedResults.tokenAnalysis.type === 'page'} value={advancedResults.tokenAnalysis.type} icon={<Shield className="h-4 w-4" />} />
                      
                      {advancedResults.tokenAnalysis.expiresAt && <StatusCard title="Expira em" success={new Date(advancedResults.tokenAnalysis.expiresAt) > new Date()} value={new Date(advancedResults.tokenAnalysis.expiresAt).toLocaleDateString()} icon={<AlertTriangle className="h-4 w-4" />} />}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-400">Permissões Disponíveis:</h4>
                      <div className="flex flex-wrap gap-2">
                        {advancedResults.tokenAnalysis.permissions.map(permission => <Badge key={permission} variant="secondary" className="bg-green-900/20 text-green-400">
                            {permission}
                          </Badge>)}
                      </div>
                    </div>

                    {advancedResults.tokenAnalysis.missingPermissions.length > 0 && <div className="space-y-2">
                        <h4 className="font-semibold text-red-400">Permissões em Falta:</h4>
                        <div className="flex flex-wrap gap-2">
                          {advancedResults.tokenAnalysis.missingPermissions.map(permission => <Badge key={permission} variant="destructive">
                              {permission}
                            </Badge>)}
                        </div>
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Configure as permissões faltantes no Meta for Developers → App Settings → Permissions.
                          </AlertDescription>
                        </Alert>
                      </div>}
                  </CardContent>
                </Card>}

              {/* Business Discovery */}
              {advancedResults.businessDiscovery && <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Descoberta de Business ID
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {advancedResults.businessDiscovery.recommendedBusinessId && <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span>Business ID recomendado: <strong>{advancedResults.businessDiscovery.recommendedBusinessId}</strong></span>
                            <Button size="sm" onClick={() => testManualBusinessId(advancedResults.businessDiscovery.recommendedBusinessId!)}>
                              Usar este ID
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>}

                    <div className="space-y-3">
                      <h4 className="font-semibold">Estratégias de Descoberta:</h4>
                      {advancedResults.businessDiscovery.strategies.map((strategy, index) => <StatusCard key={index} title={strategy.name} success={strategy.success} value={strategy.success ? 'Sucesso' : 'Falhou'} icon={strategy.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} />)}
                    </div>
                  </CardContent>
                </Card>}

              {/* Templates */}
              {advancedResults.templates && <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Templates de Mensagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <StatusCard title="Aprovados" success={advancedResults.templates.approved > 0} value={advancedResults.templates.approved.toString()} />
                      <StatusCard title="Pendentes" success={advancedResults.templates.pending === 0} value={advancedResults.templates.pending.toString()} warning={advancedResults.templates.pending > 0} />
                      <StatusCard title="Rejeitados" success={advancedResults.templates.rejected === 0} value={advancedResults.templates.rejected.toString()} />
                    </div>
                    
                    {advancedResults.templates.available.length > 0 && <JsonViewer data={advancedResults.templates.available} title="Templates Disponíveis" />}
                  </CardContent>
                </Card>}
            </div>}
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
                    <Input id="manual-token" type={showPassword ? "text" : "password"} value={config.token} onChange={e => setConfig(prev => ({
                    ...prev,
                    token: e.target.value
                  }))} placeholder="Token da API do WhatsApp" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-businessId">Business Account ID</Label>
                  <Input id="manual-businessId" value={config.businessId} onChange={e => setConfig(prev => ({
                  ...prev,
                  businessId: e.target.value
                }))} placeholder="ID da conta de negócios" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-phoneNumberId">Phone Number ID</Label>
                  <Input id="manual-phoneNumberId" value={config.phoneNumberId} onChange={e => setConfig(prev => ({
                  ...prev,
                  phoneNumberId: e.target.value
                }))} placeholder="ID do número de telefone" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-webhookToken">Webhook Token</Label>
                  <Input id="manual-webhookToken" value={config.webhookToken} onChange={e => setConfig(prev => ({
                  ...prev,
                  webhookToken: e.target.value
                }))} placeholder="Token do webhook" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={saveConfig} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
                  Salvar Configuração
                </Button>
                
                <Button variant="outline" onClick={() => autoVerifyCredentials(config)} disabled={credentialsStatus.autoVerifying || !config.token}>
                  {credentialsStatus.autoVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                  Testar Conectividade
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status dos Secrets do Supabase */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configuração Atual do Supabase
                </CardTitle>
                <Button 
                  variant="outline" 
                  onClick={testSupabaseSecrets}
                  disabled={supabaseSecretsStatus.testing}
                  size="sm"
                >
                  {supabaseSecretsStatus.testing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Testar Secrets
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Validação dos secrets configurados no Supabase (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_BUSINESS_ID)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard 
                  title="Status dos Secrets"
                  success={supabaseSecretsStatus.isValid === true}
                  value={
                    supabaseSecretsStatus.testing ? 'Testando...' :
                    supabaseSecretsStatus.isValid === true ? 'Válidos' :
                    supabaseSecretsStatus.isValid === false ? 'Com Problemas' :
                    'Não Testado'
                  }
                  icon={supabaseSecretsStatus.testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                />
                
                <StatusCard 
                  title="Última Verificação"
                  success={supabaseSecretsStatus.lastChecked !== null}
                  value={
                    supabaseSecretsStatus.lastChecked 
                      ? supabaseSecretsStatus.lastChecked.toLocaleTimeString()
                      : 'Nunca'
                  }
                  icon={<AlertTriangle className="h-4 w-4" />}
                />
                
                <StatusCard 
                  title="Comparação"
                  success={
                    supabaseSecretsStatus.isValid === true && 
                    credentialsStatus.isValid === true
                  }
                  value={
                    supabaseSecretsStatus.isValid === true && credentialsStatus.isValid === true ? 'Sincronizado' :
                    supabaseSecretsStatus.isValid === null || credentialsStatus.isValid === null ? 'Pendente' :
                    'Divergente'
                  }
                  icon={<Zap className="h-4 w-4" />}
                />
              </div>

              {supabaseSecretsStatus.results && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Resultados da Validação dos Secrets:</h4>
                  <div className="grid gap-2">
                    {supabaseSecretsStatus.results.results?.map((result: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">{result.test}</span>
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={result.success ? "default" : "destructive"}>
                            {result.success ? 'OK' : 'Erro'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {supabaseSecretsStatus.results.summary && (
                    <div className="grid grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {supabaseSecretsStatus.results.summary.passed || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Passou</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {supabaseSecretsStatus.results.summary.failed || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Falhou</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {supabaseSecretsStatus.results.summary.warnings || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Avisos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {supabaseSecretsStatus.results.summary.total || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Total</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {supabaseSecretsStatus.isValid === false && supabaseSecretsStatus.results && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>Problemas detectados nos secrets do Supabase:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Verifique se os secrets WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_BUSINESS_ID estão configurados</li>
                        <li>Acesse as configurações de Edge Functions no Supabase para verificar</li>
                        <li>Compare com a configuração do formulário acima para sincronizar</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {supabaseSecretsStatus.isValid === true && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Secrets do Supabase configurados e funcionando corretamente!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Configurações de Auto-Teste */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Verificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Auto-Teste Habilitado</Label>
                  <p className="text-sm text-muted-foreground">
                    Executa verificação automática a cada 30 segundos quando as credenciais mudam
                  </p>
                  {!autoTestEnabled && (
                    <p className="text-xs text-orange-600">
                      ⚠️ Desabilitado para evitar rate limiting da API do Facebook
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={autoTestEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setAutoTestEnabled(!autoTestEnabled);
                      addLog(`${!autoTestEnabled ? '✅' : '⏸️'} Auto-teste ${!autoTestEnabled ? 'habilitado' : 'desabilitado'}`, 'info');
                    }}
                  >
                    {autoTestEnabled ? (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Ativar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Testar Business ID Específico</Label>
                <div className="flex gap-2">
                  <Input placeholder="Digite o Business ID para testar" onKeyPress={e => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    testManualBusinessId(target.value);
                  }
                }} />
                  <Button onClick={e => {
                  const input = e.currentTarget.parentElement?.querySelector('input');
                  if (input?.value) testManualBusinessId(input.value);
                }}>
                    <Search className="h-4 w-4 mr-2" />
                    Testar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados dos Testes */}
          {testResults.length > 0 && <Card>
              <CardHeader>
                <CardTitle>Resultados dos Testes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {testResults.map((result, index) => <div key={index} className="space-y-2">
                      <StatusCard title={result.test} success={result.success} value={result.success ? 'OK' : 'Erro'} />
                      {!result.success && result.suggestion && <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Sugestão:</strong> {result.suggestion}
                          </AlertDescription>
                        </Alert>}
                    </div>)}
                </div>
              </CardContent>
            </Card>}
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <LogsViewer logs={logs} onClear={clearLogs} />
          
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
    </div>;
};
export default WhatsAppDebug;