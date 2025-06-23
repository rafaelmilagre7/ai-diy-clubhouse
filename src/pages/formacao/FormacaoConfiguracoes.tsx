import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Users, 
  Mail, 
  Shield, 
  FileText, 
  Palette,
  Save,
  Loader2
} from "lucide-react";

interface LMSSettings {
  site_name: string;
  site_description: string;
  allow_registrations: boolean;
  require_email_verification: boolean;
  default_user_role: string;
  certificate_template: string;
  email_notifications: boolean;
  course_completion_email: boolean;
  certificate_email: boolean;
  max_file_size_mb: number;
  allowed_file_types: string[];
  theme_primary_color: string;
  theme_secondary_color: string;
  custom_css: string;
  maintenance_mode: boolean;
  maintenance_message: string;
}

const FormacaoConfiguracoes = () => {
  const { user, profile } = useAuth();
  const isFormacao = getUserRoleName(profile) === 'formacao';

  const [settings, setSettings] = useState<LMSSettings>({
    site_name: "LMS Viver de IA",
    site_description: "Sistema de Aprendizagem Online",
    allow_registrations: true,
    require_email_verification: true,
    default_user_role: "member",
    certificate_template: "default",
    email_notifications: true,
    course_completion_email: true,
    certificate_email: true,
    max_file_size_mb: 10,
    allowed_file_types: ["pdf", "doc", "docx", "ppt", "pptx", "mp4", "mp3"],
    theme_primary_color: "#3b82f6",
    theme_secondary_color: "#64748b",
    custom_css: "",
    maintenance_mode: false,
    maintenance_message: "Sistema em manutenção. Voltamos em breve."
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");

  // Carregar configurações
  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lms_settings')
        .select('*')
        .single();
      
      if (data && !error) {
        setSettings(data);
      }
    } catch (error) {
      console.log("Usando configurações padrão");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Salvar configurações
  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('lms_settings')
        .upsert(settings, { onConflict: 'id' });
      
      if (error) throw error;
      
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  // Update setting helper
  const updateSetting = (key: keyof LMSSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Acesso Restrito</h2>
        <p className="text-muted-foreground">Apenas administradores podem acessar as configurações do LMS.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurações do LMS</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema de aprendizagem</p>
        </div>
        
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configure as informações básicas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Nome do Site</Label>
                  <Input 
                    id="site-name"
                    value={settings.site_name}
                    onChange={(e) => updateSetting('site_name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certificate-template">Template de Certificado</Label>
                  <Input 
                    id="certificate-template"
                    value={settings.certificate_template}
                    onChange={(e) => updateSetting('certificate_template', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site-description">Descrição do Site</Label>
                <Textarea 
                  id="site-description"
                  value={settings.site_description}
                  onChange={(e) => updateSetting('site_description', e.target.value)}
                  rows={3}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Quando ativado, apenas administradores podem acessar o sistema
                    </p>
                  </div>
                  <Switch 
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                  />
                </div>
                
                {settings.maintenance_mode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-message">Mensagem de Manutenção</Label>
                    <Textarea 
                      id="maintenance-message"
                      value={settings.maintenance_message}
                      onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Usuários */}
        <TabsContent value="usuarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Configurações de Usuários
              </CardTitle>
              <CardDescription>
                Gerencie como os usuários se registram e interagem com o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Registros</Label>
                    <p className="text-sm text-muted-foreground">
                      Usuários podem se registrar automaticamente
                    </p>
                  </div>
                  <Switch 
                    checked={settings.allow_registrations}
                    onCheckedChange={(checked) => updateSetting('allow_registrations', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Exigir Verificação de E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Usuários devem verificar o e-mail antes de acessar
                    </p>
                  </div>
                  <Switch 
                    checked={settings.require_email_verification}
                    onCheckedChange={(checked) => updateSetting('require_email_verification', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-role">Papel Padrão para Novos Usuários</Label>
                <Input 
                  id="default-role"
                  value={settings.default_user_role}
                  onChange={(e) => updateSetting('default_user_role', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de E-mail */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configurações de E-mail
              </CardTitle>
              <CardDescription>
                Configure as notificações por e-mail do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações gerais por e-mail
                    </p>
                  </div>
                  <Switch 
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-mail de Conclusão de Curso</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar e-mail quando curso for concluído
                    </p>
                  </div>
                  <Switch 
                    checked={settings.course_completion_email}
                    onCheckedChange={(checked) => updateSetting('course_completion_email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-mail de Certificado</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar certificado por e-mail quando emitido
                    </p>
                  </div>
                  <Switch 
                    checked={settings.certificate_email}
                    onCheckedChange={(checked) => updateSetting('certificate_email', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Arquivos */}
        <TabsContent value="arquivos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configurações de Arquivos
              </CardTitle>
              <CardDescription>
                Configure limites e tipos de arquivos permitidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Tamanho Máximo de Arquivo (MB)</Label>
                <Input 
                  id="max-file-size"
                  type="number"
                  value={settings.max_file_size_mb}
                  onChange={(e) => updateSetting('max_file_size_mb', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipos de Arquivo Permitidos</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.allowed_file_types.map((type) => (
                    <Badge key={type} variant="secondary">{type}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Para alterar os tipos permitidos, edite a lista no código
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Aparência */}
        <TabsContent value="aparencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Configurações de Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <Input 
                    id="primary-color"
                    type="color"
                    value={settings.theme_primary_color}
                    onChange={(e) => updateSetting('theme_primary_color', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <Input 
                    id="secondary-color"
                    type="color"
                    value={settings.theme_secondary_color}
                    onChange={(e) => updateSetting('theme_secondary_color', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-css">CSS Personalizado</Label>
                <Textarea 
                  id="custom-css"
                  value={settings.custom_css}
                  onChange={(e) => updateSetting('custom_css', e.target.value)}
                  rows={6}
                  placeholder="/* Adicione seu CSS personalizado aqui */"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormacaoConfiguracoes;
