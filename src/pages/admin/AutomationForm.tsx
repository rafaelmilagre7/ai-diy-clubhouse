import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedAutomationWizard } from "@/components/automations/EnhancedAutomationWizard";

interface AutomationFormData {
  name: string;
  description: string;
  rule_type: string;
  is_active: boolean;
  priority: number;
  conditions: any;
  actions: any[];
}

const AutomationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

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
      conditions: {},
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
    // TODO: Implementar lógica de teste
  };

  return <EnhancedAutomationWizard />;

  // Legacy form for reference
  const legacyForm = (
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
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Regra' : 'Nova Regra'}
            </h1>
            <p className="text-muted-foreground">
              Configure condições e ações para automação
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={testRule}>
            <Play className="mr-2 h-4 w-4" />
            Testar Regra
          </Button>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center space-x-4">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step >= stepNumber 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {stepNumber}
            </div>
            {stepNumber < 4 && <div className="w-16 h-px bg-muted mx-2" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Configure o nome e tipo da regra de automação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Regra</Label>
                <Input
                  id="name"
                  placeholder="Ex: Criação de convites plataforma"
                  {...register('name', { required: 'Nome é obrigatório' })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o que esta regra faz..."
                  {...register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule_type">Tipo de Regra</Label>
                <Select
                  value={watchedValues.rule_type}
                  onValueChange={(value) => setValue('rule_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="schedule">Agendada</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="priority">Prioridade</Label>
                  <p className="text-sm text-muted-foreground">
                    Regras com prioridade maior executam primeiro
                  </p>
                </div>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  className="w-20"
                  {...register('priority', { valueAsNumber: true })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Regra Ativa</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar ou desativar a execução da regra
                  </p>
                </div>
                <Switch
                  checked={watchedValues.is_active}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Condições</CardTitle>
              <CardDescription>
                Configure quando esta regra deve ser executada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConditionBuilder
                conditions={watchedValues.conditions.conditions ? watchedValues.conditions : {
                  id: 'root',
                  operator: 'AND',
                  conditions: []
                }}
                onChange={(conditions) => setValue('conditions', conditions)}
                availableFields={[
                  { value: 'event_type', label: 'Tipo de Evento', type: 'string' },
                  { value: 'payload.product_id', label: 'ID do Produto', type: 'string' },
                  { value: 'payload.customer.email', label: 'Email do Cliente', type: 'string' },
                  { value: 'payload.amount', label: 'Valor', type: 'number' },
                  { value: 'payload.status', label: 'Status', type: 'string' }
                ]}
              />
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <ActionSelector
            actions={watchedValues.actions}
            onChange={(actions) => setValue('actions', actions)}
          />
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Revisão</CardTitle>
              <CardDescription>
                Revise todas as configurações antes de salvar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Nome</h3>
                <p className="text-muted-foreground">{watchedValues.name}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Descrição</h3>
                <p className="text-muted-foreground">{watchedValues.description || 'Nenhuma descrição'}</p>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-medium">Tipo</h3>
                  <Badge variant="outline">{watchedValues.rule_type}</Badge>
                </div>
                <div>
                  <h3 className="font-medium">Prioridade</h3>
                  <Badge>{watchedValues.priority}</Badge>
                </div>
                <div>
                  <h3 className="font-medium">Status</h3>
                  <Badge variant={watchedValues.is_active ? "default" : "secondary"}>
                    {watchedValues.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Condições</h3>
                <pre className="text-sm bg-muted p-2 rounded">
                  {JSON.stringify(watchedValues.conditions, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-medium mb-2">Ações</h3>
                <pre className="text-sm bg-muted p-2 rounded">
                  {JSON.stringify(watchedValues.actions, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Anterior
          </Button>

          <div className="flex items-center gap-3">
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep(Math.min(4, step + 1))}
              >
                Próximo
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Regra')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AutomationForm;