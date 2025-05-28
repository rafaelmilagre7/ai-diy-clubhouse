
import React from 'react';
import { QuickFormStep } from '../QuickFormStep';
import { WhatsAppInput } from '../WhatsAppInput';
import { DropdownModerno } from '../DropdownModerno';
import { CountrySelector } from '../CountrySelector';
import { DateInput } from '../DateInput';
import { SocialLinksInput } from '../SocialLinksInput';
import { ConditionalReferralInput } from '../ConditionalReferralInput';
import { Input } from '@/components/ui/input';
import MilagrinhoAssistant from '../../MilagrinhoAssistant';
import { QuickOnboardingData } from '@/types/quickOnboarding';

interface StepQuemEVoceNewProps {
  data: QuickOnboardingData;
  onUpdate: (field: keyof QuickOnboardingData, value: string) => void;
  onNext: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
}

const HOW_FOUND_OPTIONS = [
  { value: 'google', label: 'Pesquisa no Google', icon: '🔍' },
  { value: 'instagram', label: 'Instagram', icon: '📱' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'eventos', label: 'Eventos', icon: '🎫' },
  { value: 'indicacao', label: 'Indicação de alguém', icon: '👥' },
  { value: 'outros', label: 'Outros', icon: '💭' }
];

export const StepQuemEVoceNew: React.FC<StepQuemEVoceNewProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const firstName = data.name.split(' ')[0];

  return (
    <>
      <MilagrinhoAssistant
        userName={firstName || undefined}
        message="Olá! Eu sou o Milagrinho, seu assistente de IA. Vamos começar conhecendo você melhor para criar uma experiência personalizada no VIVER DE IA Club!"
      />
      
      <QuickFormStep
        title="Quem é você?"
        description="Vamos começar com suas informações básicas"
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={onNext}
        canProceed={canProceed}
        showBack={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Nome completo <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              placeholder="Seu nome"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Email <span className="text-red-400">*</span>
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
            placeholder="(11) 99999-9999"
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

        <DropdownModerno
          value={data.how_found_us}
          onChange={(value) => onUpdate('how_found_us', value)}
          options={HOW_FOUND_OPTIONS}
          placeholder="Selecione uma opção"
          label="Como conheceu o VIVER DE IA?"
          required
        />

        <ConditionalReferralInput
          howFoundUs={data.how_found_us}
          referredBy={data.referred_by || ''}
          onReferredByChange={(value) => onUpdate('referred_by', value)}
        />
      </QuickFormStep>
    </>
  );
};
