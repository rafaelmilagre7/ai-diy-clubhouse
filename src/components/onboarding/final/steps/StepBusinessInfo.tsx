
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Building } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

export const StepBusinessInfo: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const companySizeOptions = [
    'Apenas eu (Solo)',
    '2-5 funcionários',
    '6-10 funcionários', 
    '11-50 funcionários',
    '51-100 funcionários',
    '101-500 funcionários',
    '501-1000 funcionários',
    'Mais de 1000 funcionários'
  ];

  const sectorOptions = [
    'Inteligência Artificial',
    'Tecnologia da Informação',
    'E-commerce',
    'Marketing Digital',
    'Educação',
    'Saúde',
    'Consultoria',
    'Serviços Financeiros',
    'Varejo',
    'Manufatura/Indústria',
    'Agronegócio',
    'Imobiliário',
    'Alimentação',
    'Turismo e Hospitalidade',
    'Logística e Transporte',
    'Construção Civil',
    'Energia',
    'Jurídico',
    'Mídia e Entretenimento',
    'ONGs e Organizações Sociais',
    'Governo/Setor Público',
    'Outro'
  ];

  const revenueOptions = [
    'Até R$ 100 mil/ano',
    'R$ 100 mil - R$ 500 mil/ano',
    'R$ 500 mil - R$ 1 milhão/ano',
    'R$ 1 milhão - R$ 5 milhões/ano',
    'R$ 5 milhões - R$ 10 milhões/ano',
    'R$ 10 milhões - R$ 50 milhões/ano',
    'R$ 50 milhões - R$ 100 milhões/ano',
    'Mais de R$ 100 milhões/ano',
    'Prefiro não informar'
  ];

  const isFormValid = () => {
    return data.business_info.company_name && 
           data.business_info.company_size && 
           data.business_info.company_sector;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Sobre sua empresa
        </h2>
        <p className="text-gray-300">
          Vamos conhecer melhor seu negócio para personalizar as recomendações.
        </p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Building className="h-5 w-5 text-viverblue" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company_name" className="text-white">Nome da Empresa *</Label>
            <Input
              id="company_name"
              value={data.business_info.company_name || ''}
              onChange={(e) => onUpdate('business_info', {
                ...data.business_info,
                company_name: e.target.value
              })}
              placeholder="Digite o nome da sua empresa"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-white">Seu Cargo/Função</Label>
            <Input
              id="role"
              value={data.business_info.role || ''}
              onChange={(e) => onUpdate('business_info', {
                ...data.business_info,
                role: e.target.value
              })}
              placeholder="Ex: CEO, Diretor, Gerente..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="company_size" className="text-white">Tamanho da Empresa *</Label>
            <Select 
              value={data.business_info.company_size || ''} 
              onValueChange={(value) => onUpdate('business_info', {
                ...data.business_info,
                company_size: value
              })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione o tamanho da empresa" />
              </SelectTrigger>
              <SelectContent>
                {companySizeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="company_sector" className="text-white">Setor de Atuação *</Label>
            <Select 
              value={data.business_info.company_sector || ''} 
              onValueChange={(value) => onUpdate('business_info', {
                ...data.business_info,
                company_sector: value
              })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione o setor de atuação" />
              </SelectTrigger>
              <SelectContent>
                {sectorOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="company_website" className="text-white">Site da Empresa</Label>
            <Input
              id="company_website"
              value={data.business_info.company_website || ''}
              onChange={(e) => onUpdate('business_info', {
                ...data.business_info,
                company_website: e.target.value
              })}
              placeholder="https://www.suaempresa.com.br"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="annual_revenue" className="text-white">Faturamento Anual</Label>
            <Select 
              value={data.business_info.annual_revenue || ''} 
              onValueChange={(value) => onUpdate('business_info', {
                ...data.business_info,
                annual_revenue: value
              })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione a faixa de faturamento" />
              </SelectTrigger>
              <SelectContent>
                {revenueOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!isFormValid()}
          className="bg-viverblue hover:bg-viverblue/90"
        >
          Próxima Etapa
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="text-center text-sm text-gray-400">
        Etapa {currentStep} de {totalSteps}
      </div>
    </div>
  );
};
