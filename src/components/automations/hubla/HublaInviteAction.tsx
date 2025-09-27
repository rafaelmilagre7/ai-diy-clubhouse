import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UserPlus, Mail, MessageCircle, Settings, Eye } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface HublaInviteActionProps {
  action: any;
  onUpdate: (updates: any) => void;
  onRemove?: () => void;
  compact?: boolean;
}

const INVITE_TEMPLATES = [
  {
    id: 'lovable_course_welcome',
    name: 'Lovable - Boas-vindas',
    description: 'Template para curso Lovable na Prática',
    subject: 'Bem-vindo ao Lovable na Prática! 🚀',
    preview: 'Parabéns pela compra! Seu acesso ao curso já está liberado...',
    channels: ['email', 'whatsapp']
  },
  {
    id: 'platform_access',
    name: 'Acesso à Plataforma',
    description: 'Template para acesso geral à plataforma',
    subject: 'Seu acesso à plataforma foi liberado!',
    preview: 'Olá! Você agora tem acesso completo à nossa plataforma...',
    channels: ['email']
  },
  {
    id: 'vip_member',
    name: 'Membro VIP',
    description: 'Template para membros VIP',
    subject: 'Bem-vindo ao clube VIP! ⭐',
    preview: 'Parabéns! Você agora faz parte do nosso clube VIP...',
    channels: ['email', 'whatsapp']
  },
  {
    id: 'combo_viver_de_ia',
    name: 'Combo Viver de IA',
    description: 'Template para o Combo Viver de IA',
    subject: 'Parabéns! Seu Combo Viver de IA foi ativado! 🤖',
    preview: 'Agora você tem acesso completo ao Learning, Community e Certificates...',
    channels: ['email', 'whatsapp']
  }
];

const USER_ROLES = [
  { id: 'membro_club', name: 'Membro Club', description: 'Acesso padrão à plataforma' },
  { id: 'lovable_course', name: 'Curso Lovable', description: 'Acesso específico ao curso Lovable' },
  { id: 'vip_member', name: 'Membro VIP', description: 'Acesso VIP com benefícios extras' },
  { id: 'formacao_ia', name: 'Formação IA', description: 'Acesso à formação completa de IA' },
  { id: 'combo_viver_de_ia', name: 'Combo Viver de IA', description: 'Acesso ao Learning, Community e Certificates' }
];

export const HublaInviteAction = ({ action, onUpdate, onRemove, compact = false }: HublaInviteActionProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const parameters = action.parameters || {};
  const selectedTemplate = INVITE_TEMPLATES.find(t => t.id === parameters.template);
  const selectedRole = USER_ROLES.find(r => r.id === parameters.role_id);

  const updateParameter = (key: string, value: any) => {
    onUpdate({
      parameters: {
        ...parameters,
        [key]: value
      }
    });
  };

  const getEmailMapping = () => {
    return parameters.email_source || 'payload.event.userEmail';
  };

  const getNameMapping = () => {
    return parameters.name_source || 'payload.event.userName';
  };

  const getPhoneMapping = () => {
    return parameters.phone_source || 'payload.event.userPhone';
  };

  return (
    <Card className={`border-l-4 border-l-hubla-primary ${compact ? 'shadow-sm' : ''}`}>
      <CardHeader className={compact ? "pb-3" : ""}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-hubla-primary/10 rounded-lg ${compact ? 'p-1.5' : ''}`}>
              <UserPlus className={`text-hubla-primary ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </div>
            <div>
              <CardTitle className={`text-hubla-primary ${compact ? 'text-base' : ''}`}>
                Enviar Convite Hubla
              </CardTitle>
              {!compact && (
                <CardDescription>
                  Configurar automação para criar e enviar convites personalizados com base nos dados da Hubla. O sistema mapeará automaticamente email, nome e telefone do comprador.
                </CardDescription>
              )}
              {!compact && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-800">
                    <strong>🎯 Fluxo Automático:</strong> Quando as condições forem atendidas → Criar convite → Enviar por email/WhatsApp → Usuário recebe acesso automaticamente
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-hubla-primary border-hubla-primary">
              Ativo
            </Badge>
            {onRemove && (
              <Button
                type="button"
                variant="ghost" 
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={`space-y-6 ${compact ? 'space-y-4' : ''}`}>
        {/* Template Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Template do Convite
          </Label>
          <div className="text-xs text-muted-foreground mb-2">
            Escolha o template que será usado para criar o convite. Cada template é otimizado para diferentes produtos e canais.
          </div>
          <Select
            value={parameters.template || ''}
            onValueChange={(value) => updateParameter('template', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um template..." />
            </SelectTrigger>
            <SelectContent>
              {INVITE_TEMPLATES.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {template.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedTemplate && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedTemplate.subject}
                  </Badge>
                  <div className="flex gap-1">
                    {selectedTemplate.channels.includes('email') && (
                      <Badge variant="secondary" className="text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Badge>
                    )}
                    {selectedTemplate.channels.includes('whatsapp') && (
                      <Badge variant="secondary" className="text-xs">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        WhatsApp
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              </div>
              {showPreview && (
                <div className="text-xs text-muted-foreground p-2 bg-background rounded">
                  {selectedTemplate.preview}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Role do Usuário</Label>
          <div className="text-xs text-muted-foreground mb-2">
            Selecione qual nível de acesso o usuário terá na plataforma após aceitar o convite.
          </div>
          <Select
            value={parameters.role_id || ''}
            onValueChange={(value) => updateParameter('role_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o role..." />
            </SelectTrigger>
            <SelectContent>
              {USER_ROLES.map(role => (
                <SelectItem key={role.id} value={role.id}>
                  <div>
                    <div className="font-medium">{role.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {role.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data Mapping */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Mapeamento de Dados</Label>
            <Badge variant="secondary" className="text-xs">
              Automático da Hubla
            </Badge>
          </div>
          
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-muted-foreground">Email:</span>
              <code className="text-xs bg-background px-2 py-1 rounded">
                {getEmailMapping()}
              </code>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-muted-foreground">Nome:</span>
              <code className="text-xs bg-background px-2 py-1 rounded">
                {getNameMapping()}
              </code>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-muted-foreground">Telefone:</span>
              <code className="text-xs bg-background px-2 py-1 rounded">
                {getPhoneMapping()}
              </code>
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Canais de Envio</Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="email-channel"
                checked={parameters.channels?.includes('email') ?? true}
                onCheckedChange={(checked) => {
                  const channels = parameters.channels || ['email'];
                  if (checked) {
                    updateParameter('channels', [...new Set([...channels, 'email'])]);
                  } else {
                    updateParameter('channels', channels.filter((c: string) => c !== 'email'));
                  }
                }}
              />
              <Label htmlFor="email-channel" className="text-sm">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="whatsapp-channel"
                checked={parameters.channels?.includes('whatsapp') ?? false}
                onCheckedChange={(checked) => {
                  const channels = parameters.channels || ['email'];
                  if (checked) {
                    updateParameter('channels', [...new Set([...channels, 'whatsapp'])]);
                  } else {
                    updateParameter('channels', channels.filter((c: string) => c !== 'whatsapp'));
                  }
                }}
              />
              <Label htmlFor="whatsapp-channel" className="text-sm">
                <MessageCircle className="h-4 w-4 inline mr-1" />
                WhatsApp
              </Label>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Ocultar' : 'Mostrar'} Configurações Avançadas
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Expiração</Label>
                <Select
                  value={parameters.expires_in || '7 days'}
                  onValueChange={(value) => updateParameter('expires_in', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 day">1 dia</SelectItem>
                    <SelectItem value="3 days">3 dias</SelectItem>
                    <SelectItem value="7 days">7 dias</SelectItem>
                    <SelectItem value="15 days">15 dias</SelectItem>
                    <SelectItem value="30 days">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Prioridade</Label>
                <Select
                  value={parameters.priority || 'normal'}
                  onValueChange={(value) => updateParameter('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Notas Adicionais</Label>
              <Textarea
                value={parameters.notes || ''}
                onChange={(e) => updateParameter('notes', e.target.value)}
                placeholder="Adicione notas que serão incluídas no convite..."
                className="text-sm"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-resend"
                checked={parameters.auto_resend ?? false}
                onCheckedChange={(checked) => updateParameter('auto_resend', checked)}
              />
              <Label htmlFor="auto-resend" className="text-sm">
                Reenviar automaticamente se não aberto em 24h
              </Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">
              Ação configurada
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Pronto para usar
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};