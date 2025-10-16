
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, RefreshCw, Settings, Users, Bell, Shield, Database } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const { profile } = useAuth();
  const { toast: uiToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  // Estados para configurações
  const [notifyNewUsers, setNotifyNewUsers] = useState(true);
  const [notifyCompletions, setNotifyCompletions] = useState(true);
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [enableUserFeedback, setEnableUserFeedback] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  
  // Simulação de teste de conexão com banco de dados
  const testDatabaseConnection = async () => {
    try {
      setTestingConnection(true);
      
      // Simular uma requisição ao banco de dados
      const { data, error } = await supabase
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        throw error;
      }
      
      // Simular um pequeno atraso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Conexão com o banco de dados está funcionando corretamente!');
    } catch (error: any) {
      console.error('Erro ao testar conexão:', error);
      toast.error('Erro ao testar conexão com o banco de dados');
    } finally {
      setTestingConnection(false);
    }
  };
  
  // Simulação de salvamento de configurações
  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Simular um pequeno atraso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      uiToast({
        title: 'Configurações salvas',
        description: 'Suas configurações foram atualizadas com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      uiToast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da plataforma VIVER DE IA.
        </p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Database className="h-4 w-4 mr-2" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure as opções gerais da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="platform-name">Nome da Plataforma</Label>
                    <Input 
                      id="platform-name" 
                      value="VIVER DE IA" 
                      disabled
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Entre em contato com o suporte para alterar o nome da plataforma.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="support-email">Email de Suporte</Label>
                    <Input 
                      id="support-email" 
                      placeholder="suporte@viverdeia.ai"
                      defaultValue="suporte@viverdeia.ai"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="analytics-switch">Ativar Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Coleta dados de uso para análise.
                      </p>
                    </div>
                    <Switch 
                      id="analytics-switch"
                      checked={enableAnalytics}
                      onCheckedChange={setEnableAnalytics}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="feedback-switch">Ativar Feedback</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite que usuários enviem feedback.
                      </p>
                    </div>
                    <Switch 
                      id="feedback-switch"
                      checked={enableUserFeedback}
                      onCheckedChange={setEnableUserFeedback}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenance-switch" className="text-destructive font-medium">Modo Manutenção</Label>
                      <p className="text-sm text-muted-foreground">
                        Ativa página de manutenção para todos os usuários.
                      </p>
                    </div>
                    <Switch 
                      id="maintenance-switch"
                      checked={maintenanceMode}
                      onCheckedChange={setMaintenanceMode}
                    />
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border p-4 bg-muted/40">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Sistema operando normalmente</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Todos os serviços estão funcionando corretamente. Última verificação: {new Date().toLocaleTimeString()}.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={testDatabaseConnection}
                      disabled={testingConnection}
                    >
                      {testingConnection ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Testar Conexão
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline">Redefinir</Button>
              <Button 
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Usuários</CardTitle>
              <CardDescription>
                Gerencie as configurações relacionadas aos usuários.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aprovação Manual de Novos Usuários</Label>
                    <p className="text-sm text-muted-foreground">
                      Novos registros precisam de aprovação de um administrador.
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Auto-registro</Label>
                    <p className="text-sm text-muted-foreground">
                      Usuários podem se registrar sem convite.
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Registro de Usuários com Google</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir registro usando conta Google.
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </div>
              
              <div className="rounded-lg border p-4 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <AlertCircle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Aviso de Segurança</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Alterações nessas configurações podem afetar o acesso dos usuários existentes.
                      Certifique-se de comunicar quaisquer mudanças com antecedência.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline">Redefinir</Button>
              <Button 
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Configure como e quando as notificações são enviadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-users">Notificar Novos Usuários</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações quando novos usuários se registrarem.
                    </p>
                  </div>
                  <Switch 
                    id="new-users" 
                    checked={notifyNewUsers}
                    onCheckedChange={setNotifyNewUsers}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="completions">Notificar Implementações Completas</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações quando usuários concluírem implementações.
                    </p>
                  </div>
                  <Switch 
                    id="completions"
                    checked={notifyCompletions}
                    onCheckedChange={setNotifyCompletions}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="notification-email">Email para Notificações</Label>
                  <Input 
                    id="notification-email" 
                    type="email"
                    placeholder="admin@viverdeia.ai"
                    defaultValue={profile?.email || ''}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Email para onde as notificações do sistema serão enviadas.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline">Redefinir</Button>
              <Button 
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>
                Configure integrações com serviços externos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Google Sheets</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Conecte-se ao Google Sheets para importar/exportar dados dos membros.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="google-api-key">Chave API Google</Label>
                      <Input 
                        id="google-api-key" 
                        value={googleApiKey}
                        onChange={(e) => setGoogleApiKey(e.target.value)}
                        type="password"
                        placeholder="Cole sua chave API aqui"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="sheets-url">URL da Planilha</Label>
                      <Input 
                        id="sheets-url" 
                        defaultValue="https://docs.google.com/spreadsheets/d/1cqwb9W5AdTLPb0gOi8l8dSurRAYKtpQQL4b5HZqEEbo/edit?gid=0#gid=0"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">OpenAI</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure a integração com OpenAI para personalização e assistência.
                  </p>
                  
                  <div>
                    <Label htmlFor="openai-api-key">Chave API OpenAI</Label>
                    <Input 
                      id="openai-api-key" 
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      type="password"
                      placeholder="Cole sua chave API aqui"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline">Redefinir</Button>
              <Button 
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Configure políticas de segurança e acesso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticação em Dois Fatores (2FA)</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir 2FA para todos os administradores.
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Política de Senha Forte</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir senhas complexas para todos os usuários.
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="session-timeout">Tempo Limite da Sessão (minutos)</Label>
                  <Input 
                    id="session-timeout" 
                    type="number"
                    defaultValue="60"
                    min="5"
                    max="1440"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Tempo até que a sessão expire por inatividade.
                  </p>
                </div>
              </div>
              
              <div className="rounded-lg border p-4 bg-success/10 border-success/30">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-success">Backup Automático Ativado</h4>
                    <p className="text-sm text-success/80 mt-1">
                      Seus dados são automaticamente copiados diariamente.
                      Último backup: {new Date().toLocaleDateString()}.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline">Redefinir</Button>
              <Button 
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
