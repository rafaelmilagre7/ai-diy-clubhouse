
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const COMPANY_SIZE_OPTIONS = [
  { value: 'solo', label: 'Apenas eu (Solo)' },
  { value: '2-5', label: '2-5 funcionários' },
  { value: '6-20', label: '6-20 funcionários' },
  { value: '21-50', label: '21-50 funcionários' },
  { value: '51-200', label: '51-200 funcionários' },
  { value: '200+', label: '200+ funcionários' }
];

const COMPANY_SEGMENT_OPTIONS = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'educacao', label: 'Educação' },
  { value: 'saude', label: 'Saúde' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'industria', label: 'Indústria' },
  { value: 'outros', label: 'Outros' }
];

export const StepSeuNegocioNew: React.FC<OnboardingStepProps> = ({
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
          Conte-nos sobre sua empresa para criarmos recomendações personalizadas
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Nome da empresa <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.company_name || ''}
              onChange={(e) => onUpdate('company_name', e.target.value)}
              placeholder="Nome da sua empresa"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Seu cargo <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.role || ''}
              onChange={(e) => onUpdate('role', e.target.value)}
              placeholder="Seu cargo na empresa"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Tamanho da empresa <span className="text-red-400">*</span>
            </label>
            <Select value={data.company_size || ''} onValueChange={(value) => onUpdate('company_size', value)}>
              <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {COMPANY_SIZE_OPTIONS.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-white hover:bg-gray-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Segmento da empresa <span className="text-red-400">*</span>
            </label>
            <Select value={data.company_segment || ''} onValueChange={(value) => onUpdate('company_segment', value)}>
              <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
                <SelectValue placeholder="Selecione o segmento" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {COMPANY_SEGMENT_OPTIONS.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-white hover:bg-gray-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
