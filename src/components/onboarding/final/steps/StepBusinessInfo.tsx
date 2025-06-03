
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepProps } from '@/types/onboarding';

export const StepBusinessInfo: React.FC<StepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const businessInfo = data.business_info || {};

  const handleInputChange = (field: string, value: string) => {
    onUpdate('business_info', {
      ...businessInfo,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Dados Profissionais</h2>
        <p className="text-gray-400">Conte-nos sobre sua empresa e posição</p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-white">Nome da Empresa *</Label>
              <Input
                id="company_name"
                type="text"
                value={businessInfo.company_name || ''}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Nome da sua empresa"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_position" className="text-white">Cargo Atual *</Label>
              <Input
                id="current_position"
                type="text"
                value={businessInfo.current_position || ''}
                onChange={(e) => handleInputChange('current_position', e.target.value)}
                placeholder="CEO, Diretor, etc."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_website" className="text-white">Site da Empresa</Label>
              <Input
                id="company_website"
                type="url"
                value={businessInfo.company_website || ''}
                onChange={(e) => handleInputChange('company_website', e.target.value)}
                placeholder="https://suaempresa.com"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_sector" className="text-white">Setor da Empresa</Label>
              <Select value={businessInfo.company_sector || ''} onValueChange={(value) => handleInputChange('company_sector', value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="educacao">Educação</SelectItem>
                  <SelectItem value="varejo">Varejo</SelectItem>
                  <SelectItem value="servicos">Serviços</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="manufatura">Manufatura</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {onPrevious && (
          <Button
            onClick={onPrevious}
            variant="outline"
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Anterior
          </Button>
        )}
        
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="ml-auto bg-viverblue hover:bg-viverblue/90 text-white"
        >
          {currentStep === totalSteps ? 'Finalizar' : 'Próximo'}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-400">
        Etapa {currentStep} de {totalSteps}
      </div>
    </div>
  );
};
