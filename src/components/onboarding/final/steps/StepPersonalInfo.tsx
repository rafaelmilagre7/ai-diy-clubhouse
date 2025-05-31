
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';
import { ValidationError } from '../ValidationError';
import { formatWhatsApp } from '@/utils/validationUtils';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const COUNTRY_CODE_OPTIONS = [
  { value: '+55', label: '🇧🇷 Brasil (+55)' },
  { value: '+1', label: '🇺🇸 EUA (+1)' },
  { value: '+351', label: '🇵🇹 Portugal (+351)' },
  { value: '+34', label: '🇪🇸 Espanha (+34)' }
];

export const StepPersonalInfo: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  validationErrors
}) => {
  const handleWhatsAppChange = (value: string) => {
    // Aplicar máscara enquanto o usuário digita
    const formatted = formatWhatsApp(value);
    onUpdate('personal_info', {
      ...data.personal_info,
      whatsapp: formatted
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Vamos nos conhecer melhor! 👋
        </h2>
        <p className="text-gray-400">
          Suas informações pessoais nos ajudam a personalizar sua experiência
        </p>
      </div>

      <div className="space-y-6">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Nome completo <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={data.personal_info.name || ''}
            onChange={(e) => onUpdate('personal_info', {
              ...data.personal_info,
              name: e.target.value
            })}
            placeholder="Seu nome completo"
            className={`h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50 ${
              validationErrors?.name ? 'border-red-400' : ''
            }`}
          />
          <ValidationError message={validationErrors?.name} />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            E-mail <span className="text-red-400">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={data.personal_info.email || ''}
            onChange={(e) => onUpdate('personal_info', {
              ...data.personal_info,
              email: e.target.value
            })}
            placeholder="seu@email.com"
            className={`h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50 ${
              validationErrors?.email ? 'border-red-400' : ''
            }`}
          />
          <ValidationError message={validationErrors?.email} />
        </div>

        {/* País e WhatsApp */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-white">
              País <span className="text-red-400">*</span>
            </Label>
            <Select
              value={data.personal_info.country_code || '+55'}
              onValueChange={(value) => onUpdate('personal_info', {
                ...data.personal_info,
                country_code: value
              })}
            >
              <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {COUNTRY_CODE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="whatsapp" className="text-white">
              WhatsApp <span className="text-red-400">*</span>
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              value={data.personal_info.whatsapp || ''}
              onChange={(e) => handleWhatsAppChange(e.target.value)}
              placeholder="(11) 99999-9999"
              className={`h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50 ${
                validationErrors?.whatsapp ? 'border-red-400' : ''
              }`}
              maxLength={15}
            />
            <ValidationError message={validationErrors?.whatsapp} />
          </div>
        </div>

        {/* Data de Nascimento */}
        <div className="space-y-2">
          <Label htmlFor="birth_date" className="text-white">
            Data de nascimento <span className="text-red-400">*</span>
          </Label>
          <Input
            id="birth_date"
            type="date"
            value={data.personal_info.birth_date || ''}
            onChange={(e) => onUpdate('personal_info', {
              ...data.personal_info,
              birth_date: e.target.value
            })}
            className={`h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50 ${
              validationErrors?.birth_date ? 'border-red-400' : ''
            }`}
            max={new Date(Date.now() - 18*365*24*60*60*1000).toISOString().split('T')[0]}
          />
          <ValidationError message={validationErrors?.birth_date} />
        </div>

        {/* Gênero */}
        <div className="space-y-3">
          <Label className="text-white">
            Gênero <span className="text-red-400">*</span>
          </Label>
          <RadioGroup
            value={data.personal_info.gender || ''}
            onValueChange={(value) => onUpdate('personal_info', {
              ...data.personal_info,
              gender: value as 'masculino' | 'feminino'
            })}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="masculino" id="masculino" className="text-viverblue" />
              <Label htmlFor="masculino" className="text-white cursor-pointer">
                Masculino
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="feminino" id="feminino" className="text-viverblue" />
              <Label htmlFor="feminino" className="text-white cursor-pointer">
                Feminino
              </Label>
            </div>
          </RadioGroup>
          <ValidationError message={validationErrors?.gender} />
        </div>

        {/* Privacidade */}
        <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-4">
          <p className="text-sm text-viverblue-light">
            🔒 <strong>Privacidade:</strong> Seus dados são protegidos e utilizados 
            apenas para personalizar sua experiência na plataforma.
          </p>
        </div>

        {/* Botões de navegação */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <div>
            {onPrevious && (
              <Button
                onClick={onPrevious}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Voltar
              </Button>
            )}
          </div>
          
          <div className="text-sm text-gray-400">
            Etapa 1 de 8
          </div>
          
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="bg-viverblue hover:bg-viverblue-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span>Continuar</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
