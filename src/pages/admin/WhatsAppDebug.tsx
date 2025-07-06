import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Info,
  Search,
  Filter,
  Smartphone,
  Globe,
  BookOpen,
  Shield,
  Key,
  Database
} from "lucide-react";

interface WhatsAppTemplate {
  id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  quality_score?: {
    score: number;
    status: string;
  };
  components?: any[];
  business_id?: string;
}

interface BusinessAccount {
  id: string;
  name: string;
  verification_status: string;
  templates_count?: number;
}

interface StatusCardProps {
  title: string;
  success: boolean;
  value: string;
  icon?: React.ReactNode;
  details?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, success, value, icon, details }) => (
  <div className="flex items-center justify-between p-3 bg-card border rounded-lg">
    <div className="flex items-center gap-2">
      {icon || (success ? <CheckCircle className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />)}
      <span className="text-sm font-medium text-foreground">{title}</span>
    </div>
    <div className="text-right">
      <Badge variant={success ? "default" : "destructive"}>{value}</Badge>
      {details && <p className="text-xs text-muted-foreground mt-1">{details}</p>}
    </div>
  </div>
);

const TemplateCard: React.FC<{ template: WhatsAppTemplate }> = ({ template }) => (
  <Card className="p-4 bg-card border">
    <div className="flex items-center justify-between mb-2">
      <h5 className="font-medium text-foreground">{template.name}</h5>
      <Badge variant={template.status === 'APPROVED' ? 'default' : template.status === 'PENDING' ? 'secondary' : 'destructive'}>
        {template.status}
      </Badge>
    </div>
    <div className="space-y-1 text-sm text-muted-foreground">
      <p>Categoria: {template.category}</p>
      <p>Idioma: {template.language}</p>
      {template.quality_score && (
        <p>Qualidade: {template.quality_score.score}/5 ({template.quality_score.status})</p>
      )}
      {template.business_id && (
        <p className="font-mono text-xs">Business ID: {template.business_id}</p>
      )}
    </div>
  </Card>
);

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

const WhatsAppDebug: React.FC = () => {
  const { toast } = useToast();
  
  // Estados principais
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastDiagnostics, setLastDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  
  // Estados do wizard
  const [currentStep, setCurrentStep] = useState(0);
  const [manualBusinessId, setManualBusinessId] = useState('385471239079413');
  const [accessToken, setAccessToken] = useState('');
  
  // Estados de análise avançada
  const [advancedResults, setAdvancedResults] = useState<any>(null);
  const [supabaseSecretsStatus, setSupabaseSecretsStatus] = useState<any>({});
  
  // Estados de templates
  const [templatesStatus, setTemplatesStatus] = useState<{
    loading: boolean;
    templates: WhatsAppTemplate[];
    error: string | null;
    lastChecked: Date | null;
    filters: {
      search: string;
      status: string;
      category: string;
    };
    discoveredBusinessIds: BusinessAccount[];
  }>({
    loading: false,
    templates: [],
    error: null,
    lastChecked: null,
    filters: {
      search: '',
      status: '',
      category: ''
    },
    discoveredBusinessIds: []
  });

  const runBasicTests = async () => {
    if (!accessToken) {
      toast({
        title: "Erro",
        description: "Token de acesso é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          config: {
            access_token: accessToken,
            manual_business_id: manualBusinessId || undefined
          }
        }
      });

      if (error) throw error;

      setLastDiagnostics(data);
      setIsConnected(data.overall_status?.success || false);
      
      // Processar resultados para exibição
      const results = [];
      if (data.token_validation) {
        results.push({
          test: 'Validação do Token',
          success: data.token_validation.valid,
          details: data.token_validation.error || 'Token válido'
        });
      }
      if (data.business_discovery) {
        results.push({
          test: 'Descoberta de Business',
          success: data.business_discovery.accounts?.length > 0,
          details: `${data.business_discovery.accounts?.length || 0} accounts encontrados`
        });
      }
      
      setTestResults(results);
      
      toast({
        title: "Teste concluído",
        description: data.overall_status?.success ? "Conectividade OK" : "Problemas encontrados",
        variant: data.overall_status?.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Erro no teste:', error);
      toast({
        title: "Erro no teste",
        description: "Erro ao executar diagnósticos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchTemplates = async () => {
    if (!accessToken) {
      toast({
        title: "Erro",
        description: "Token de acesso é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setTemplatesStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'search-templates',
          config: {
            access_token: accessToken,
            manual_business_id: manualBusinessId || undefined
          },
          filters: templatesStatus.filters
        }
      });

      if (error) throw error;

      setTemplatesStatus(prev => ({
        ...prev,
        loading: false,
        templates: data.templates || [],
        discoveredBusinessIds: data.businessIds || [],
        lastChecked: new Date()
      }));

      toast({
        title: "Busca concluída",
        description: `${data.templates?.length || 0} templates encontrados`,
      });
    } catch (error) {
      console.error('Erro na busca de templates:', error);
      const errorMessage = error?.message || 'Erro desconhecido ao buscar templates'
      
      setTemplatesStatus(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      toast({
        title: "Erro na busca",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'config',
      title: 'Configuração',
      description: 'Configure o token de acesso',
      component: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="accessToken">Token de Acesso WhatsApp</Label>
            <Input
              id="accessToken"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Insira seu token de acesso..."
            />
          </div>
          <div>
            <Label htmlFor="businessId">Business ID (Opcional)</Label>
            <Input
              id="businessId"
              value={manualBusinessId}
              onChange={(e) => setManualBusinessId(e.target.value)}
              placeholder="ID do Business Account..."
            />
          </div>
        </div>
      )
    },
    {
      id: 'test',
      title: 'Teste',
      description: 'Execute testes de conectividade',
      component: (
        <div className="space-y-4">
          <Button onClick={runBasicTests} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
            Executar Testes Básicos
          </Button>
          
          {testResults.length > 0 && (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <StatusCard
                  key={index}
                  title={result.test}
                  success={result.success}
                  value={result.success ? 'OK' : 'Erro'}
                />
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'templates',
      title: 'Templates',
      description: 'Buscar e listar templates',
      component: (
        <div className="space-y-4">
          <Button onClick={searchTemplates} disabled={templatesStatus.loading} className="w-full">
            {templatesStatus.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Buscar Templates
          </Button>
          
          {templatesStatus.templates.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{templatesStatus.templates.length} templates encontrados</h4>
              </div>
              
              <div className="grid gap-4">
                {templatesStatus.templates.map((template, index) => (
                  <TemplateCard key={template.id || index} template={template} />
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  const wizardProgress = ((currentStep + 1) / wizardSteps.length) * 100;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Debug WhatsApp Business API</h1>
          <p className="text-muted-foreground">
            Ferramenta para diagnosticar e testar configurações do WhatsApp Business
          </p>
        </div>

        <Tabs defaultValue="wizard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wizard">Assistente</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="wizard" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Assistente de Configuração</CardTitle>
                    <CardDescription>
                      Configure e teste sua integração WhatsApp passo a passo
                    </CardDescription>
                  </div>
                  {isConnected !== null && (
                    <Badge variant={isConnected ? "default" : "destructive"}>
                      {isConnected ? "Conectado" : "Desconectado"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{wizardSteps[currentStep].title}</h3>
                    <p className="text-sm text-muted-foreground">{wizardSteps[currentStep].description}</p>
                  </div>
                  
                  {wizardSteps[currentStep].component}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(Math.min(wizardSteps.length - 1, currentStep + 1))}
                    disabled={currentStep === wizardSteps.length - 1}
                  >
                    Próximo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates WhatsApp</CardTitle>
                <CardDescription>
                  Gerencie e visualize templates do WhatsApp Business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar templates..."
                      value={templatesStatus.filters.search}
                      onChange={(e) => setTemplatesStatus(prev => ({
                        ...prev,
                        filters: { ...prev.filters, search: e.target.value }
                      }))}
                    />
                  </div>
                  <Select
                    value={templatesStatus.filters.status}
                    onValueChange={(value) => setTemplatesStatus(prev => ({
                      ...prev,
                      filters: { ...prev.filters, status: value }
                    }))}
                  >
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="APPROVED">Aprovado</SelectItem>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="REJECTED">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={searchTemplates} disabled={templatesStatus.loading}>
                    {templatesStatus.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                    Buscar
                  </Button>
                </div>

                {templatesStatus.error && (
                  <Alert className="bg-destructive/10 border-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-destructive">
                      {templatesStatus.error}
                    </AlertDescription>
                  </Alert>
                )}

                {templatesStatus.loading && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Buscando templates...</p>
                  </div>
                )}

                {templatesStatus.discoveredBusinessIds.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">Business IDs Testados</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {templatesStatus.discoveredBusinessIds.map((biz: any, idx: number) => (
                        <div key={idx} className="p-3 bg-card border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-mono text-sm text-foreground">{biz.id}</div>
                              {biz.name && <div className="text-xs text-muted-foreground">{biz.name}</div>}
                            </div>
                            <Badge variant={(biz.templates_count || biz.templatesCount) > 0 ? "default" : "secondary"}>
                              {biz.templates_count || biz.templatesCount || 0} templates
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {templatesStatus.templates.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        {templatesStatus.templates.filter(template => {
                          const searchMatch = !templatesStatus.filters.search || 
                            template.name.toLowerCase().includes(templatesStatus.filters.search.toLowerCase());
                          const statusMatch = !templatesStatus.filters.status || 
                            template.status === templatesStatus.filters.status;
                          const categoryMatch = !templatesStatus.filters.category || 
                            template.category === templatesStatus.filters.category;
                          return searchMatch && statusMatch && categoryMatch;
                        }).length} templates encontrados
                      </h4>
                      {templatesStatus.lastChecked && (
                        <p className="text-sm text-muted-foreground">
                          Última busca: {templatesStatus.lastChecked.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid gap-4">
                      {templatesStatus.templates
                        .filter(template => {
                          const searchMatch = !templatesStatus.filters.search || 
                            template.name.toLowerCase().includes(templatesStatus.filters.search.toLowerCase());
                          const statusMatch = !templatesStatus.filters.status || 
                            template.status === templatesStatus.filters.status;
                          const categoryMatch = !templatesStatus.filters.category || 
                            template.category === templatesStatus.filters.category;
                          return searchMatch && statusMatch && categoryMatch;
                        })
                        .map((template, index) => (
                          <TemplateCard key={template.id || index} template={template} />
                        ))
                      }
                    </div>
                  </div>
                )}

                {!templatesStatus.loading && templatesStatus.templates.length === 0 && templatesStatus.lastChecked && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum template encontrado</p>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Buscar Templates" para carregar os templates da sua conta
                    </p>
                  </div>
                )}

                {!templatesStatus.loading && templatesStatus.templates.length === 0 && !templatesStatus.lastChecked && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Busque templates da sua conta WhatsApp Business</p>
                    <p className="text-sm text-muted-foreground">
                      Configure seu token de acesso e clique em "Buscar Templates"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WhatsAppDebug;