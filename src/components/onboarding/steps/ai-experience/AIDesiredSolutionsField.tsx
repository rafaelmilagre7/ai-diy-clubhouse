
import React from "react";
import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

interface AIDesiredSolutionsFieldProps {
  control: any;
}

const marketingSolutions = [
  "Criação de conteúdo", "SEO e otimização", "Otimização de anúncios", "Análise de concorrentes",
  "Gestão de redes sociais", "Email marketing", "Personalização de marketing",
];

const salesSolutions = [
  "Qualificação de leads", "Automação de CRM", "Previsão de vendas", "Chatbot de vendas",
  "Geração de propostas", "Análises de vendas",
];

const hrSolutions = [
  "Triagem de currículos", "Onboarding de funcionários", "Análise de desempenho",
  "Automação de entrevistas", "Chatbot de RH", "Matching de talentos",
];

const processSolutions = [
  "Processamento de documentos", "Extração de dados", "Priorização de tarefas",
  "Automação de fluxos de trabalho", "Automação de relatórios", "Otimização de processos",
];

const customerSolutions = [
  "Bot de atendimento ao cliente", "Análise de sentimento", "Análise de feedback",
  "Segmentação de clientes", "Mapeamento de jornada do cliente", "Recomendações personalizadas",
];

const generalSolutions = [
  "Chatbots e assistentes virtuais", "Análise de dados", "Automação de marketing",
  "Atendimento ao cliente", "Geração de imagens", "Geração de áudio",
  "Planejamento estratégico com IA", "Geração de conteúdo", "Automação de processos",
  "Automação de vendas", "Automação de RH", "Geração de vídeos", "Assistentes de voz",
  "Desenvolvimento de produtos com IA",
];

export const AIDesiredSolutionsField: React.FC<AIDesiredSolutionsFieldProps> = ({ control }) => (
  <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
    <h3 className="text-lg font-medium text-gray-800">Quais soluções você deseja implementar no seu negócio?</h3>
    <Controller
      control={control}
      name="desired_solutions"
      rules={{ required: "Selecione pelo menos uma opção" }}
      render={({ field, fieldState }) => (
        <div className="space-y-8">
          <CategoryField title="Soluções de Marketing com IA" solutions={marketingSolutions} field={field} />
          <CategoryField title="Soluções de Vendas com IA" solutions={salesSolutions} field={field} />
          <CategoryField title="Soluções de RH com IA" solutions={hrSolutions} field={field} />
          <CategoryField title="Soluções de Processos com IA" solutions={processSolutions} field={field} />
          <CategoryField title="Soluções de Atendimento ao Cliente com IA" solutions={customerSolutions} field={field} />
          <CategoryField title="Soluções Gerais" solutions={generalSolutions} field={field} />
          {fieldState.error && (
            <span className="text-red-500 text-xs block mt-2">
              {fieldState.error.message}
            </span>
          )}
        </div>
      )}
    />
  </div>
);

const CategoryField = ({
  title,
  solutions,
  field,
}: {
  title: string;
  solutions: string[];
  field: any;
}) => (
  <div className="space-y-3">
    <h4 className="font-medium text-[#0ABAB5]">{title}</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 border-l-2 border-[#0ABAB5]/30">
      {solutions.map((solution) => (
        <label key={solution} className="flex items-center gap-2">
          <Checkbox
            checked={field.value?.includes(solution)}
            onCheckedChange={(checked) => {
              if (checked) {
                field.onChange([...(field.value || []), solution]);
              } else {
                field.onChange(
                  field.value?.filter((s: string) => s !== solution) || []
                );
              }
            }}
            id={`desired-${solution}`}
          />
          <span className="text-sm">{solution}</span>
        </label>
      ))}
    </div>
  </div>
);
