
import React from "react";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { UseFormReturn } from "react-hook-form";
import { FormMessage } from "@/components/ui/form-message";
import type { ComplementaryInfoFormData } from "@/schemas/complementaryInfoSchema";

interface PriorityTopicsSectionProps {
  form: UseFormReturn<ComplementaryInfoFormData>;
}

const topicOptions = [
  { value: "ia_gerativa", label: "IA Gerativa (GPT/Claude/etc)" },
  { value: "assistentes_ia", label: "Assistentes de IA Personalizados" },
  { value: "automacao", label: "Automação de Processos" },
  { value: "computer_vision", label: "Visão Computacional" },
  { value: "dados", label: "Análise de Dados" },
  { value: "seo", label: "SEO e Marketing Digital" },
  { value: "atendimento", label: "Atendimento ao Cliente" },
  { value: "vendas", label: "Vendas e Prospecção" },
  { value: "rh", label: "RH e Recrutamento" },
  { value: "financeiro", label: "Controle Financeiro" },
  { value: "produto", label: "Desenvolvimento de Produto" },
  { value: "suporte", label: "Suporte ao Cliente" },
  { value: "marketing", label: "Marketing Digital" },
  { value: "operacoes", label: "Operações" },
  { value: "estrategia", label: "Estratégia de Negócios" }
];

export const PriorityTopicsSection = ({ form }: PriorityTopicsSectionProps) => {
  const { setValue, watch, formState: { errors } } = form;

  return (
    <div className="bg-card p-6 rounded-lg border border-border space-y-4">
      <div className="space-y-2">
        <Label className="text-lg font-semibold">
          Tópicos Prioritários para Você
        </Label>
        <p className="text-muted-foreground text-sm">
          Selecione até 5 tópicos que são mais importantes para o seu negócio. 
          Isso nos ajudará a personalizar sua experiência.
        </p>
      </div>
      <MultiSelect
        options={topicOptions}
        defaultValue={watch("priority_topics") || []}
        onChange={(selected) => setValue("priority_topics", selected)}
        placeholder="Selecione os tópicos"
        maxItems={5}
      />
      {errors.priority_topics && (
        <FormMessage type="error" message={errors.priority_topics.message} />
      )}
    </div>
  );
};
