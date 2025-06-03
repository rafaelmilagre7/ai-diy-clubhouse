
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone } from 'lucide-react';
import { StepQuemEVoceProps } from '@/types/quickOnboarding';

export const StepQuemEVoce: React.FC<StepQuemEVoceProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Vamos nos conhecer!</h2>
        <p className="text-gray-400">
          Conte-nos um pouco sobre você para personalizar sua experiência
        </p>
      </div>

      <div className="space-y-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white flex items-center gap-2">
            <User className="h-4 w-4 text-viverblue" />
            Nome completo
          </Label>
          <Input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Digite seu nome completo"
            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-viverblue"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white flex items-center gap-2">
            <Mail className="h-4 w-4 text-viverblue" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onUpdate('email', e.target.value)}
            placeholder="seu@email.com"
            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-viverblue"
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="text-white flex items-center gap-2">
            <Phone className="h-4 w-4 text-viverblue" />
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            type="tel"
            value={data.whatsapp}
            onChange={(e) => onUpdate('whatsapp', e.target.value)}
            placeholder="(11) 99999-9999"
            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-viverblue"
          />
        </div>
      </div>

      {/* Botão de Continuar */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-viverblue hover:bg-viverblue/90 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </Button>
      </div>

      {/* Indicador de progresso */}
      <div className="flex justify-center">
        <span className="text-sm text-gray-400">
          Etapa {currentStep} de {totalSteps}
        </span>
      </div>
    </div>
  );
};
