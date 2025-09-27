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
import { HUBLA_FIELDS } from "@/hooks/useHublaEvents";

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-card rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/automations')}
              className="shrink-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-hubla-primary to-blue-600 bg-clip-text text-transparent">
                {isEditing ? 'Editar Automação' : 'Nova Automação Hubla'}
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Configure regras inteligentes que respondem automaticamente a eventos da Hubla, enviando convites personalizados por email e WhatsApp
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={testRule} size="sm" className="gap-2">
              <TestTube className="h-4 w-4" />
              Testar Regra
            </Button>
            <Badge 
              variant={isValid ? "default" : "secondary"} 
              className={`px-3 py-1 ${isValid ? 'bg-green-100 text-green-800 border-green-200' : ''}`}
            >
              {isValid ? "✅ Pronta" : "⚠️ Incompleta"}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <Card className="shadow-sm border-2">
            <CardHeader className="pb-6 bg-gradient-to-r from-muted/30 to-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  Informações Básicas
                </CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground font-medium">
                    {watchedValues.is_active ? '🟢 Ativa' : '🔴 Inativa'}
                  </span>
                  <Switch
                    checked={watchedValues.is_active}
                    onCheckedChange={(checked) => setValue('is_active', checked)}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold">Nome da Automação</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Boas-vindas Combo Viver de IA"
                    {...register('name', { required: 'Nome é obrigatório' })}
                    className={`h-11 ${errors.name ? 'border-destructive' : 'border-muted-foreground/20'}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span>⚠️</span> {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Descreva o objetivo desta automação..."
                    {...register('description')}
                    className="h-11 border-muted-foreground/20"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Conditions Column */}
            <div className="space-y-6">
              <Card className="shadow-sm border-2 border-blue-200/50">
                <CardHeader className="pb-6 bg-gradient-to-br from-blue-50/80 to-blue-100/40">
                  <CardTitle className="flex items-center gap-3 text-xl text-blue-800">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      🎯
                    </div>
                    Quando Executar
                  </CardTitle>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Defina <strong>exatamente quando</strong> esta automação deve ser ativada. Selecione o evento da Hubla e configure condições específicas para filtrar apenas as situações desejadas.
                  </p>
                  <div className="mt-4 p-4 bg-blue-600/5 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <div className="font-semibold mb-2">💡 Como funciona:</div>
                      <div className="space-y-1 text-xs">
                        <div>1. Escolha o evento (ex: "Nova Venda")</div>
                        <div>2. Adicione filtros específicos (produto, valor, etc.)</div>
                        <div>3. A automação só executará quando TODAS as condições forem verdadeiras</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Hubla Event Selector */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Evento da Hubla</Label>
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
                  </div>

                  {/* Condition Builder */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Filtros Adicionais</Label>
                    <ConditionBuilder
                      conditions={watchedValues.conditions}
                      onChange={(conditions) => setValue('conditions', conditions)}
                      availableFields={HUBLA_FIELDS}
                    />
                  </div>

                  {/* Conditions Summary */}
                  {conditionsCount > 0 && (
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                      <div className="text-sm font-semibold mb-2 text-blue-800">
                        📋 {conditionsCount} condição(ões) configurada(s)
                      </div>
                      <div className="text-xs text-blue-600">
                        Operador: <strong>{watchedValues.conditions.operator}</strong>
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
                    <CardTitle className="text-lg">🚀 O Que Fazer</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configure as ações que serão executadas automaticamente quando as condições forem atendidas.
                    </p>
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-800">
                        <strong>💡 Dica:</strong> Use "Convite Hubla" para criar e enviar convites automaticamente com os dados da venda (email, nome, telefone) mapeados automaticamente.
                      </div>
                    </div>
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
          <Card className="shadow-sm bg-gradient-to-r from-muted/20 to-muted/10 border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    {watchedValues.is_active ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <Play className="h-5 w-5" />
                        <span className="font-medium">Status: Ativa</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-700">
                        <Pause className="h-5 w-5" />
                        <span className="font-medium">Status: Inativa</span>
                      </div>
                    )}
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="text-sm text-muted-foreground space-x-4">
                    <span className="font-medium">📋 {conditionsCount} condições</span>
                    <span className="font-medium">⚡ {actionsCount} ações</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !isValid}
                  size="lg"
                  className={`min-w-[140px] h-12 text-base font-semibold ${
                    isValid 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                      : 'bg-muted'
                  }`}
                >
                  <Save className="mr-2 h-5 w-5" />
                  {loading ? 'Salvando...' : (isEditing ? 'Atualizar Regra' : 'Criar Automação')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};