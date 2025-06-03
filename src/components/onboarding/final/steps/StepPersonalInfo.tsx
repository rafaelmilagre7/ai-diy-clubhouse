
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StepProps } from '@/types/onboarding';

export const StepPersonalInfo: React.FC<StepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const personalInfo = data.personal_info || {};

  const handleInputChange = (field: string, value: string) => {
    onUpdate('personal_info', {
      ...personalInfo,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Informações Pessoais</h2>
        <p className="text-gray-400">Vamos começar com suas informações básicas</p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nome completo *</Label>
              <Input
                id="name"
                type="text"
                value={personalInfo.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome completo"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={personalInfo.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={personalInfo.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-white">Cidade</Label>
              <Input
                id="city"
                type="text"
                value={personalInfo.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Sua cidade"
                className="bg-gray-700 border-gray-600 text-white"
              />
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
