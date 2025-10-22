import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { HublaEventSelector } from "./hubla/HublaEventSelector";
import { ConditionBuilder } from "./ConditionBuilder";
import { HublaInviteAction } from "./hubla/HublaInviteAction";
import { TestAutomationDialog } from "./TestAutomationDialog";
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

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/automations')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Automação' : 'Nova Automação'}
          </h1>
        </div>
        
        {/* Test Button */}
        {(watchedValues.actions.length > 0) && (
          <TestAutomationDialog
            ruleData={{
              name: watchedValues.name || 'Teste',
              conditions: watchedValues.conditions,
              actions: watchedValues.actions
            }}
          />
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Automação</CardTitle>
            <p className="text-sm text-muted-foreground">
              Defina o nome e descrição desta automação
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Automação *</Label>
              <Input
                id="name"
                placeholder="Ex: Convite para curso Viver de IA"
                {...register("name", { 
                  required: "Nome da automação é obrigatório",
                  minLength: { value: 3, message: "Nome deve ter pelo menos 3 caracteres" }
                })}
                className={errors.name ? "border-destructive" : ""}
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descrição opcional para esta automação"
                {...register("description")}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Condições */}
        <Card>
          <CardHeader>
            <CardTitle>Condições</CardTitle>
            <p className="text-sm text-muted-foreground">
              Defina quando esta automação será ativada
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
            
            <ConditionBuilder
              conditions={watchedValues.conditions}
              onChange={(conditions) => setValue('conditions', conditions)}
              availableFields={HUBLA_FIELDS}
            />
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ações</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure o que acontecerá quando as condições forem atendidas
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addHublaAction}
              >
                + Adicionar Ação
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {watchedValues.actions.length > 0 ? (
              <div className="space-y-4">
                {watchedValues.actions.map((action: any, index: number) => (
                  <div key={index}>
                    {action.type === 'hubla_invite' ? (
                      <HublaInviteAction
                        action={action}
                        onUpdate={(updates) => updateAction(index, updates)}
                        onRemove={() => removeAction(index)}
                        compact={true}
                      />
                    ) : (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span>{action.type}</span>
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
                <p className="text-sm">Clique em "Adicionar Ação" para começar</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-center">
          <Button type="submit" disabled={loading} className="px-8">
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
};