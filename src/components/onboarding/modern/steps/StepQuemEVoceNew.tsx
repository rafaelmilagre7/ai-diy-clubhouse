
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { ConditionalReferralInput } from '../ConditionalReferralInput';
import { DateInput } from '../DateInput';
import { WhatsAppInput } from '../WhatsAppInput';
import { SocialLinksInput } from '../SocialLinksInput';
import { CountrySelector } from '../CountrySelector';
import { AutoSaveFeedback } from '../AutoSaveFeedback';

interface StepQuemEVoceNewProps {
  data: QuickOnboardingData;
  onUpdate: (field: keyof QuickOnboardingData, value: string) => void;
  onNext: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
}

const HOW_FOUND_OPTIONS = [
  { value: 'google', label: 'Google' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indicacao', label: 'Indicação de alguém' },
  { value: 'evento', label: 'Evento' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'outro', label: 'Outro' }
];

export const StepQuemEVoceNew: React.FC<StepQuemEVoceNewProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Quem é você? 👋
        </h2>
        <p className="text-gray-400">
          Vamos começar conhecendo você melhor
        </p>
        <div className="flex items-center justify-center mt-4">
          <AutoSaveFeedback 
            isSaving={false}
            lastSaveTime={Date.now()}
            hasUnsavedChanges={!data.name || !data.email}
          />
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Nome completo <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              placeholder="Seu nome completo"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              E-mail <span className="text-red-400">*</span>
            </label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => onUpdate('email', e.target.value)}
              placeholder="seu@email.com"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CountrySelector
            value={data.country_code}
            onChange={(value) => onUpdate('country_code', value)}
            required
          />
          
          <WhatsAppInput
            value={data.whatsapp}
            onChange={(value) => onUpdate('whatsapp', value)}
            required
          />
        </div>

        <DateInput
          value={data.birth_date || ''}
          onChange={(value) => onUpdate('birth_date', value)}
        />

        <SocialLinksInput
          instagramValue={data.instagram_url || ''}
          linkedinValue={data.linkedin_url || ''}
          onInstagramChange={(value) => onUpdate('instagram_url', value)}
          onLinkedinChange={(value) => onUpdate('linkedin_url', value)}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Como conheceu o VIVER DE IA? <span className="text-red-400">*</span>
          </label>
          <Select value={data.how_found_us} onValueChange={(value) => onUpdate('how_found_us', value)}>
            <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
              <SelectValue placeholder="Selecione como nos conheceu" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {HOW_FOUND_OPTIONS.map((option) => (
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

        <ConditionalReferralInput
          howFoundUs={data.how_found_us}
          referredBy={data.referred_by || ''}
          onReferredByChange={(value) => onUpdate('referred_by', value)}
        />

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
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
