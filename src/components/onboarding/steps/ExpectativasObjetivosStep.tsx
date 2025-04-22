import React, { useState, useEffect } from "react";
import { OnboardingData } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { normalizeBusinessGoals } from "@/hooks/onboarding/persistence/utils/dataNormalization";

interface ExpectativasObjetivosStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete?: () => void;
  initialData?: any;
  personalInfo?: OnboardingData['personal_info'];
}

type FormValues = {
  primary_goal: string;
  expected_outcome_30days: string;
  priority_solution_type: string;
  how_implement: string;
  week_availability: string;
  live_interest: number;
  content_formats: string[];
};

export const ExpectativasObjetivosStep = ({
  onSubmit,
  isSubmitting,
  initialData,
  onComplete,
  isLastStep,
}: ExpectativasObjetivosStepProps) => {
  const [initializedForm, setInitializedForm] = useState(false);
  
  // Processar dados iniciais para garantir que temos um objeto válido
  const processInitialData = (data: any) => {
    if (!data) {
      console.log("Nenhum dado inicial recebido");
      return {};
    }
    
    console.log("ExpectativasObjetivosStep recebeu initialData:", data);
    
    // Verificar se já temos dados normalizados
    if (data.business_goals && typeof data.business_goals === 'object') {
      console.log("Usando business_goals como objeto:", data.business_goals);
      return data.business_goals;
    }
    
    // Se temos uma string, normalizar
    if (data.business_goals && typeof data.business_goals === 'string') {
      try {
        const parsedData = JSON.parse(data.business_goals);
        console.log("business_goals parseado de string:", parsedData);
        return parsedData;
      } catch (e) {
        console.error("Erro ao parsear business_goals:", e);
        return {};
      }
    }
    
    // Fallback para dados vazios
    console.log("Nenhum dado válido de business_goals encontrado");
    return {};
  };
  
  const businessGoalsData = processInitialData(initialData);
  
  const { control, handleSubmit, setValue, watch, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    defaultValues: {
      primary_goal: "",
      expected_outcome_30days: "",
      priority_solution_type: "",
      how_implement: "",
      week_availability: "",
      live_interest: 5,
      content_formats: [],
    },
    mode: "onChange"
  });

  // Monitore o interesse em sessões ao vivo
  const liveInterest = watch("live_interest");
  const formValues = watch();

  // Depuração de valores do formulário
  useEffect(() => {
    console.log("Valores atuais do formulário:", formValues);
  }, [formValues]);

  // Use efeito para inicializar dados se eles chegarem após o mount
  useEffect(() => {
    if (!initializedForm && initialData) {
      console.log("Inicializando formulário com dados processados:", businessGoalsData);
      
      // Para prevenir problemas de timing ou dados vazios
      if (Object.keys(businessGoalsData).length === 0) {
        console.log("Dados processados vazios, não inicializando formulário");
        setInitializedForm(true);
        return;
      }
      
      const fieldsToUpdate: Partial<FormValues> = {};
      
      // Configurar os valores do formulário com base nos dados processados
      if (businessGoalsData.primary_goal) fieldsToUpdate.primary_goal = businessGoalsData.primary_goal;
      if (businessGoalsData.expected_outcome_30days) fieldsToUpdate.expected_outcome_30days = businessGoalsData.expected_outcome_30days;
      if (businessGoalsData.priority_solution_type) fieldsToUpdate.priority_solution_type = businessGoalsData.priority_solution_type;
      if (businessGoalsData.how_implement) fieldsToUpdate.how_implement = businessGoalsData.how_implement;
      if (businessGoalsData.week_availability) fieldsToUpdate.week_availability = businessGoalsData.week_availability;
      if (businessGoalsData.live_interest !== undefined) fieldsToUpdate.live_interest = Number(businessGoalsData.live_interest);
      
      // Garantir que content_formats é um array
      if (businessGoalsData.content_formats) {
        if (Array.isArray(businessGoalsData.content_formats)) {
          fieldsToUpdate.content_formats = businessGoalsData.content_formats;
        } else if (typeof businessGoalsData.content_formats === 'string') {
          fieldsToUpdate.content_formats = [businessGoalsData.content_formats];
        }
      }
      
      console.log("Atualizando formulário com valores:", fieldsToUpdate);
      
      // Verificar se temos valores para atualizar
      if (Object.keys(fieldsToUpdate).length > 0) {
        // Redefinir o formulário com os novos valores para garantir uma atualização completa
        reset(fieldsToUpdate);
      }
      
      setInitializedForm(true);
    }
  }, [initialData, reset, initializedForm, businessGoalsData]);

  const onFormSubmit = (data: FormValues) => {
    console.log("Enviando dados do formulário ExpectativasObjetivos:", data);
    
    // Verificar explicitamente cada campo para garantir que temos valores válidos
    if (!data.primary_goal) {
      console.warn("Campo obrigatório primary_goal não preenchido");
      return;
    }
    
    if (!data.priority_solution_type) {
      console.warn("Campo obrigatório priority_solution_type não preenchido");
      return;
    }
    
    if (!data.how_implement) {
      console.warn("Campo obrigatório how_implement não preenchido");
      return;
    }
    
    if (!data.week_availability) {
      console.warn("Campo obrigatório week_availability não preenchido");
      return;
    }
    
    // Estruturar dados para envio
    const businessGoalsData: Partial<OnboardingData> = {
      business_goals: {
        primary_goal: data.primary_goal,
        expected_outcome_30days: data.expected_outcome_30days || "",
        expected_outcomes: data.expected_outcome_30days ? [data.expected_outcome_30days] : [],
        priority_solution_type: data.priority_solution_type,
        how_implement: data.how_implement,
        week_availability: data.week_availability,
        live_interest: Number(data.live_interest || 5),
        content_formats: Array.isArray(data.content_formats) ? data.content_formats : [],
      },
    };
    
    console.log("Dados formatados para envio:", JSON.stringify(businessGoalsData, null, 2));
    
    // Enviar dados com o ID da etapa correto
    onSubmit("business_goals", businessGoalsData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-4">
            Objetivo Principal com o Club
          </h2>
          
          <div className="space-y-4 mb-6">
            <Controller
              name="primary_goal"
              control={control}
              rules={{ required: "Por favor, selecione uma opção" }}
              render={({ field }) => (
                <div className="space-y-3">
                  <Label htmlFor="primary_goal" className="text-base font-medium">O que você busca principalmente ao participar do VIVER DE IA Club?</Label>
                  {errors.primary_goal && <p className="text-red-500 text-sm">{errors.primary_goal.message}</p>}
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="networking" id="networking" />
                      <Label htmlFor="networking" className="cursor-pointer">Networking com outros empresários</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="aprofundar_conhecimento" id="aprofundar_conhecimento" />
                      <Label htmlFor="aprofundar_conhecimento" className="cursor-pointer">Aprofundar conhecimento em IA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="implementar_solucoes" id="implementar_solucoes" />
                      <Label htmlFor="implementar_solucoes" className="cursor-pointer">Implementar soluções concretas de IA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="be_atualizado" id="be_atualizado" />
                      <Label htmlFor="be_atualizado" className="cursor-pointer">Manter-me atualizado sobre IA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mentoria" id="mentoria" />
                      <Label htmlFor="mentoria" className="cursor-pointer">Mentoria para implementar IA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="aprender_ferramentas" id="aprender_ferramentas" />
                      <Label htmlFor="aprender_ferramentas" className="cursor-pointer">Aprender ferramentas práticas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="capacitar_time" id="capacitar_time" />
                      <Label htmlFor="capacitar_time" className="cursor-pointer">Capacitar meu time em IA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comunidade" id="comunidade" />
                      <Label htmlFor="comunidade" className="cursor-pointer">Fazer parte de uma comunidade de IA</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            />
            
            <Controller
              name="expected_outcome_30days"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="expected_outcome_30days" className="text-base font-medium">Qual resultado concreto você espera alcançar nos primeiros 30 dias?</Label>
                  <Textarea
                    id="expected_outcome_30days"
                    placeholder="Exemplo: Implementar um chatbot de atendimento ou criar um fluxo de automação..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </div>
              )}
            />
            
            <Controller
              name="priority_solution_type"
              control={control}
              rules={{ required: "Por favor, selecione uma opção" }}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="priority_solution_type" className="text-base font-medium">Qual tipo de solução é prioritária para seu negócio agora?</Label>
                  {errors.priority_solution_type && <p className="text-red-500 text-sm">{errors.priority_solution_type.message}</p>}
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="aumento_vendas" id="aumento_vendas" />
                      <Label htmlFor="aumento_vendas" className="cursor-pointer">Aumento de vendas/receita</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reducao_custos" id="reducao_custos" />
                      <Label htmlFor="reducao_custos" className="cursor-pointer">Redução de custos/otimização</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="automacao_processos" id="automacao_processos" />
                      <Label htmlFor="automacao_processos" className="cursor-pointer">Automação de processos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="melhorar_experiencia" id="melhorar_experiencia" />
                      <Label htmlFor="melhorar_experiencia" className="cursor-pointer">Melhorar experiência do cliente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="analitica_decisao" id="analitica_decisao" />
                      <Label htmlFor="analitica_decisao" className="cursor-pointer">Análise de dados para decisões</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inovacao_produtos" id="inovacao_produtos" />
                      <Label htmlFor="inovacao_produtos" className="cursor-pointer">Inovação em produtos/serviços</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            />
            
            <Controller
              name="how_implement"
              control={control}
              rules={{ required: "Por favor, selecione uma opção" }}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="how_implement" className="text-base font-medium">Como você pretende implementar as soluções de IA?</Label>
                  {errors.how_implement && <p className="text-red-500 text-sm">{errors.how_implement.message}</p>}
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="eu_mesmo" id="eu_mesmo" />
                      <Label htmlFor="eu_mesmo" className="cursor-pointer">Eu mesmo vou implementar</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delegar_time" id="delegar_time" />
                      <Label htmlFor="delegar_time" className="cursor-pointer">Vou delegar para alguém da minha equipe</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="contratar_equipe" id="contratar_equipe" />
                      <Label htmlFor="contratar_equipe" className="cursor-pointer">Pretendo contratar a equipe do VIVER DE IA</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            />
            
            <Controller
              name="week_availability"
              control={control}
              rules={{ required: "Por favor, selecione uma opção" }}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="week_availability" className="text-base font-medium">Quantas horas por semana você tem disponíveis para implementar IA?</Label>
                  {errors.week_availability && <p className="text-red-500 text-sm">{errors.week_availability.message}</p>}
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="menos_1h" id="menos_1h" />
                      <Label htmlFor="menos_1h" className="cursor-pointer">Menos de 1 hora</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1-3h" id="1-3h" />
                      <Label htmlFor="1-3h" className="cursor-pointer">1-3 horas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4-7h" id="4-7h" />
                      <Label htmlFor="4-7h" className="cursor-pointer">4-7 horas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="8h+" id="8h+" />
                      <Label htmlFor="8h+" className="cursor-pointer">8+ horas</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            />
            
            <Controller
              name="live_interest"
              control={control}
              render={({ field }) => (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label htmlFor="live_interest" className="text-base font-medium">Interesse em sessões ao vivo (mentoria, implementação, etc.)</Label>
                    <span className="font-medium">{liveInterest}/10</span>
                  </div>
                  <Slider
                    id="live_interest"
                    defaultValue={[field.value]}
                    max={10}
                    step={1}
                    onValueChange={(vals) => field.onChange(vals[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Baixo interesse</span>
                    <span>Alto interesse</span>
                  </div>
                </div>
              )}
            />
            
            <Controller
              name="content_formats"
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Quais formatos de conteúdo você prefere? (selecione todos aplicáveis)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {['video', 'texto', 'audio', 'ao_vivo', 'workshop'].map((format) => (
                      <div key={format} className="flex items-center space-x-2">
                        <Checkbox 
                          id={format}
                          checked={field.value?.includes(format)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, format]);
                            } else {
                              field.onChange(currentValue.filter(v => v !== format));
                            }
                          }}
                        />
                        <Label htmlFor={format} className="cursor-pointer">
                          {format === 'video' && 'Vídeos'}
                          {format === 'texto' && 'Textos e guias'}
                          {format === 'audio' && 'Áudios/Podcasts'}
                          {format === 'ao_vivo' && 'Sessões ao vivo'}
                          {format === 'workshop' && 'Workshops práticos'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />
          </div>
          
          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              className="bg-[#0ABAB5] hover:bg-[#099388] text-white px-5 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Salvando..."
              ) : (
                <span className="flex items-center gap-2">
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
