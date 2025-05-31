
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, User, Mail, Phone } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';
import { validateBrazilianWhatsApp, formatWhatsApp, cleanWhatsApp } from '@/utils/validationUtils';

export const StepPersonalInfo: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const [whatsappError, setWhatsappError] = useState<string>('');
  const [formattedWhatsapp, setFormattedWhatsapp] = useState('');

  useEffect(() => {
    if (data.personal_info.whatsapp) {
      setFormattedWhatsapp(formatWhatsApp(data.personal_info.whatsapp));
    }
  }, [data.personal_info.whatsapp]);

  const handleWhatsAppChange = (value: string) => {
    const formatted = formatWhatsApp(value);
    const cleaned = cleanWhatsApp(value);
    
    setFormattedWhatsapp(formatted);
    
    if (cleaned && !validateBrazilianWhatsApp(cleaned)) {
      setWhatsappError('Digite um número de WhatsApp válido (11 dígitos com DDD)');
    } else {
      setWhatsappError('');
    }
    
    onUpdate('personal_info', {
      ...data.personal_info,
      whatsapp: cleaned
    });
  };

  const isFormValid = () => {
    return data.personal_info.name && 
           data.personal_info.email && 
           data.personal_info.whatsapp && 
           !whatsappError;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Vamos nos conhecer melhor!
        </h2>
        <p className="text-gray-300">
          Precisamos de algumas informações básicas para personalizar sua experiência.
        </p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-viverblue" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Nome Completo *</Label>
            <Input
              id="name"
              value={data.personal_info.name || ''}
              onChange={(e) => onUpdate('personal_info', {
                ...data.personal_info,
                name: e.target.value
              })}
              placeholder="Digite seu nome completo"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-white">E-mail *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={data.personal_info.email || ''}
                onChange={(e) => onUpdate('personal_info', {
                  ...data.personal_info,
                  email: e.target.value
                })}
                placeholder="seu@email.com"
                className="bg-gray-700 border-gray-600 text-white pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="whatsapp" className="text-white">WhatsApp *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="whatsapp"
                value={formattedWhatsapp}
                onChange={(e) => handleWhatsAppChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className={`bg-gray-700 border-gray-600 text-white pl-10 ${
                  whatsappError ? 'border-red-500' : ''
                }`}
                maxLength={15}
              />
            </div>
            {whatsappError && (
              <p className="text-red-400 text-sm mt-1">{whatsappError}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              Digite apenas números com DDD. Ex: 11999999999
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
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
