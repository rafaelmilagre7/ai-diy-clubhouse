
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

const COMPANY_SIZES = [
  'Apenas eu (freelancer/consultor)',
  '2-10 funcionários',
  '11-50 funcionários',
  '51-200 funcionários',
  '201-1000 funcionários',
  'Mais de 1000 funcionários'
];

const SECTORS = [
  'Tecnologia',
  'E-commerce',
  'Saúde',
  'Educação',
  'Financeiro',
  'Marketing',
  'Consultoria',
  'Manufatura',
  'Varejo',
  'Serviços',
  'Outros'
];

const REVENUES = [
  'Até R$ 100 mil/ano',
  'R$ 100 mil - R$ 500 mil/ano',
  'R$ 500 mil - R$ 2 milhões/ano',
  'R$ 2 milhões - R$ 10 milhões/ano',
  'Mais de R$ 10 milhões/ano',
  'Prefiro não informar'
];

export const StepBusinessInfo: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed
}) => {
  const { business_info } = data;

  const handleUpdate = (field: string, value: string) => {
    onUpdate('business_info', {
      ...business_info,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Nome da empresa <span className="text-red-400">*</span>
        </label>
        <Input
          type="text"
          value={business_info.company_name || ''}
          onChange={(e) => handleUpdate('company_name', e.target.value)}
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
          value={business_info.role || ''}
          onChange={(e) => handleUpdate('role', e.target.value)}
          placeholder="Ex: CEO, Diretor, Gerente..."
          className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Tamanho da empresa <span className="text-red-400">*</span>
        </label>
        <select
          value={business_info.company_size || ''}
          onChange={(e) => handleUpdate('company_size', e.target.value)}
          className="h-12 w-full px-3 bg-gray-800/50 border border-gray-600 text-white rounded-md focus:ring-viverblue/50"
        >
          <option value="">Selecione o tamanho</option>
          {COMPANY_SIZES.map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Setor da empresa <span className="text-red-400">*</span>
        </label>
        <select
          value={business_info.company_sector || ''}
          onChange={(e) => handleUpdate('company_sector', e.target.value)}
          className="h-12 w-full px-3 bg-gray-800/50 border border-gray-600 text-white rounded-md focus:ring-viverblue/50"
        >
          <option value="">Selecione o setor</option>
          {SECTORS.map(sector => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Website da empresa
        </label>
        <Input
          type="url"
          value={business_info.company_website || ''}
          onChange={(e) => handleUpdate('company_website', e.target.value)}
          placeholder="https://suaempresa.com"
          className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Faturamento anual <span className="text-red-400">*</span>
        </label>
        <select
          value={business_info.annual_revenue || ''}
          onChange={(e) => handleUpdate('annual_revenue', e.target.value)}
          className="h-12 w-full px-3 bg-gray-800/50 border border-gray-600 text-white rounded-md focus:ring-viverblue/50"
        >
          <option value="">Selecione a faixa</option>
          {REVENUES.map(revenue => (
            <option key={revenue} value={revenue}>
              {revenue}
            </option>
          ))}
        </select>
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
        
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-viverblue hover:bg-viverblue-dark transition-colors flex items-center gap-2 px-8"
        >
          <span>Continuar</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};
