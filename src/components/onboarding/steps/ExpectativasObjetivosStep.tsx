
import React, { useState, useEffect, useRef } from "react";
import { OnboardingData } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

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

export const ExpectativasObjetivosStep: React.FC<ExpectativasObjetivosStepProps> = React.memo(({
  onSubmit,
  isSubmitting,
  initialData,
  onComplete,
  isLastStep,
}) => {
  const [formInitialized, setFormInitialized] = useState(false);
  const initAttempted = useRef(false);
  const initialDataRef = useRef(initialData);

  // Registrar quando o initialData muda para debug
  if (initialDataRef.current !== initialData) {
    console.log("[ExpectativasObjetivos] initialData mudou:", { 
      old: initialDataRef.current?.business_goals ? 'tem dados' : 'sem dados', 
      new: initialData?.business_goals ? 'tem dados' : 'sem dados' 
    });
    initialDataRef.current = initialData;
  }
  
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
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
  
  // Processar dados iniciais uma vez apenas
  useEffect(() => {
    // Se já tentamos inicializar o form antes ou não temos dados, não tentar novamente
    if (initAttempted.current || !initialData) return;
    
    initAttempted.current = true;
    console.log("[ExpectativasObjetivos] Iniciando processamento de dados iniciais");
    
    try {
      const businessGoals = initialData?.business_goals || {};
      if (!businessGoals || Object.keys(businessGoals).length === 0) {
        console.log("[ExpectativasObjetivos] Sem dados de business_goals para inicializar formulário");
        setFormInitialized(true);
        return;
      }
      
      // Preparar dados para o formulário
      const formData: Partial<FormValues> = {};
      
      // Mapear campos simples
      const stringFields = ['primary_goal', 'expected_outcome_30days', 'priority_solution_type', 
                           'how_implement', 'week_availability'];
      
      stringFields.forEach(field => {
        const value = businessGoals[field as keyof typeof businessGoals];
        if (value && typeof value === 'string') {
          formData[field as keyof FormValues] = value;
        }
      });
      
      // Processar live_interest (número)
      if (businessGoals.live_interest !== undefined) {
        const numericValue = Number(businessGoals.live_interest);
        if (!isNaN(numericValue)) {
          formData.live_interest = numericValue;
        }
      }
      
      // Processar content_formats (array)
      if (businessGoals.content_formats) {
        if (Array.isArray(businessGoals.content_formats)) {
          formData.content_formats = businessGoals.content_formats;
        } else if (typeof businessGoals.content_formats === 'string') {
          formData.content_formats = [businessGoals.content_formats];
        }
      }
      
      console.log("[ExpectativasObjetivos] Inicializando formulário com valores:", formData);
      reset(formData);
      
    } catch (error) {
      console.error("[ExpectativasObjetivos] Erro ao processar dados iniciais:", error);
    } finally {
      setFormInitialized(true);
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: FormValues) => {
    console.log("[ExpectativasObjetivos] Enviando formulário:", data);
    
    // Verificar campos obrigatórios explicitamente
    const requiredFields = ['primary_goal', 'priority_solution_type', 'how_implement', 'week_availability'];
    const missingFields = requiredFields.filter(field => !data[field as keyof FormValues]);
    
    if (missingFields.length > 0) {
      console.warn("[ExpectativasObjetivos] Campos obrigatórios não preenchidos:", missingFields);
      return;
    }
    
    // Estruturar dados para envio, evitando modificar o objeto original
    const businessGoalsData: Partial<OnboardingData> = {
      business_goals: {
        primary_goal: data.primary_goal,
        expected_outcome_30days: data.expected_outcome_30days || "",
        expected_outcomes: data.expected_outcome_30days ? [data.expected_outcome_30days] : [],
        priority_solution_type: data.priority_solution_type,
        how_implement: data.how_implement,
        week_availability: data.week_availability,
        live_interest: Number(data.live_interest || 5),
        content_formats: Array.isArray(data.content_formats) ? [...data.content_formats] : [],
      },
    };
    
    onSubmit("business_goals", businessGoalsData);
  };

  if (!formInitialized) {
    return (
      <div className="flex justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-6 w-6 border-2 border-[#0ABAB5] border-t-transparent rounded-full"></div>
          <p className="mt-2 text-sm text-gray-500">Preparando formulário...</p>
        </div>
      </div>
    );
  }

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
                          checked={Array.isArray(field.value) && field.value.includes(format)}
                          onCheckedChange={(checked) => {
                            const currentValue = Array.isArray(field.value) ? [...field.value] : [];
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
});

ExpectativasObjetivosStep.displayName = "ExpectativasObjetivosStep";
