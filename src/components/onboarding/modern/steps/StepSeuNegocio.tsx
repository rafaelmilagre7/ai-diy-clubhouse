
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { RealtimeFieldValidation } from '../RealtimeFieldValidation';
import { useRealtimeValidation } from '@/hooks/onboarding/useRealtimeValidation';
import { DropdownModerno } from '../DropdownModerno';

const COMPANY_SIZE_OPTIONS = [
  { value: 'solo', label: '👤 Só eu (Freelancer/Autônomo)' },
  { value: '2-5', label: '👥 2-5 pessoas' },
  { value: '6-15', label: '🏢 6-15 pessoas' },
  { value: '16-50', label: '🏬 16-50 pessoas' },
  { value: '51-200', label: '🏭 51-200 pessoas' },
  { value: '200+', label: '🏢 Mais de 200 pessoas' }
];

const SEGMENT_OPTIONS = [
  { value: 'tecnologia', label: '💻 Tecnologia' },
  { value: 'educacao', label: '📚 Educação' },
  { value: 'saude', label: '🏥 Saúde' },
  { value: 'financeiro', label: '💰 Financeiro' },
  { value: 'varejo', label: '🛍️ Varejo/E-commerce' },
  { value: 'consultoria', label: '🎯 Consultoria' },
  { value: 'marketing', label: '📈 Marketing/Publicidade' },
  { value: 'industria', label: '🏭 Indústria' },
  { value: 'servicos', label: '🔧 Serviços' },
  { value: 'outro', label: '🤔 Outro' }
];

const REVENUE_OPTIONS = [
  { value: 'pre-receita', label: '🌱 Pré-receita (até R$ 0)' },
  { value: '0-10k', label: '💼 R$ 0 - R$ 10k/mês' },
  { value: '10-50k', label: '📈 R$ 10k - R$ 50k/mês' },
  { value: '50-100k', label: '🚀 R$ 50k - R$ 100k/mês' },
  { value: '100-500k', label: '💎 R$ 100k - R$ 500k/mês' },
  { value: '500k+', label: '🏆 Mais de R$ 500k/mês' }
];

export const StepSeuNegocio: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const { getFieldValidation } = useRealtimeValidation(data, currentStep);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Sobre seu negócio 🏢
        </h2>
        <p className="text-gray-400">
          Vamos conhecer melhor sua empresa e posição
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Nome da empresa <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={data.company_name || ''}
            onChange={(e) => onUpdate('company_name', e.target.value)}
            placeholder="Nome da sua empresa"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
          <RealtimeFieldValidation validation={getFieldValidation('company_name')} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Seu cargo/posição <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={data.role || ''}
            onChange={(e) => onUpdate('role', e.target.value)}
            placeholder="CEO, Gerente, Analista, etc."
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
          <RealtimeFieldValidation validation={getFieldValidation('role')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DropdownModerno
            value={data.company_size || ''}
            onChange={(value) => onUpdate('company_size', value)}
            options={COMPANY_SIZE_OPTIONS}
            placeholder="Selecione o tamanho"
            label="Tamanho da empresa"
            required
          />

          <DropdownModerno
            value={data.company_segment || ''}
            onChange={(value) => onUpdate('company_segment', value)}
            options={SEGMENT_OPTIONS}
            placeholder="Selecione o segmento"
            label="Segmento de atuação"
            required
          />
        </div>

        <DropdownModerno
          value={data.annual_revenue_range || ''}
          onChange={(value) => onUpdate('annual_revenue_range', value)}
          options={REVENUE_OPTIONS}
          placeholder="Selecione a faixa de faturamento"
          label="Faturamento mensal aproximado"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Website da empresa <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <Input
            type="url"
            value={data.company_website || ''}
            onChange={(e) => onUpdate('company_website', e.target.value)}
            placeholder="https://suaempresa.com.br"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <div></div>
          
          <div className="text-sm text-gray-400">
            Etapa {currentStep} de {totalSteps}
          </div>
          
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="bg-viverblue hover:bg-viverblue-dark transition-colors flex items-center gap-2"
          >
            <span>Continuar</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
