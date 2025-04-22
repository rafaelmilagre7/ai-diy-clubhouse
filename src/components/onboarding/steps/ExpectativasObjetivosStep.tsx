
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingData, OnboardingStepProps } from "@/types/onboarding";

interface ExpectativasObjetivosStepProps extends OnboardingStepProps {
  initialData?: OnboardingData | any;
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

// Lista de possíveis motivos
const motivos = [
  { id: "networking", label: "Networking com outros empresários" },
  { id: "aprofundar_conhecimento", label: "Aprofundar conhecimento em IA" },
  { id: "implementar_solucoes", label: "Implementar soluções concretas" },
  { id: "be_atualizado", label: "Manter-me atualizado sobre IA" },
  { id: "mentoria", label: "Mentoria para implementar IA" },
  { id: "aprender_ferramentas", label: "Aprender ferramentas práticas" },
  { id: "capacitar_time", label: "Capacitar meu time em IA" },
  { id: "comunidade", label: "Fazer parte de uma comunidade de IA" },
];

// Lista de expectativas para 30 dias
const expectativas30Dias = [
  "Conhecer as principais ferramentas de IA para meu negócio",
  "Implementar pelo menos uma solução de IA",
  "Aumentar meu conhecimento sobre IA aplicada",
  "Melhorar um processo interno com IA",
  "Criar uma estratégia de IA para minha empresa",
  "Capacitar minha equipe em IA",
  "Reduzir custos com automação de IA",
  "Aumentar vendas/receita com IA",
];

// Lista de tipos de soluções prioritárias
const tiposSolucoes = [
  "Automação de processos internos",
  "Marketing e vendas com IA",
  "Análise de dados e insights",
  "Atendimento ao cliente automatizado",
  "Criação de conteúdo com IA",
  "Desenvolvimento de produtos/serviços",
  "Gestão estratégica assistida por IA",
];

// Opções de implementação
const opcoesImplementacao = [
  { id: "eu_mesmo", label: "Eu mesmo vou implementar" },
  { id: "delegar_time", label: "Vou delegar para alguém da equipe" },
  { id: "contratar_equipe", label: "Contratar equipe do VIVER DE IA" },
];

// Opções de disponibilidade semanal
const disponibilidadeSemanal = [
  "Menos de 1 hora",
  "1-2 horas",
  "3-5 horas",
  "Mais de 5 horas",
];

// Opções de formatos de conteúdo
const formatosConteudo = [
  { id: "video", label: "Vídeos" },
  { id: "texto", label: "Textos e guias" },
  { id: "audio", label: "Áudios/Podcasts" },
  { id: "ao_vivo", label: "Conteúdo ao vivo" },
  { id: "workshop", label: "Workshops práticos" },
];

export const ExpectativasObjetivosStep = ({
  onSubmit,
  isSubmitting,
  initialData,
  isLastStep,
  onComplete,
}: ExpectativasObjetivosStepProps) => {
  const [liveInterest, setLiveInterest] = useState<number>(5);
  
  // Extrair os dados iniciais de business_goals, lidar com string ou objeto
  const getInitialBusinessGoals = () => {
    if (!initialData) return {};
    
    let businessGoals = initialData.business_goals;
    
    // Se for string, tentar converter para objeto
    if (typeof businessGoals === 'string') {
      try {
        businessGoals = JSON.parse(businessGoals);
      } catch (e) {
        console.error("Erro ao converter business_goals de string:", e);
        businessGoals = {};
      }
    }
    
    // Se não for objeto ou for null/undefined, usar objeto vazio
    if (!businessGoals || typeof businessGoals !== 'object') {
      businessGoals = {};
    }
    
    console.log("Valor inicial de business_goals:", businessGoals);
    return businessGoals;
  };
  
  const businessGoals = getInitialBusinessGoals();
  
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      primary_goal: businessGoals.primary_goal || "",
      expected_outcome_30days: businessGoals.expected_outcome_30days || "",
      priority_solution_type: businessGoals.priority_solution_type || "",
      how_implement: businessGoals.how_implement || "",
      week_availability: businessGoals.week_availability || "",
      live_interest: businessGoals.live_interest || 5,
      content_formats: businessGoals.content_formats || [],
    }
  });
  
  // Inicializar o interesse em conteúdo ao vivo
  useEffect(() => {
    if (businessGoals.live_interest !== undefined) {
      setLiveInterest(Number(businessGoals.live_interest));
      setValue("live_interest", Number(businessGoals.live_interest));
    }
  }, [businessGoals, setValue]);
  
  // Manipulador para submissão do formulário
  const onFormSubmit = (data: FormValues) => {
    console.log("Dados do formulário de expectativas:", data);
    
    // Garantir que content_formats seja um array
    const contentFormats = Array.isArray(data.content_formats) 
      ? data.content_formats 
      : [data.content_formats].filter(Boolean);
    
    // Preparar dados para salvar
    const formattedData = {
      business_goals: {
        ...data,
        content_formats: contentFormats,
        live_interest: Number(data.live_interest)
      }
    };
    
    console.log("Enviando dados formatados:", formattedData);
    onSubmit(formattedData);
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Motivo Principal */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-6">
            Qual seu principal objetivo com o VIVER DE IA Club?
          </h2>
          
          <Controller
            name="primary_goal"
            control={control}
            rules={{ required: "Por favor, selecione um objetivo principal" }}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {motivos.map((motivo) => (
                  <div key={motivo.id} className="flex items-start space-x-3">
                    <RadioGroupItem 
                      value={motivo.id} 
                      id={`motivo-${motivo.id}`}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor={`motivo-${motivo.id}`}
                      className="cursor-pointer font-normal"
                    >
                      {motivo.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
          
          {errors.primary_goal && (
            <p className="text-red-500 text-sm mt-2">{errors.primary_goal.message}</p>
          )}
        </div>
        
        {/* Expectativa em 30 dias */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-6">
            O que você espera alcançar nos primeiros 30 dias?
          </h2>
          
          <Controller
            name="expected_outcome_30days"
            control={control}
            rules={{ required: "Por favor, selecione uma expectativa" }}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-col space-y-3"
              >
                {expectativas30Dias.map((expectativa, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <RadioGroupItem 
                      value={expectativa} 
                      id={`expectativa-${index}`}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor={`expectativa-${index}`}
                      className="cursor-pointer font-normal"
                    >
                      {expectativa}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
          
          {errors.expected_outcome_30days && (
            <p className="text-red-500 text-sm mt-2">{errors.expected_outcome_30days.message}</p>
          )}
        </div>
        
        {/* Tipo de Solução Prioritária */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-6">
            Que tipo de solução de IA é prioritária para você?
          </h2>
          
          <Controller
            name="priority_solution_type"
            control={control}
            rules={{ required: "Por favor, selecione um tipo de solução prioritária" }}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-col space-y-3"
              >
                {tiposSolucoes.map((tipo, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <RadioGroupItem 
                      value={tipo} 
                      id={`solucao-${index}`}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor={`solucao-${index}`}
                      className="cursor-pointer font-normal"
                    >
                      {tipo}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
          
          {errors.priority_solution_type && (
            <p className="text-red-500 text-sm mt-2">{errors.priority_solution_type.message}</p>
          )}
        </div>
        
        {/* Como Pretende Implementar */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-6">
            Como você pretende implementar as soluções de IA?
          </h2>
          
          <Controller
            name="how_implement"
            control={control}
            rules={{ required: "Por favor, selecione como pretende implementar" }}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-col space-y-3"
              >
                {opcoesImplementacao.map((opcao) => (
                  <div key={opcao.id} className="flex items-start space-x-3">
                    <RadioGroupItem 
                      value={opcao.id} 
                      id={`implementacao-${opcao.id}`}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor={`implementacao-${opcao.id}`}
                      className="cursor-pointer font-normal"
                    >
                      {opcao.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
          
          {errors.how_implement && (
            <p className="text-red-500 text-sm mt-2">{errors.how_implement.message}</p>
          )}
        </div>
        
        {/* Disponibilidade Semanal */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-6">
            Quanto tempo por semana você tem disponível para implementar IA?
          </h2>
          
          <Controller
            name="week_availability"
            control={control}
            rules={{ required: "Por favor, selecione sua disponibilidade semanal" }}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-col space-y-3"
              >
                {disponibilidadeSemanal.map((disponibilidade, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <RadioGroupItem 
                      value={disponibilidade} 
                      id={`disponibilidade-${index}`}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor={`disponibilidade-${index}`}
                      className="cursor-pointer font-normal"
                    >
                      {disponibilidade}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
          
          {errors.week_availability && (
            <p className="text-red-500 text-sm mt-2">{errors.week_availability.message}</p>
          )}
        </div>
        
        {/* Interesse em Conteúdo ao Vivo */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-4">
            Qual seu interesse em sessões ao vivo?
          </h2>
          <p className="text-gray-600 mb-6">
            Em uma escala de 0 a 10, o quanto você gostaria de participar de sessões ao vivo (implementações, Q&A, etc.)?
          </p>
          
          <Controller
            name="live_interest"
            control={control}
            render={({ field }) => (
              <div className="space-y-4">
                <Slider
                  value={[Number(field.value)]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(value) => {
                    setLiveInterest(value[0]);
                    field.onChange(value[0]);
                  }}
                  className="py-4"
                />
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Pouco interesse (0)</span>
                  <span className="text-center font-medium text-[#0ABAB5]">{liveInterest}</span>
                  <span className="text-sm text-gray-500">Muito interesse (10)</span>
                </div>
              </div>
            )}
          />
        </div>
        
        {/* Formatos de Conteúdo */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-6">
            Que formatos de conteúdo você prefere?
          </h2>
          <p className="text-gray-600 mb-6">
            Selecione todos os formatos que você gostaria de acessar no Club.
          </p>
          
          <Controller
            name="content_formats"
            control={control}
            rules={{ validate: value => (value && value.length > 0) || "Por favor, selecione pelo menos um formato" }}
            render={({ field }) => (
              <div className="space-y-3">
                {formatosConteudo.map((formato) => (
                  <div key={formato.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`formato-${formato.id}`}
                      checked={field.value?.includes(formato.id)}
                      onCheckedChange={(checked) => {
                        const updatedValue = [...(field.value || [])];
                        
                        if (checked) {
                          if (!updatedValue.includes(formato.id)) {
                            updatedValue.push(formato.id);
                          }
                        } else {
                          const index = updatedValue.indexOf(formato.id);
                          if (index !== -1) {
                            updatedValue.splice(index, 1);
                          }
                        }
                        
                        field.onChange(updatedValue);
                      }}
                    />
                    <Label 
                      htmlFor={`formato-${formato.id}`}
                      className="cursor-pointer font-normal"
                    >
                      {formato.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          />
          
          {errors.content_formats && (
            <p className="text-red-500 text-sm mt-2">{errors.content_formats.message}</p>
          )}
        </div>
        
        {/* Botão de Envio */}
        <div className="flex justify-end mt-8">
          <Button
            type="submit"
            className="bg-[#0ABAB5] hover:bg-[#099388] text-white px-5 py-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Salvando...
              </span>
            ) : isLastStep ? (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Concluir
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Próximo
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
