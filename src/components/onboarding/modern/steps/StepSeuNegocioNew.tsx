
import React from 'react';
import { QuickFormStep } from '../QuickFormStep';
import { DropdownModerno } from '../DropdownModerno';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  { value: 'solo', label: 'Apenas eu (Solo)', icon: '👤' },
  { value: '2-5', label: '2-5 funcionários', icon: '👥' },
  { value: '6-20', label: '6-20 funcionários', icon: '🏢' },
  { value: '21-50', label: '21-50 funcionários', icon: '🏬' },
  { value: '51-200', label: '51-200 funcionários', icon: '🏭' },
  { value: '200+', label: '200+ funcionários', icon: '🏰' }
];

const COMPANY_SEGMENT_OPTIONS = [
  { value: 'tecnologia', label: 'Tecnologia', icon: '💻' },
  { value: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  { value: 'servicos', label: 'Serviços', icon: '🔧' },
  { value: 'consultoria', label: 'Consultoria', icon: '📊' },
  { value: 'educacao', label: 'Educação', icon: '📚' },
  { value: 'saude', label: 'Saúde', icon: '🏥' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'financeiro', label: 'Financeiro', icon: '💰' },
  { value: 'outros', label: 'Outros', icon: '🔄' }
];

const REVENUE_RANGE_OPTIONS = [
  { value: '0-10k', label: 'Até R$ 10.000/mês', icon: '📈' },
  { value: '10k-50k', label: 'R$ 10.000 - R$ 50.000/mês', icon: '💼' },
  { value: '50k-100k', label: 'R$ 50.000 - R$ 100.000/mês', icon: '🚀' },
  { value: '100k-500k', label: 'R$ 100.000 - R$ 500.000/mês', icon: '💎' },
  { value: '500k+', label: 'Mais de R$ 500.000/mês', icon: '👑' },
  { value: 'preferir-nao-informar', label: 'Prefiro não informar', icon: '🤐' }
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
        message="Agora vou conhecer seu negócio para personalizar as melhores soluções de IA para você!"
      />
      
      <QuickFormStep
        title="Sobre seu negócio"
        description="Conte-nos sobre sua empresa para criarmos recomendações personalizadas"
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
              placeholder="Nome da sua empresa"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Seu cargo/função <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.role}
              onChange={(e) => onUpdate('role', e.target.value)}
              placeholder="CEO, Gerente, Analista..."
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DropdownModerno
            value={data.company_size}
            onChange={(value) => onUpdate('company_size', value)}
            options={COMPANY_SIZE_OPTIONS}
            placeholder="Selecione o tamanho"
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
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Website da empresa (opcional)
          </label>
          <Input
            type="url"
            value={data.company_website || ''}
            onChange={(e) => onUpdate('company_website', e.target.value)}
            placeholder="https://suaempresa.com.br"
            className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
          />
        </div>

        <DropdownModerno
          value={data.annual_revenue_range}
          onChange={(value) => onUpdate('annual_revenue_range', value)}
          options={REVENUE_RANGE_OPTIONS}
          placeholder="Selecione a faixa de faturamento"
          label="Faturamento mensal aproximado"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Principal desafio do negócio <span className="text-red-400">*</span>
          </label>
          <Textarea
            value={data.main_challenge}
            onChange={(e) => onUpdate('main_challenge', e.target.value)}
            placeholder="Descreva o principal desafio que sua empresa enfrenta hoje..."
            className="bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50 min-h-[100px]"
          />
        </div>
      </QuickFormStep>
    </>
  );
};
