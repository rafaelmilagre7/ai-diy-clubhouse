
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StepProps } from '@/types/onboarding';

export const StepLocationInfo: React.FC<StepProps> = ({
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
        <h2 className="text-2xl font-bold text-white">Localização e Contato</h2>
        <p className="text-gray-400">Onde você está localizado?</p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state" className="text-white">Estado</Label>
              <Input
                id="state"
                type="text"
                value={personalInfo.state || ''}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Seu estado"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-white">País</Label>
              <Input
                id="country"
                type="text"
                value={personalInfo.country || ''}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Seu país"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url" className="text-white">LinkedIn</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={personalInfo.linkedin_url || ''}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/seu-perfil"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_number" className="text-white">WhatsApp</Label>
              <Input
                id="whatsapp_number"
                type="tel"
                value={personalInfo.whatsapp_number || ''}
                onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                placeholder="(11) 99999-9999"
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
