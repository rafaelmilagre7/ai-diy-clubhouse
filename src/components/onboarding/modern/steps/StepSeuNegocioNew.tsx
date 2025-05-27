
import React from 'react';
import { QuickFormStep } from '../QuickFormStep';
import { DropdownModerno } from '../DropdownModerno';
import { Input } from '@/components/ui/input';
import MilagrinhoAssistant from '../../MilagrinhoAssistant';
import { QuickOnboardingData } from '@/types/quickOnboarding';

interface StepSeuNegocioNewProps {
  data: QuickOnboardingData;
  onUpdate: (field: keyof QuickOnboardingData, value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
}

const COMPANY_SIZE_OPTIONS = [
  { value: 'solo', label: 'Trabalho sozinho(a)', icon: '👤' },
  { value: '2-10', label: '2 a 10 funcionários', icon: '👥' },
  { value: '11-50', label: '11 a 50 funcionários', icon: '🏢' },
  { value: '51-200', label: '51 a 200 funcionários', icon: '🏬' },
  { value: '200+', label: 'Mais de 200 funcionários', icon: '🏭' }
];

const COMPANY_SEGMENT_OPTIONS = [
  { value: 'tecnologia', label: 'Tecnologia', icon: '💻' },
  { value: 'ia', label: 'Inteligência Artificial', icon: '🤖' },
  { value: 'educacao', label: 'Educação', icon: '🎓' },
  { value: 'saude', label: 'Saúde', icon: '🏥' },
  { value: 'financeiro', label: 'Financeiro', icon: '💰' },
  { value: 'varejo', label: 'Varejo', icon: '🛍️' },
  { value: 'consultoria', label: 'Consultoria', icon: '💼' },
  { value: 'marketing', label: 'Marketing', icon: '📊' },
  { value: 'industria', label: 'Indústria', icon: '🏭' },
  { value: 'servicos', label: 'Serviços', icon: '🔧' },
  { value: 'outros', label: 'Outros', icon: '💭' }
];

const REVENUE_RANGE_OPTIONS = [
  { value: 'ate-100k', label: 'Até R$ 100 mil/ano', icon: '💚' },
  { value: '100k-500k', label: 'R$ 100 mil - 500 mil/ano', icon: '💛' },
  { value: '500k-1m', label: 'R$ 500 mil - 1 milhão/ano', icon: '🧡' },
  { value: '1m-5m', label: 'R$ 1 - 5 milhões/ano', icon: '❤️' },
  { value: '5m-10m', label: 'R$ 5 - 10 milhões/ano', icon: '💜' },
  { value: 'acima-10m', label: 'Acima de R$ 10 milhões/ano', icon: '💎' },
  { value: 'nao-informar', label: 'Prefiro não informar', icon: '🤐' }
];

const MAIN_CHALLENGE_OPTIONS = [
  { value: 'automatizar', label: 'Automatizar processos', icon: '⚙️' },
  { value: 'vendas', label: 'Aumentar vendas', icon: '📈' },
  { value: 'custos', label: 'Reduzir custos', icon: '💰' },
  { value: 'atendimento', label: 'Melhorar atendimento', icon: '💬' },
  { value: 'conteudo', label: 'Criar conteúdo', icon: '✍️' },
  { value: 'produtividade', label: 'Aumentar produtividade', icon: '🚀' },
  { value: 'outros', label: 'Outros desafios', icon: '💭' }
];

export const StepSeuNegocioNew: React.FC<StepSeuNegocioNewProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const firstName = data.name.split(' ')[0];

  return (
    <>
      <MilagrinhoAssistant
        userName={firstName}
        message="Agora me conte sobre sua empresa! Essas informações me ajudarão a entender melhor seu contexto de negócio para criar recomendações mais precisas."
      />
      
      <QuickFormStep
        title="Seu Negócio"
        description="Vamos entender melhor sua empresa e desafios"
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={onNext}
        onPrevious={onPrevious}
        canProceed={canProceed}
        showBack={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Nome da empresa <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.company_name}
              onChange={(e) => onUpdate('company_name', e.target.value)}
              placeholder="Sua empresa"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Seu cargo <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.role}
              onChange={(e) => onUpdate('role', e.target.value)}
              placeholder="Ex: CEO, Gerente, Analista"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Site da empresa
          </label>
          <Input
            type="url"
            value={data.company_website || ''}
            onChange={(e) => onUpdate('company_website', e.target.value)}
            placeholder="https://www.suaempresa.com.br"
            className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
          />
        </div>

        <DropdownModerno
          value={data.company_size}
          onChange={(value) => onUpdate('company_size', value)}
          options={COMPANY_SIZE_OPTIONS}
          placeholder="Selecione o tamanho da empresa"
          label="Tamanho da empresa"
          required
        />

        <DropdownModerno
          value={data.company_segment}
          onChange={(value) => onUpdate('company_segment', value)}
          options={COMPANY_SEGMENT_OPTIONS}
          placeholder="Selecione o segmento"
          label="Segmento da empresa"
          required
        />

        <DropdownModerno
          value={data.annual_revenue_range}
          onChange={(value) => onUpdate('annual_revenue_range', value)}
          options={REVENUE_RANGE_OPTIONS}
          placeholder="Selecione a faixa de faturamento"
          label="Faturamento anual"
          required
        />

        <DropdownModerno
          value={data.main_challenge}
          onChange={(value) => onUpdate('main_challenge', value)}
          options={MAIN_CHALLENGE_OPTIONS}
          placeholder="Qual seu principal desafio atual?"
          label="Principal desafio"
          required
        />
      </QuickFormStep>
    </>
  );
};
