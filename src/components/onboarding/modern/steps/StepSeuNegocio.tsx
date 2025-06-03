
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const COMPANY_SIZE_OPTIONS = [
  { value: 'freelancer', label: '👤 Freelancer/Autônomo' },
  { value: 'micro', label: '🏪 Microempresa (1-9 funcionários)' },
  { value: 'pequena', label: '🏢 Pequena empresa (10-49 funcionários)' },
  { value: 'media', label: '🏭 Média empresa (50-249 funcionários)' },
  { value: 'grande', label: '🏗️ Grande empresa (250+ funcionários)' }
];

const COMPANY_SEGMENT_OPTIONS = [
  { value: 'tecnologia', label: '💻 Tecnologia' },
  { value: 'saude', label: '🏥 Saúde' },
  { value: 'educacao', label: '📚 Educação' },
  { value: 'financeiro', label: '💰 Financeiro' },
  { value: 'varejo', label: '🛒 Varejo' },
  { value: 'servicos', label: '🔧 Serviços' },
  { value: 'industria', label: '🏭 Indústria' },
  { value: 'consultoria', label: '💼 Consultoria' },
  { value: 'marketing', label: '📊 Marketing' },
  { value: 'outro', label: '🔄 Outro' }
];

const ANNUAL_REVENUE_OPTIONS = [
  { value: 'ate_50k', label: '💰 Até R$ 50 mil' },
  { value: '50k_100k', label: '💰 R$ 50 mil - R$ 100 mil' },
  { value: '100k_500k', label: '💰 R$ 100 mil - R$ 500 mil' },
  { value: '500k_1m', label: '💰 R$ 500 mil - R$ 1 milhão' },
  { value: '1m_5m', label: '💰 R$ 1 milhão - R$ 5 milhões' },
  { value: 'acima_5m', label: '💰 Acima de R$ 5 milhões' },
  { value: 'nao_informar', label: '🤐 Prefiro não informar' }
];

export const StepSeuNegocio: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Sobre seu negócio 🏢
        </h2>
        <p className="text-gray-400">
          Vamos conhecer melhor sua empresa e área de atuação
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
            placeholder="Digite o nome da sua empresa"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Seu cargo/função <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={data.role || ''}
            onChange={(e) => onUpdate('role', e.target.value)}
            placeholder="Ex: CEO, Gerente de Marketing, Desenvolvedor"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <DropdownModerno
          value={data.company_size || ''}
          onChange={(value) => onUpdate('company_size', value)}
          options={COMPANY_SIZE_OPTIONS}
          placeholder="Selecione o tamanho da empresa"
          label="Tamanho da empresa"
          required
        />

        <DropdownModerno
          value={data.company_segment || ''}
          onChange={(value) => onUpdate('company_segment', value)}
          options={COMPANY_SEGMENT_OPTIONS}
          placeholder="Selecione o segmento"
          label="Segmento de atuação"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Website da empresa (opcional)
          </label>
          <Input
            type="url"
            value={data.company_website || ''}
            onChange={(e) => onUpdate('company_website', e.target.value)}
            placeholder="https://suaempresa.com.br"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <DropdownModerno
          value={data.annual_revenue_range || ''}
          onChange={(value) => onUpdate('annual_revenue_range', value)}
          options={ANNUAL_REVENUE_OPTIONS}
          placeholder="Selecione a faixa de faturamento"
          label="Faturamento anual (opcional)"
        />

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            🔒 <strong>Privacidade:</strong> Todas as informações são confidenciais 
            e usadas apenas para personalizar sua experiência.
          </p>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <Button
            onClick={onPrevious}
            variant="ghost"
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Anterior</span>
          </Button>
          
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
