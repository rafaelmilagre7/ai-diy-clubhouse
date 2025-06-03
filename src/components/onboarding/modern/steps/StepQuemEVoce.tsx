
import React from 'react';
import { QuickFormStep } from '../QuickFormStep';
import { WhatsAppInput } from '../WhatsAppInput';
import { DropdownModerno } from '../DropdownModerno';
import { Input } from '@/components/ui/input';
import MilagrinhoAssistant from '../../MilagrinhoAssistant';

interface StepQuemEVoceProps {
  data: {
    name: string;
    email: string;
    whatsapp: string;
    howFoundUs: string;
  };
  onUpdate: (field: string, value: string) => void;
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
  { value: 'indicacao', label: 'Indicação de alguém', icon: '👥' },
  { value: 'outros', label: 'Outros', icon: '💭' }
];

export const StepQuemEVoce: React.FC<StepQuemEVoceProps> = ({
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

        <WhatsAppInput
          value={data.whatsapp}
          onChange={(value) => onUpdate('whatsapp', value)}
          placeholder="(11) 99999-9999"
        />

        <DropdownModerno
          value={data.howFoundUs}
          onChange={(value) => onUpdate('howFoundUs', value)}
          options={HOW_FOUND_OPTIONS}
          placeholder="Selecione uma opção"
          label="Como conheceu o VIVER DE IA?"
          required
        />
      </QuickFormStep>
    </>
  );
};
