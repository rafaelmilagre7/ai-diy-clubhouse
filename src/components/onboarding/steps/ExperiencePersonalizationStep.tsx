
import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ExperiencePersonalizationStepProps {
  onSubmit: (stepId: string, data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
  isLastStep?: boolean;
}

const INTERESTS_OPTIONS = [
  { label: "Engenharia de Prompts", value: "engenharia_prompts", icon: "code" },
  { label: "Geração de Conteúdo com IA", value: "geracao_conteudo", icon: "file-text" },
  { label: "Automação e Produtividade", value: "automacao_produtividade", icon: "zap" },
  { label: "Marketing com IA", value: "marketing_ia", icon: "star" },
  { label: "Atendimento ao Cliente com IA", value: "atendimento_cliente", icon: "handshake" },
  { label: "Estratégia de Negócios com IA", value: "estrategia_negocios", icon: "layout-dashboard" },
  { label: "Chatbots e Assistentes Virtuais", value: "chatbots_assistentes", icon: "message-square" },
  { label: "Pesquisa com IA", value: "pesquisa_ia", icon: "database" },
  { label: "Geração de Código com IA", value: "geracao_codigo", icon: "code" },
  { label: "Vendas com IA", value: "vendas_ia", icon: "users" },
  { label: "Análise de Dados com IA", value: "analise_dados", icon: "chart-bar" },
];

const TIME_OPTIONS: { value: string; label: string; icon: string; emoji: string }[] = [
  { value: "manha", label: "Manhã (8h–12h)", icon: "sun", emoji: "☀️" },
  { value: "tarde", label: "Tarde (13h–18h)", icon: "cloud-sun", emoji: "🌤️" },
  { value: "noite", label: "Noite (19h–22h)", icon: "moon", emoji: "🌙" },
];

const DAYS_OPTIONS = [
  "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo",
];

const SKILLS_OPTIONS = [
  { label: "Engenharia de prompts", value: "engenharia_prompts" },
  { label: "Integração de APIs de IA", value: "integracao_apis" },
  { label: "Vendas potencializadas por IA", value: "vendas_ia" },
  { label: "Criação de conteúdo com IA", value: "criacao_conteudo" },
  { label: "Gestão de projetos de tecnologia", value: "gestao_projetos" },
  { label: "Desenvolvimento de chatbots", value: "desenvolvimento_chatbots" },
  { label: "Marketing digital com IA", value: "marketing_digital" },
  { label: "Automação de processos (no-code)", value: "automacao_no_code" },
  { label: "Desenvolvimento de produtos digitais", value: "desenvolvimento_produtos_digitais" },
  { label: "Análise de dados e Business Intelligence", value: "analise_dados_bi" },
];

const MENTORSHIP_OPTIONS = [
  { label: "Implementação prática de IA no negócio", value: "implementacao_pratica" },
  { label: "Engenharia de prompts avançada", value: "engenharia_prompts_avancada" },
  { label: "Automação de processos com no-code", value: "automacao_no_code" },
  { label: "Escalabilidade de soluções de IA", value: "escalabilidade_ia" },
  { label: "Marketing e geração de leads com IA", value: "marketing_leads" },
  { label: "Monetização de soluções de IA", value: "monetizacao_ia" },
  { label: "Criação de assistentes personalizados", value: "assistentes_personalizados" },
  { label: "Integração de múltiplas ferramentas de IA", value: "integracao_multi_ferramentas_ia" },
  { label: "Vendas e prospecção com IA", value: "vendas_prospeccao_ia" },
  { label: "Criação de conteúdo estratégico com IA", value: "conteudo_estrategico_ia" },
];

export const ExperiencePersonalizationStep: React.FC<ExperiencePersonalizationStepProps> = ({
  onSubmit, isSubmitting, initialData = {}, isLastStep = false
}) => {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      interests: initialData.interests || [],
      time_preference: initialData.time_preference || "",
      available_days: initialData.available_days || [],
      networking_availability: typeof initialData.networking_availability === "number" ? initialData.networking_availability : 5,
      skills_to_share: initialData.skills_to_share || [],
      mentorship_topics: initialData.mentorship_topics || [],
    }
  });

  // Verificação de obrigatoriedade
  const isValid = useMemo(() => {
    const w = watch();
    return [
      w.interests && w.interests.length > 0,
      w.time_preference,
      w.available_days && w.available_days.length > 0,
      w.skills_to_share && w.skills_to_share.length > 0,
      w.mentorship_topics && w.mentorship_topics.length > 0,
      typeof w.networking_availability === "number"
    ].every(Boolean);
  }, [watch()]);

  const handleFormSubmit = (formData: any) => {
    // Validação final: impede submit se não estiver válido
    if (!isValid) return;
    onSubmit("experience_personalization", { experience_personalization: formData });
  };

  // Utilitário para alternar seleções múltiplas
  function toggleSelect(field: string, value: string) {
    const arr = watch(field) || [];
    if (arr.includes(value)) {
      setValue(field, arr.filter((v: string) => v !== value), { shouldValidate: true });
    } else {
      setValue(field, [...arr, value], { shouldValidate: true });
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* 1. Interesses Específicos em IA */}
      <div>
        <label className="font-semibold text-gray-700 mb-2 block">
          Interesses Específicos em IA <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {INTERESTS_OPTIONS.map(opt => (
            <button key={opt.value}
              type="button"
              className={cn(
                "flex items-center gap-2 border rounded-lg px-3 py-2 transition-colors focus:ring-2",
                (watch("interests") || []).includes(opt.value)
                  ? "border-[#0ABAB5] bg-[#eafaf9] text-[#0ABAB5]"
                  : "border-gray-200 bg-white text-gray-700"
              )}
              onClick={() => toggleSelect("interests", opt.value)}
            >
              {/* Icone */}
              <span className="material-symbols-rounded mr-1">
                <span className={`lucide lucide-${opt.icon}`} style={{ color: "#0ABAB5" }} />
              </span>
              {opt.label}
            </button>
          ))}
        </div>
        {errors.interests && <span className="text-xs text-red-500">Selecione pelo menos um interesse.</span>}
      </div>
      {/* 2. Preferência de Horários */}
      <div>
        <label className="font-semibold text-gray-700 mb-2 block">
          Preferência de Horários para Encontros Online <span className="text-red-500">*</span>
        </label>
        <Controller
          name="time_preference"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <div className="flex gap-4">
              {TIME_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  className={cn(
                    "flex items-center border px-4 py-2 rounded-lg gap-2 transition-all",
                    field.value === opt.value
                      ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                      : "bg-white text-gray-700 border-gray-200"
                  )}
                  onClick={() => field.onChange(opt.value)}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        />
        {errors.time_preference && <span className="text-xs text-red-500">Escolha um horário.</span>}
      </div>
      {/* 3. Dias da Semana Disponíveis */}
      <div>
        <label className="font-semibold text-gray-700 mb-2 block">
          Dias da Semana Disponíveis <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DAYS_OPTIONS.map(day => (
            <button key={day}
              type="button"
              className={cn(
                "rounded-full px-4 py-1 border font-medium transition",
                (watch("available_days") || []).includes(day)
                  ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                  : "bg-white text-gray-700 border-gray-200"
              )}
              onClick={() => toggleSelect("available_days", day)}
            >
              {day}
            </button>
          ))}
        </div>
        {errors.available_days && <span className="text-xs text-red-500">Selecione pelo menos um dia.</span>}
      </div>
      {/* 4. Disponibilidade para Networking (slider) */}
      <div>
        <label className="font-semibold text-gray-700 mb-2 block">
          Disponibilidade para Networking <span className="text-red-500">*</span>
        </label>
        <Controller
          name="networking_availability"
          control={control}
          rules={{ required: true, min: 0, max: 10 }}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <Slider
                min={0}
                max={10}
                step={1}
                value={[field.value]}
                onValueChange={val => field.onChange(val[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs">
                <span>Pouca disponibilidade</span>
                <span>Muita disponibilidade</span>
              </div>
            </div>
          )}
        />
        {errors.networking_availability && <span className="text-xs text-red-500">Informe disponibilidade.</span>}
      </div>
      {/* 5. Habilidades que Você Pode Compartilhar */}
      <div>
        <label className="font-semibold text-gray-700 mb-2 block">
          Habilidades que Você Pode Compartilhar com a Comunidade <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {SKILLS_OPTIONS.map(opt => (
            <button key={opt.value}
              type="button"
              className={cn(
                "px-3 py-2 rounded-lg border transition-all text-sm",
                (watch("skills_to_share") || []).includes(opt.value)
                  ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                  : "bg-white text-gray-700 border-gray-200"
              )}
              onClick={() => toggleSelect("skills_to_share", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.skills_to_share && <span className="text-xs text-red-500">Escolha pelo menos uma habilidade.</span>}
      </div>
      {/* 6. Tópicos em que Você Gostaria de Receber Mentoria */}
      <div>
        <label className="font-semibold text-gray-700 mb-2 block">
          Tópicos em que Você Gostaria de Receber Mentoria <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {MENTORSHIP_OPTIONS.map(opt => (
            <button key={opt.value}
              type="button"
              className={cn(
                "px-3 py-2 rounded-lg border transition-all text-sm",
                (watch("mentorship_topics") || []).includes(opt.value)
                  ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                  : "bg-white text-gray-700 border-gray-200"
              )}
              onClick={() => toggleSelect("mentorship_topics", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.mentorship_topics && <span className="text-xs text-red-500">Escolha pelo menos um tópico.</span>}
      </div>
      {/* Botão Próximo */}
      <div className="pt-6 flex justify-end">
        <Button
          type="submit"
          className="min-w-[120px] bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? (
            "Salvando..."
          ) : (
            <span className="flex items-center gap-2">
              {isLastStep ? "Finalizar" : "Próximo"}
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
