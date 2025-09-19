import { useState } from "react";
import { Plus, X, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface ActionSelectorProps {
  actions: any[];
  onChange: (actions: any[]) => void;
}

export const ActionSelector = ({ actions, onChange }: ActionSelectorProps) => {
  const [newActionType, setNewActionType] = useState<string>('');

  const actionTypes = [
    { value: 'send_invite', label: 'Enviar Convite', description: 'Criar e enviar convite para usuário' },
    { value: 'create_user', label: 'Criar Usuário', description: 'Criar perfil de usuário automaticamente' },
    { value: 'send_email', label: 'Enviar Email', description: 'Enviar email personalizado' },
    { value: 'send_whatsapp', label: 'Enviar WhatsApp', description: 'Enviar mensagem via WhatsApp' },
    { value: 'webhook_call', label: 'Chamar Webhook', description: 'Fazer chamada HTTP para URL externa' },
    { value: 'update_profile', label: 'Atualizar Perfil', description: 'Modificar dados do perfil do usuário' },
  ];

  const getDefaultParameters = (actionType: string) => {
    switch (actionType) {
      case 'send_invite':
        return {
          role_id: 'default_member_role',
          template: 'welcome_template',
          channels: ['email'],
          expires_in: '7 days'
        };
      case 'create_user':
        return {
          role_id: 'default_member_role',
          auto_activate: true,
          send_welcome: true
        };
      case 'send_email':
        return {
          template: 'default_template',
          subject: 'Notificação',
          priority: 'normal'
        };
      case 'send_whatsapp':
        return {
          template: 'default_whatsapp_template',
          priority: 'normal'
        };
      case 'webhook_call':
        return {
          url: 'https://example.com/webhook',
          method: 'POST',
          headers: {},
          timeout: 30
        };
      case 'update_profile':
        return {
          fields: {},
          conditions: {}
        };
      default:
        return {};
    }
  };

  const addAction = () => {
    if (!newActionType) return;
    
    const newAction = {
      type: newActionType,
      parameters: getDefaultParameters(newActionType),
      enabled: true,
      order: actions.length + 1
    };
    
    onChange([...actions, newAction]);
    setNewActionType('');
  };

  const removeAction = (index: number) => {
    const newActions = actions.filter((_, i) => i !== index);
    onChange(newActions);
  };

  const updateAction = (index: number, updates: Partial<any>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    onChange(newActions);
  };

  const updateActionParameter = (index: number, key: string, value: any) => {
    const newActions = [...actions];
    newActions[index] = {
      ...newActions[index],
      parameters: {
        ...newActions[index].parameters,
        [key]: value
      }
    };
    onChange(newActions);
  };

  const moveAction = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === actions.length - 1)
    ) {
      return;
    }

    const newActions = [...actions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newActions[index], newActions[targetIndex]] = [newActions[targetIndex], newActions[index]];
    onChange(newActions);
  };

  const renderActionParameters = (action: any, index: number) => {
    switch (action.type) {
      case 'send_invite':
        return (
          <div className="space-y-3">
            <div>
              <Label>Role ID</Label>
              <Input
                value={action.parameters.role_id || ''}
                onChange={(e) => updateActionParameter(index, 'role_id', e.target.value)}
                placeholder="ID do papel do usuário"
              />
            </div>
            <div>
              <Label>Template</Label>
              <Select
                value={action.parameters.template || 'welcome_template'}
                onValueChange={(value) => updateActionParameter(index, 'template', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome_template">Template de Boas-vindas</SelectItem>
                  <SelectItem value="premium_welcome">Template Premium</SelectItem>
                  <SelectItem value="course_access">Acesso ao Curso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Canais de Entrega</Label>
              <div className="flex gap-2 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={action.parameters.channels?.includes('email') || false}
                    onChange={(e) => {
                      const channels = action.parameters.channels || [];
                      const newChannels = e.target.checked
                        ? [...channels, 'email']
                        : channels.filter((c: string) => c !== 'email');
                      updateActionParameter(index, 'channels', newChannels);
                    }}
                  />
                  Email
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={action.parameters.channels?.includes('whatsapp') || false}
                    onChange={(e) => {
                      const channels = action.parameters.channels || [];
                      const newChannels = e.target.checked
                        ? [...channels, 'whatsapp']
                        : channels.filter((c: string) => c !== 'whatsapp');
                      updateActionParameter(index, 'channels', newChannels);
                    }}
                  />
                  WhatsApp
                </label>
              </div>
            </div>
          </div>
        );

      case 'send_email':
        return (
          <div className="space-y-3">
            <div>
              <Label>Template</Label>
              <Input
                value={action.parameters.template || ''}
                onChange={(e) => updateActionParameter(index, 'template', e.target.value)}
                placeholder="Nome do template"
              />
            </div>
            <div>
              <Label>Assunto</Label>
              <Input
                value={action.parameters.subject || ''}
                onChange={(e) => updateActionParameter(index, 'subject', e.target.value)}
                placeholder="Assunto do email"
              />
            </div>
          </div>
        );

      case 'webhook_call':
        return (
          <div className="space-y-3">
            <div>
              <Label>URL</Label>
              <Input
                value={action.parameters.url || ''}
                onChange={(e) => updateActionParameter(index, 'url', e.target.value)}
                placeholder="https://example.com/webhook"
              />
            </div>
            <div>
              <Label>Método</Label>
              <Select
                value={action.parameters.method || 'POST'}
                onValueChange={(value) => updateActionParameter(index, 'method', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Headers (JSON)</Label>
              <Textarea
                value={JSON.stringify(action.parameters.headers || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value);
                    updateActionParameter(index, 'headers', headers);
                  } catch {
                    // Ignore invalid JSON
                  }
                }}
                placeholder='{"Authorization": "Bearer token"}'
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label>Parâmetros (JSON)</Label>
            <Textarea
              value={JSON.stringify(action.parameters || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parameters = JSON.parse(e.target.value);
                  updateAction(index, { parameters });
                } catch {
                  // Ignore invalid JSON
                }
              }}
              rows={4}
            />
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações</CardTitle>
        <CardDescription>
          Configure as ações que serão executadas quando as condições forem atendidas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Action */}
        <div className="flex gap-3">
          <Select value={newActionType} onValueChange={setNewActionType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione uma ação" />
            </SelectTrigger>
            <SelectContent>
              {actionTypes.map(action => (
                <SelectItem key={action.value} value={action.value}>
                  <div>
                    <div className="font-medium">{action.label}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addAction} disabled={!newActionType}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {/* Actions List */}
        <div className="space-y-4">
          {actions.map((action, index) => {
            const actionType = actionTypes.find(t => t.value === action.type);
            return (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <CardTitle className="text-base">
                          {actionType?.label || action.type}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {actionType?.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={action.enabled !== false}
                        onCheckedChange={(checked) => updateAction(index, { enabled: checked })}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAction(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderActionParameters(action, index)}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {actions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="mx-auto h-8 w-8 mb-2" />
            <p>Nenhuma ação configurada</p>
            <p className="text-sm">Adicione uma ação acima para começar</p>
          </div>
        )}

        {/* Actions Preview */}
        {actions.length > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Preview das Ações</Label>
            <pre className="text-xs mt-2 whitespace-pre-wrap">
              {JSON.stringify(actions, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};