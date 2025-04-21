
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel, FormMessage, FormControl, FormDescription, FormField } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Check, User, Users, Lightbulb, Rocket, TrendingUp, Handshake, Tool, Club, Video, Text, Headphones, Workshop } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingStepProps } from "@/types/onboarding";

const STEP_DROPDOWNS = {
  "goal30": [
    "Implementar uma solução de IA no meu negócio",
    "Estruturar um processo de inovação com IA",
    "Identificar oportunidades de IA relevantes",
    "Capacitar meu time rapidamente",
    "Conseguir um resultado tangível relacionado a IA"
  ],
  "priority_ia": [
    "Soluções de Marketing",
    "Soluções de Vendas",
    "Soluções de RH",
    "Soluções Operacionais",
    "Soluções de Atendimento",
    "Automação Generalista"
  ],
  "disponibilidade": [
    "Menos de 2h/semana",
    "2h a 5h/semana",
    "5h a 10h/semana",
    "10h+ semana"
  ]
};

const IMPLEMENTATION_OPTIONS = [
  {
    value: "delegar_time",
    icon: <User className="w-6 h-6 text-[#0ABAB5]" />,
    title: "Colocar pessoa do time",
    description: "Uma pessoa da sua equipe será responsável por implementar as soluções do Club."
  },
  {
    value: "eu_mesmo",
    icon: <Users className="w-6 h-6 text-[#0ABAB5]" />,
    title: "Eu mesmo vou implementar",
    description: "Você será responsável por implementar pessoalmente as soluções de IA no seu negócio."
  },
  {
    value: "contratar_equipe",
    icon: <Handshake className="w-6 h-6 text-[#0ABAB5]" />,
    title: "Contratar equipe VIVER DE IA",
    description: "A equipe do Club será contratada para implementar as soluções para seu negócio."
  }
];

const FORMATO_OPTIONS = [
  { value: "video", icon: <Video />, label: "Vídeo" },
  { value: "texto", icon: <Text />, label: "Texto" },
  { value: "audio", icon: <Headphones />, label: "Áudio" },
  { value: "ao_vivo", icon: <User />, label: "Ao vivo" },
  { value: "workshop", icon: <Tool />, label: "Workshop prático" }
];

const MOTIVOS_OPCOES = [
  { value: "networking", label: "Networking com outros empresários", icon: <Users /> },
  { value: "aprofundar_conhecimento", label: "Aprofundar conhecimento em IA", icon: <Lightbulb /> },
  { value: "implementar_solucoes", label: "Implementar soluções concretas", icon: <Rocket /> },
  { value: "be_atualizado", label: "Manter-me atualizado sobre IA", icon: <TrendingUp /> },
  { value: "mentoria", label: "Mentoria para implementar IA", icon: <Handshake /> },
  { value: "aprender_ferramentas", label: "Aprender ferramentas práticas", icon: <Tool /> },
  { value: "capacitar_time", label: "Capacitar meu time em IA", icon: <User /> },
  { value: "comunidade", label: "Fazer parte de uma comunidade de IA", icon: <Club /> }
];

interface ValoresForm {
  primary_goal: string;
  expected_outcome_30days: string;
  priority_solution_type: string;
  how_implement: string;
  week_availability: string;
  live_interest: number;
  content_formats: string[];
}
export const ExpectativasObjetivosStep: React.FC<OnboardingStepProps> = ({
  onSubmit,
  isSubmitting,
  isLastStep,
  onComplete,
  initialData,
}) => {
  const form = useForm<ValoresForm>({
    defaultValues: {
      primary_goal: initialData?.primary_goal || "",
      expected_outcome_30days: initialData?.expected_outcome_30days || "",
      priority_solution_type: initialData?.priority_solution_type || "",
      how_implement: initialData?.how_implement || "",
      week_availability: initialData?.week_availability || "",
      live_interest: initialData?.live_interest ?? 5,
      content_formats: initialData?.content_formats ?? []
    },
    mode: "onBlur"
  });

  function handleSubmit(data: ValoresForm) {
    onSubmit("business_goals", {
      business_goals: {
        primary_goal: data.primary_goal,
        expected_outcomes: [data.expected_outcome_30days],
        timeline: "",
        priority_solution_type: data.priority_solution_type,
        how_implement: data.how_implement,
        week_availability: data.week_availability,
        live_interest: data.live_interest,
        content_formats: data.content_formats
      }
    });
  }

  return (
    <Form {...form}>
      <form
        className="space-y-8"
        onSubmit={form.handleSubmit(handleSubmit)}
        autoComplete="off"
      >
        {/* 1. Motivo principal */}
        <FormField
          control={form.control}
          name="primary_goal"
          rules={{ required: "Selecione o principal motivo" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-base">Seu principal motivo para entrar no Club *</FormLabel>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col gap-3"
              >
                {MOTIVOS_OPCOES.map(opt => (
                  <RadioGroupItem
                    key={opt.value}
                    value={opt.value}
                    className={cn("flex items-center gap-2 p-3 border border-gray-200 rounded-lg", field.value === opt.value && "bg-[#0ABAB5]/10 border-[#0ABAB5]")}
                  >
                    <span className="flex items-center gap-2">
                      {opt.icon}<span>{opt.label}</span>
                    </span>
                  </RadioGroupItem>
                ))}
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 2. Objetivo em 30 dias */}
        <FormField
          control={form.control}
          name="expected_outcome_30days"
          rules={{ required: "Selecione seu objetivo principal" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>O que espera alcançar nos primeiros 30 dias? *</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="form-select block w-full mt-2 py-2 px-4 rounded border border-gray-300 focus:ring-[#0ABAB5] focus:border-[#0ABAB5] bg-white text-gray-900"
                >
                  <option value="">Selecione seu objetivo principal</option>
                  {STEP_DROPDOWNS.goal30.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 3. Tipo de solução prioritária */}
        <FormField
          control={form.control}
          name="priority_solution_type"
          rules={{ required: "Selecione sua prioridade" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de solução prioritária para implementar *</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="form-select block w-full mt-2 py-2 px-4 rounded border border-gray-300 focus:ring-[#0ABAB5] focus:border-[#0ABAB5] bg-white text-gray-900"
                >
                  <option value="">Selecione sua prioridade</option>
                  {STEP_DROPDOWNS.priority_ia.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 4. Como pretende implementar */}
        <FormField
          control={form.control}
          name="how_implement"
          rules={{ required: "Selecione uma opção" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Como pretende implementar as soluções do Club? *</FormLabel>
              <div className="flex flex-col md:flex-row gap-4">
                {IMPLEMENTATION_OPTIONS.map(opt => (
                  <div
                    key={opt.value}
                    className={cn(
                      "flex-1 border rounded-lg p-4 cursor-pointer transition-all",
                      field.value === opt.value
                        ? "border-[#0ABAB5] bg-[#0ABAB5]/10 shadow"
                        : "border-gray-200 bg-white"
                    )}
                    onClick={() => field.onChange(opt.value)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {opt.icon}
                      <span className="font-semibold">{opt.title}</span>
                      {field.value === opt.value && (
                        <Check className="ml-auto text-[#0ABAB5]" />
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{opt.description}</p>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 5. Disponibilidade semanal */}
        <FormField
          control={form.control}
          name="week_availability"
          rules={{ required: "Selecione sua disponibilidade semanal" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disponibilidade semanal para o Club *</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="form-select block w-full mt-2 py-2 px-4 rounded border border-gray-300 focus:ring-[#0ABAB5] focus:border-[#0ABAB5] bg-white text-gray-900"
                >
                  <option value="">Selecione sua disponibilidade semanal</option>
                  {STEP_DROPDOWNS.disponibilidade.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 6. Interesse em sessões ao vivo */}
        <FormField
          control={form.control}
          name="live_interest"
          rules={{ required: "Selecione seu interesse" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Interesse em participar das Sessões ao Vivo / Hotseats *
              </FormLabel>
              <Slider
                min={0}
                max={10}
                step={1}
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                className="w-full mt-4"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Pouco interesse</span>
                <span>Muito interesse</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 7. Preferência de formato (ícones visuais) */}
        <FormField
          control={form.control}
          name="content_formats"
          rules={{
            validate: (v) =>
              Array.isArray(v) && v.length > 0
                ? true
                : "Selecione pelo menos um formato preferido"
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block">Preferência de formato de conteúdo *</FormLabel>
              <ToggleGroup
                type="multiple"
                value={field.value}
                className="flex flex-wrap gap-2"
                onValueChange={(val: string[]) => field.onChange(val)}
              >
                {FORMATO_OPTIONS.map((f) => (
                  <ToggleGroupItem
                    key={f.value}
                    value={f.value}
                    className={cn(
                      "flex flex-col items-center gap-1 px-4 py-2 border rounded-md",
                      field.value.includes(f.value)
                        ? "border-[#0ABAB5] bg-[#0ABAB5]/10"
                        : "border-gray-200 bg-white"
                    )}
                  >
                    <span className="mb-1">{f.icon}</span>
                    <span className="text-xs">{f.label}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isSubmitting} type="submit" className="w-full bg-[#0ABAB5] mt-6">
          {isLastStep ? "Finalizar" : "Próximo"}
        </Button>
      </form>
    </Form>
  );
};
