
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Settings,
  Phone,
  Building
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WhatsAppConfig {
  configured: boolean;
  hasApiToken: boolean;
  hasPhoneNumberId: boolean;
  hasBusinessId: boolean;
  phoneNumberId?: string;
  businessId?: string;
  webhookConfigured: boolean;
  testConnectionStatus: 'success' | 'failed' | 'not_tested';
  lastTestAt?: string;
  errors: string[];
}

const WhatsAppConfigPanel = () => {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const checkConfig = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check');
      
      if (error) {
        throw error;
      }
      
      if (data?.success) {
        setConfig(data.status);
      } else {
        throw new Error(data?.error || "Erro ao verificar configuração");
      }
    } catch (error: any) {
      console.error("Erro ao verificar config:", error);
      toast.error("Erro ao verificar configuração do WhatsApp");
      setConfig({
        configured: false,
        hasApiToken: false,
        hasPhoneNumberId: false,
        hasBusinessId: false,
        webhookConfigured: false,
        testConnectionStatus: 'failed',
        errors: [error.message || "Erro desconhecido"]
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: {}
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.success) {
        setConfig(data.status);
        if (data.status.testConnectionStatus === 'success') {
          toast.success("Conexão com WhatsApp testada com sucesso!");
        } else {
          toast.error("Falha no teste de conexão");
        }
      } else {
        throw new Error(data?.error || "Erro no teste");
      }
    } catch (error: any) {
      console.error("Erro no teste:", error);
      toast.error("Erro ao testar conexão");
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    checkConfig();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Configuração WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Configuração WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Não foi possível carregar a configuração do WhatsApp.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Configuração WhatsApp Business API
        </CardTitle>
        <CardDescription>
          Status da configuração e conectividade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status geral */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status Geral</span>
            {config.configured ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configurado
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Não Configurado
              </Badge>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={checkConfig}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar
          </Button>
        </div>

        {/* Checklist de configuração */}
        <div className="space-y-3">
          <h4 className="font-medium">Variáveis de Ambiente</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">WHATSAPP_API_TOKEN</span>
              {config.hasApiToken ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">WHATSAPP_PHONE_NUMBER_ID</span>
              {config.hasPhoneNumberId ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">WHATSAPP_BUSINESS_ID</span>
              {config.hasBusinessId ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">WHATSAPP_WEBHOOK_TOKEN</span>
              {config.webhookConfigured ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Informações da conta */}
        {(config.phoneNumberId || config.businessId) && (
          <div className="space-y-3">
            <h4 className="font-medium">Informações da Conta</h4>
            
            {config.phoneNumberId && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Phone Number ID:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {config.phoneNumberId}
                </code>
              </div>
            )}
            
            {config.businessId && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Business ID:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {config.businessId}
                </code>
              </div>
            )}
          </div>
        )}

        {/* Teste de conexão */}
        {config.configured && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Teste de Conexão</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={testConnection}
                disabled={testing}
              >
                {testing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                Testar Conexão
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm">Status:</span>
              {config.testConnectionStatus === 'success' && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Sucesso
                </Badge>
              )}
              {config.testConnectionStatus === 'failed' && (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Falhou
                </Badge>
              )}
              {config.testConnectionStatus === 'not_tested' && (
                <Badge variant="outline">
                  Não testado
                </Badge>
              )}
            </div>
            
            {config.lastTestAt && (
              <div className="text-xs text-muted-foreground">
                Último teste: {new Date(config.lastTestAt).toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        )}

        {/* Erros */}
        {config.errors.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Problemas encontrados:</p>
                <ul className="list-disc list-inside space-y-1">
                  {config.errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Instruções de configuração */}
        {!config.configured && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Para configurar o WhatsApp Business API:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Acesse o Facebook Developers e crie um app Business</li>
                  <li>Configure o WhatsApp Business API</li>
                  <li>Obtenha o Access Token permanente</li>
                  <li>Configure as variáveis de ambiente no Supabase</li>
                  <li>Configure os webhooks para receber status de entrega</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppConfigPanel;
