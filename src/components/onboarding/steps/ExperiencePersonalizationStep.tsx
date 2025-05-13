
import React, { useState } from "react";
import { OnboardingStepProps } from "@/types/onboarding";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";
import { useForm, Controller } from "react-hook-form";
import { normalizeExperiencePersonalization } from "@/hooks/onboarding/persistence/utils/experiencePersonalizationNormalization";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Sun, Moon, Calendar, Users, BookOpen, Briefcase, Clock, GraduationCap } from "lucide-react";

// Interface para o formulário
interface ExperienceFormData {
  interests: string[];
  preferred_times: string[];
  days_available: string[];
  networking_level: number;
  shareable_skills: string[];
  mentorship_topics: string[];
}

// Opções disponíveis para cada campo
const INTERESTS_OPTIONS = [
  { value: "ia_generativa", label: "IA Generativa (GPT, Gemini, Claude)" },
  { value: "automacao", label: "Automação de Processos" },
  { value: "chatbots", label: "Chatbots e Assistentes Virtuais" },
  { value: "voice_ia", label: "IA de Voz e Reconhecimento de Fala" },
  { value: "analise_ia", label: "Análise de dados com IA" },
];

const TIME_OPTIONS = [
  { value: "manha", label: "Manhã (8h–12h)", emoji: "☀️" },
  { value: "tarde", label: "Tarde (13h–18h)", emoji: "🌤️" },
  { value: "noite", label: "Noite (19h–22h)", emoji: "🌙" },
];

const DAYS_OPTIONS = [
  "Segunda-feira", "Terça-feira", "Quarta-feira", 
  "Quinta-feira", "Sexta-feira", "Sábado", "Domingo",
];

const SKILLS_OPTIONS = [
  { value: "engenharia_prompts", label: "Engenharia de prompts" },
  { value: "integracao_apis", label: "Integração de APIs de IA" },
  { value: "vendas_ia", label: "Vendas potencializadas por IA" },
  { value: "criacao_conteudo", label: "Criação de conteúdo com IA" },
  { value: "gestao_projetos", label: "Gestão de projetos de tecnologia" },
  { value: "desenvolvimento_chatbots", label: "Desenvolvimento de chatbots" },
  { value: "marketing_digital", label: "Marketing digital com IA" },
  { value: "automacao_no_code", label: "Automação de processos (no-code)" },
  { value: "desenvolvimento_produtos_digitais", label: "Desenvolvimento de produtos digitais" },
  { value: "analise_dados_bi", label: "Análise de dados e Business Intelligence" },
];

const MENTORSHIP_TOPICS = [
  { value: "implementacao_pratica", label: "Implementação prática de IA no negócio" },
  { value: "engenharia_prompts", label: "Engenharia de prompts avançada" },
  { value: "automacao_processos", label: "Automação de processos com no-code" },
  { value: "escalabilidade", label: "Escalabilidade de soluções de IA" },
  { value: "marketing_geracao", label: "Marketing e geração de leads com IA" },
  { value: "monetizacao", label: "Monetização de soluções de IA" },
  { value: "criacao_assistentes", label: "Criação de assistentes personalizados" },
  { value: "integracao_ferramentas", label: "Integração de múltiplas ferramentas de IA" },
  { value: "vendas_prospeccao", label: "Vendas e prospecção com IA" },
  { value: "conteudo_estrategico", label: "Criação de conteúdo estratégico com IA" }
];

export const ExperiencePersonalizationStep: React.FC<OnboardingStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isLastStep,
  onComplete,
}) => {
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  
  // Extrair e normalizar dados iniciais
  const formInitialData = React.useMemo(() => {
    console.log("[ExperiencePersonalizationStep] Dados iniciais:", initialData);
    
    // Se não houver dados iniciais, usar valores padrão
    if (!initialData) {
      return {
        interests: [],
        preferred_times: [],
        days_available: [],
        networking_level: 5,
        shareable_skills: [],
        mentorship_topics: []
      };
    }
    
    // Extrair e normalizar os dados de experiência de personalização
    const experienceData = normalizeExperiencePersonalization(initialData.experience_personalization);
    console.log("[ExperiencePersonalizationStep] Dados normalizados:", experienceData);
    
    return experienceData;
  }, [initialData]);

  // Configurar o formulário com react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<ExperienceFormData>({
    defaultValues: formInitialData,
    mode: "onChange"
  });

  // Função para alternar seleção em campos de múltipla escolha
  const toggleSelection = (field: keyof ExperienceFormData, value: string) => {
    const currentValues = watch(field) as string[];
    
    if (!Array.isArray(currentValues)) {
      setValue(field, [value], { shouldValidate: true });
      return;
    }
    
    if (currentValues.includes(value)) {
      setValue(
        field, 
        currentValues.filter(v => v !== value), 
        { shouldValidate: true }
      );
    } else {
      setValue(field, [...currentValues, value], { shouldValidate: true });
    }
  };

  // Envio do formulário
  const onFormSubmit = (formData: ExperienceFormData) => {
    setHasAttemptedSubmit(true);
    
    if (!isValid) {
      console.error("[ExperiencePersonalizationStep] Formulário inválido:", errors);
      return;
    }
    
    console.log("[ExperiencePersonalizationStep] Enviando dados:", formData);
    
    // Enviar dados formatados no formato esperado pelo builder
    const dataForSubmit = {
      experience_personalization: {
        interests: formData.interests,
        preferred_times: formData.preferred_times,
        days_available: formData.days_available,
        networking_level: formData.networking_level,
        shareable_skills: formData.shareable_skills,
        mentorship_topics: formData.mentorship_topics,
      }
    };
    
    // Enviar dados para o builder
    onSubmit("experience_personalization", dataForSubmit);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1A1E2E] rounded-lg border border-neutral-700 p-6 shadow-md backdrop-blur-sm">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          {/* Interesses em IA */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="text-[#0ABAB5] h-5 w-5" />
              <label className="font-semibold text-white">
                Interesses Específicos em IA <span className="text-red-500">*</span>
              </label>
            </div>
            <Controller
              name="interests"
              control={control}
              rules={{ required: true, minLength: 1 }}
              render={({ field }) => (
                <div className={cn(
                  "flex flex-wrap gap-3",
                  errors.interests && hasAttemptedSubmit ? "border border-red-500 p-3 rounded-md" : ""
                )}>
                  {INTERESTS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={cn(
                        "px-3 py-2 rounded-lg border transition-all text-sm",
                        (field.value || []).includes(opt.value)
                          ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                          : "bg-[#151823] text-neutral-300 border-neutral-700 hover:border-neutral-600"
                      )}
                      onClick={() => toggleSelection("interests", opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.interests && hasAttemptedSubmit && (
              <span className="text-xs text-red-500 mt-1 block">
                Selecione pelo menos um interesse.
              </span>
            )}
          </div>

          {/* Horários Preferidos */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="text-[#0ABAB5] h-5 w-5" />
              <label className="font-semibold text-white">
                Horários Preferidos para Encontros Online <span className="text-red-500">*</span>
              </label>
            </div>
            <Controller
              name="preferred_times"
              control={control}
              rules={{ required: true, minLength: 1 }}
              render={({ field }) => (
                <div className={cn(
                  "flex flex-wrap gap-4",
                  errors.preferred_times && hasAttemptedSubmit ? "border border-red-500 p-3 rounded-md" : ""
                )}>
                  {TIME_OPTIONS.map(opt => (
                    <button
                      type="button"
                      key={opt.value}
                      className={cn(
                        "flex items-center border px-4 py-2 rounded-lg gap-2 transition-all flex-1",
                        (field.value || []).includes(opt.value)
                          ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                          : "bg-[#151823] text-neutral-300 border-neutral-700 hover:border-neutral-600"
                      )}
                      onClick={() => toggleSelection("preferred_times", opt.value)}
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.preferred_times && hasAttemptedSubmit && (
              <span className="text-xs text-red-500 mt-1 block">
                Escolha pelo menos um horário.
              </span>
            )}
          </div>

          {/* Dias Disponíveis */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="text-[#0ABAB5] h-5 w-5" />
              <label className="font-semibold text-white">
                Dias da Semana Disponíveis <span className="text-red-500">*</span>
              </label>
            </div>
            <Controller
              name="days_available"
              control={control}
              rules={{ required: true, minLength: 1 }}
              render={({ field }) => (
                <div className={cn(
                  "flex flex-wrap gap-2",
                  errors.days_available && hasAttemptedSubmit ? "border border-red-500 p-3 rounded-md" : ""
                )}>
                  {DAYS_OPTIONS.map(day => (
                    <button key={day}
                      type="button"
                      className={cn(
                        "rounded-full px-4 py-1 border font-medium transition",
                        (field.value || []).includes(day)
                          ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                          : "bg-[#151823] text-neutral-300 border-neutral-700 hover:border-neutral-600"
                      )}
                      onClick={() => toggleSelection("days_available", day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.days_available && hasAttemptedSubmit && (
              <span className="text-xs text-red-500 mt-1 block">
                Selecione pelo menos um dia.
              </span>
            )}
          </div>

          {/* Nível de Networking */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-[#0ABAB5] h-5 w-5" />
              <label className="font-semibold text-white">
                Disponibilidade para Networking <span className="text-red-500">*</span>
              </label>
            </div>
            <Controller
              name="networking_level"
              control={control}
              rules={{ required: true, min: 0, max: 10 }}
              render={({ field }) => (
                <div className={cn(
                  "flex flex-col gap-2 bg-[#151823] p-4 rounded-lg border border-neutral-700",
                  errors.networking_level && hasAttemptedSubmit ? "border-red-500" : ""
                )}>
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[field.value || 0]}
                    onValueChange={val => field.onChange(val[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Pouca disponibilidade</span>
                    <span className="text-[#0ABAB5] text-lg font-medium">{field.value || 0}</span>
                    <span>Muita disponibilidade</span>
                  </div>
                </div>
              )}
            />
            {errors.networking_level && hasAttemptedSubmit && (
              <span className="text-xs text-red-500 mt-1 block">
                Informe sua disponibilidade.
              </span>
            )}
          </div>

          {/* Habilidades para Compartilhar */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="text-[#0ABAB5] h-5 w-5" />
              <label className="font-semibold text-white">
                Habilidades que Você Pode Compartilhar <span className="text-red-500">*</span>
              </label>
            </div>
            <Controller
              name="shareable_skills"
              control={control}
              rules={{ required: true, minLength: 1 }}
              render={({ field }) => (
                <div className={cn(
                  "flex flex-wrap gap-3",
                  errors.shareable_skills && hasAttemptedSubmit ? "border border-red-500 p-3 rounded-md" : ""
                )}>
                  {SKILLS_OPTIONS.map(opt => (
                    <button key={opt.value}
                      type="button"
                      className={cn(
                        "px-3 py-2 rounded-lg border transition-all text-sm",
                        (field.value || []).includes(opt.value)
                          ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                          : "bg-[#151823] text-neutral-300 border-neutral-700 hover:border-neutral-600"
                      )}
                      onClick={() => toggleSelection("shareable_skills", opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.shareable_skills && hasAttemptedSubmit && (
              <span className="text-xs text-red-500 mt-1 block">
                Escolha pelo menos uma habilidade.
              </span>
            )}
          </div>

          {/* Tópicos para Mentoria */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="text-[#0ABAB5] h-5 w-5" />
              <label className="font-semibold text-white">
                Tópicos em que Gostaria de Receber Mentoria <span className="text-red-500">*</span>
              </label>
            </div>
            <Controller
              name="mentorship_topics"
              control={control}
              rules={{ required: true, minLength: 1 }}
              render={({ field }) => (
                <div className={cn(
                  "flex flex-wrap gap-3",
                  errors.mentorship_topics && hasAttemptedSubmit ? "border border-red-500 p-3 rounded-md" : ""
                )}>
                  {MENTORSHIP_TOPICS.map(topic => (
                    <button key={topic.value}
                      type="button"
                      className={cn(
                        "px-3 py-2 rounded-lg border transition-all text-sm",
                        (field.value || []).includes(topic.value)
                          ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                          : "bg-[#151823] text-neutral-300 border-neutral-700 hover:border-neutral-600"
                      )}
                      onClick={() => toggleSelection("mentorship_topics", topic.value)}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.mentorship_topics && hasAttemptedSubmit && (
              <span className="text-xs text-red-500 mt-1 block">
                Escolha pelo menos um tópico.
              </span>
            )}
          </div>

          {/* Mensagem de erro geral */}
          {hasAttemptedSubmit && !isValid && (
            <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-md text-red-300 text-sm">
              Por favor, preencha todos os campos obrigatórios para continuar.
            </div>
          )}

          {/* Botões de navegação */}
          <NavigationButtons
            isSubmitting={isSubmitting}
            submitText="Próximo"
            loadingText="Salvando..."
            showPrevious={true}
            className="mt-8"
          />
        </form>
      </div>
    </div>
  );
};
