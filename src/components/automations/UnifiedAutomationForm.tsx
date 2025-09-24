import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, TestTube, Settings, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { HublaEventSelector } from "./hubla/HublaEventSelector";
import { ConditionBuilder } from "./ConditionBuilder";
import { MigrationHelper } from "./MigrationHelper";
import { HublaInviteAction } from "./hubla/HublaInviteAction";

interface AutomationFormData {
  name: string;
  description: string;
  rule_type: string;
  is_active: boolean;
  priority: number;
  conditions: any;
  actions: any[];
}

export const UnifiedAutomationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [selectedHublaEvent, setSelectedHublaEvent] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<AutomationFormData>({
    defaultValues: {
      name: "",
      description: "",
      rule_type: "webhook",
      is_active: true,
      priority: 1,
      conditions: { id: 'root', operator: 'AND', conditions: [] },
      actions: []
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    if (isEditing) {
      loadRule();
    }
  }, [id]);

  const loadRule = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setValue('name', data.name);
        setValue('description', data.description || '');
        setValue('rule_type', data.rule_type);
        setValue('is_active', data.is_active);
        setValue('priority', data.priority);
        setValue('conditions', data.conditions);
        setValue('actions', data.actions);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a regra",
        variant: "destructive",
      });
      navigate('/admin/automations');
    }
  };

  const onSubmit = async (data: AutomationFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      let error;
      if (isEditing) {
        ({ error } = await supabase
          .from('automation_rules')
          .update(payload)
          .eq('id', id));
      } else {
        ({ error } = await supabase
          .from('automation_rules')
          .insert([payload]));
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Regra ${isEditing ? 'atualizada' : 'criada'} com sucesso`,
      });

      navigate('/admin/automations');
    } catch (error) {
      toast({
        title: "Erro",
        description: `Não foi possível ${isEditing ? 'atualizar' : 'criar'} a regra`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testRule = async () => {
    toast({
      title: "Teste iniciado",
      description: "Executando teste da regra com dados mock...",
    });
  };

  const addHublaAction = () => {
    const newAction = {
      type: 'hubla_invite',
      parameters: {
        role_id: 'lovable_course',
        template: 'lovable_course_welcome',
        channels: ['email', 'whatsapp'],
        expires_in: '7 days',
        email_source: 'payload.event.userEmail',
        name_source: 'payload.event.userName',
        phone_source: 'payload.event.userPhone'
      },
      enabled: true,
      order: watchedValues.actions.length + 1
    };
    
    setValue('actions', [...watchedValues.actions, newAction]);
  };

  const updateAction = (index: number, updates: any) => {
    const newActions = [...watchedValues.actions];
    newActions[index] = { ...newActions[index], ...updates };
    setValue('actions', newActions);
  };

  const removeAction = (index: number) => {
    const newActions = watchedValues.actions.filter((_, i) => i !== index);
    setValue('actions', newActions);
  };

  const handleMigration = (migratedConditions: any) => {
    setValue('conditions', migratedConditions);
    toast({
      title: "Migração concluída",
      description: "Condições foram migradas para o novo formato",
    });
  };

  const conditionsCount = watchedValues.conditions?.conditions?.length || 0;
  const actionsCount = watchedValues.actions?.length || 0;
  const isValid = watchedValues.name.trim() !== '' && conditionsCount > 0 && actionsCount > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/automations')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Editar Automação' : 'Nova Automação'}
            </h1>
            <p className="text-muted-foreground text-sm">
              Configure condições e ações em uma interface unificada
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={testRule} size="sm">
            <TestTube className="mr-2 h-4 w-4" />
            Testar
          </Button>
          <Badge variant={isValid ? "default" : "secondary"}>
            {isValid ? "Pronta" : "Incompleta"}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Configuração Básica
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {watchedValues.is_active ? 'Ativa' : 'Inativa'}
                </span>
                <Switch
                  checked={watchedValues.is_active}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Automação</Label>
                <Input
                  id="name"
                  placeholder="Ex: Boas-vindas Hubla"
                  {...register('name', { required: 'Nome é obrigatório' })}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição opcional"
                  {...register('description')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Migration Helper */}
        <MigrationHelper 
          conditions={watchedValues.conditions} 
          onMigrate={handleMigration}
        />

        {/* Main Content: Conditions + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conditions Column */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quando Executar</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure as condições que devem ser atendidas
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hubla Event Selector */}
                <HublaEventSelector
                  selectedEvent={selectedHublaEvent}
                  onEventChange={(eventType) => {
                    setSelectedHublaEvent(eventType);
                    // Auto-add condition for the selected event
                    const newCondition = {
                      field: 'payload.type',
                      operator: 'equals',
                      value: eventType
                    };
                    const currentConditions = watchedValues.conditions?.conditions || [];
                    const hasEventCondition = currentConditions.some((c: any) => c.field === 'payload.type');
                    
                    if (!hasEventCondition && eventType) {
                      setValue('conditions', {
                        id: 'root',
                        operator: 'AND',
                        conditions: [...currentConditions, newCondition]
                      });
                    }
                  }}
                />

                {/* Condition Builder */}
                <div className="space-y-2">
                  <Label>Condições Adicionais</Label>
                <ConditionBuilder
                  conditions={watchedValues.conditions}
                  onChange={(conditions) => setValue('conditions', conditions)}
                  availableFields={[]}
                />
                </div>

                {/* Conditions Summary */}
                {conditionsCount > 0 && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium mb-2">
                      {conditionsCount} condição(ões) configurada(s)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Operador: {watchedValues.conditions.operator} 
                      {watchedValues.conditions.operator === 'AND' 
                        ? ' (todas devem ser verdadeiras)'
                        : ' (pelo menos uma deve ser verdadeira)'
                      }
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Column */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">O Que Fazer</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configure as ações que serão executadas
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addHublaAction}
                  >
                    + Convite Hubla
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Actions List */}
                {watchedValues.actions.length > 0 ? (
                  <div className="space-y-3">
                    {watchedValues.actions.map((action: any, index: number) => (
                      <div key={index} className="relative">
                        {action.type === 'hubla_invite' ? (
                          <HublaInviteAction
                            action={action}
                            onUpdate={(updates) => updateAction(index, updates)}
                            onRemove={() => removeAction(index)}
                            compact={true}
                          />
                        ) : (
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{action.type}</Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAction(index)}
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma ação configurada</p>
                    <p className="text-sm">Clique em "+ Convite Hubla" para adicionar</p>
                  </div>
                )}

                {/* Actions Summary */}
                {actionsCount > 0 && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium">
                      {actionsCount} ação(ões) configurada(s)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Serão executadas sequencialmente quando as condições forem atendidas
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {watchedValues.is_active ? (
                <Play className="h-4 w-4 text-green-600" />
              ) : (
                <Pause className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-sm text-muted-foreground">
                Status: {watchedValues.is_active ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-muted-foreground">
              {conditionsCount} condições, {actionsCount} ações
            </span>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !isValid}
            className="min-w-[120px]"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
          </Button>
        </div>
      </form>
    </div>
  );
};