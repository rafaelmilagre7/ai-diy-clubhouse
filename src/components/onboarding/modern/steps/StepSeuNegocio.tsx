
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const COMPANY_SIZE_OPTIONS = [
  { value: 'freelancer', label: '👤 Freelancer/Autônomo' },
  { value: '1-5', label: '🏠 1-5 funcionários' },
  { value: '6-20', label: '🏢 6-20 funcionários' },
  { value: '21-50', label: '🏬 21-50 funcionários' },
  { value: '51-200', label: '🏭 51-200 funcionários' },
  { value: '201-1000', label: '🏘️ 201-1000 funcionários' },
  { value: '1000+', label: '🏙️ Mais de 1000 funcionários' }
];

const COMPANY_SEGMENT_OPTIONS = [
  { value: 'tecnologia', label: '💻 Tecnologia' },
  { value: 'servicos', label: '🔧 Serviços' },
  { value: 'comercio', label: '🛍️ Comércio' },
  { value: 'educacao', label: '📚 Educação' },
  { value: 'saude', label: '🏥 Saúde' },
  { value: 'financeiro', label: '💰 Financeiro' },
  { value: 'marketing', label: '📢 Marketing' },
  { value: 'consultoria', label: '💼 Consultoria' },
  { value: 'industria', label: '🏭 Indústria' },
  { value: 'outro', label: '📋 Outro' }
];

const REVENUE_RANGES = [
  { value: 'ate-100k', label: '💰 Até R$ 100 mil/ano' },
  { value: '100k-500k', label: '💸 R$ 100-500 mil/ano' },
  { value: '500k-1M', label: '💵 R$ 500k-1M/ano' },
  { value: '1M-5M', label: '💴 R$ 1-5M/ano' },
  { value: '5M-20M', label: '💶 R$ 5-20M/ano' },
  { value: '20M+', label: '🏦 Mais de R$ 20M/ano' },
  { value: 'nao-divulgar', label: '🔒 Prefiro não divulgar' }
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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Sobre seu negócio 🏢
        </h2>
        <p className="text-gray-400">
          Conte-nos sobre sua empresa e contexto profissional
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Seu cargo/função <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.role || ''}
              onChange={(e) => onUpdate('role', e.target.value)}
              placeholder="Ex: CEO, Diretor, Gerente"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DropdownModerno
            value={data.company_size || ''}
            onChange={(value) => onUpdate('company_size', value)}
            options={COMPANY_SIZE_OPTIONS}
            placeholder="Tamanho da empresa"
            label="Tamanho da empresa"
            required
          />

          <DropdownModerno
            value={data.company_segment || ''}
            onChange={(value) => onUpdate('company_segment', value)}
            options={COMPANY_SEGMENT_OPTIONS}
            placeholder="Segmento"
            label="Segmento/Área"
            required
          />
        </div>

        <DropdownModerno
          value={data.annual_revenue_range || ''}
          onChange={(value) => onUpdate('annual_revenue_range', value)}
          options={REVENUE_RANGES}
          placeholder="Faturamento anual"
          label="Faturamento anual aproximado"
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

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-sm text-purple-400">
            🎯 <strong>Personalização:</strong> Essas informações nos ajudam a personalizar 
            as soluções e conectar você com outros empreendedores do seu segmento.
          </p>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <Button
            onClick={onPrevious}
            variant="ghost"
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
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
