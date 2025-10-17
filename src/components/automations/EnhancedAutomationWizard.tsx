import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, Play, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedWizardProgress } from "./EnhancedWizardProgress";

import { AutomationBasicInfo } from "./wizard/AutomationBasicInfo";
import { AutomationConditions } from "./wizard/AutomationConditions";
import { AutomationActions } from "./wizard/AutomationActions";
import { AutomationReview } from "./wizard/AutomationReview";


interface AutomationFormData {
  name: string;
  description: string;
  rule_type: string;
  is_active: boolean;
  priority: number;
  conditions: any;
  actions: any[];
}

export const EnhancedAutomationWizard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const steps = [
    {
      id: 1,
      title: "Informações",
      description: "Nome e configurações básicas",
      isCompleted: currentStep > 1,
      isActive: currentStep === 1,
      canNavigate: true
    },
    {
      id: 2,
      title: "Condições",
      description: "Quando executar a automação",
      isCompleted: currentStep > 2,
      isActive: currentStep === 2,
      canNavigate: currentStep >= 2
    },
    {
      id: 3,
      title: "Ações",
      description: "O que fazer quando ativada",
      isCompleted: currentStep > 3,
      isActive: currentStep === 3,
      canNavigate: currentStep >= 3
    },
    {
      id: 4,
      title: "Revisão",
      description: "Verificar e salvar",
      isCompleted: false,
      isActive: currentStep === 4,
      canNavigate: currentStep >= 4
    }
  ];

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
    // TODO: Implement test logic
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return watchedValues.name.trim() !== '';
      case 2:
        return watchedValues.conditions && 
               watchedValues.conditions.conditions && 
               watchedValues.conditions.conditions.length > 0;
      case 3:
        return watchedValues.actions && watchedValues.actions.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceedToNext()) {
      setCurrentStep(Math.min(4, currentStep + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || steps[step - 1].canNavigate) {
      setCurrentStep(step);
    }
  };

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
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Automação' : 'Nova Automação'}
            </h1>
            <p className="text-muted-foreground">
              Wizard inteligente para criar automações poderosas
            </p>
          </div>
        </div>
        {currentStep > 1 && (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={testRule}>
              <TestTube className="mr-2 h-4 w-4" />
              Testar
            </Button>
          </div>
        )}
      </div>

      {/* Progress */}
      <EnhancedWizardProgress
        currentStep={currentStep}
        steps={steps}
        onStepClick={goToStep}
      />

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {currentStep === 1 && (
          <AutomationBasicInfo
            register={register}
            errors={errors}
            watchedValues={watchedValues}
            setValue={setValue}
          />
        )}

        {currentStep === 2 && (
          <AutomationConditions
            conditions={watchedValues.conditions}
            onChange={(conditions) => setValue('conditions', conditions)}
          />
        )}

        {currentStep === 3 && (
          <AutomationActions
            actions={watchedValues.actions}
            onChange={(actions) => setValue('actions', actions)}
          />
        )}

        {currentStep === 4 && (
          <AutomationReview
            formData={watchedValues}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
            >
              Anterior
            </Button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToNext()}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                Próximo
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-system-healthy to-system-healthy/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Automação')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};