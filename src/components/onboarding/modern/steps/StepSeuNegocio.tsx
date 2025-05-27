
import React from 'react';
import { QuickFormStep } from '../QuickFormStep';
import { DropdownModerno } from '../DropdownModerno';
import { Input } from '@/components/ui/input';
import MilagrinhoAssistant from '../../MilagrinhoAssistant';

interface StepSeuNegocioProps {
  data: {
    name: string;
    companyName: string;
    role: string;
    companySize: string;
    mainChallenge: string;
  };
  onUpdate: (field: string, value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
}

const COMPANY_SIZE_OPTIONS = [
  { value: 'solo', label: 'Trabalho sozinho(a)', icon: '👤' },
  { value: '2-10', label: '2 a 10 funcionários', icon: '👥' },
  { value: '11-50', label: '11 a 50 funcionários', icon: '🏢' },
  { value: '51-200', label: '51 a 200 funcionários', icon: '🏬' },
  { value: '200+', label: 'Mais de 200 funcionários', icon: '🏭' }
];

const MAIN_CHALLENGE_OPTIONS = [
  { value: 'automatizar', label: 'Automatizar processos', icon: '⚙️' },
  { value: 'vendas', label: 'Aumentar vendas', icon: '📈' },
  { value: 'custos', label: 'Reduzir custos', icon: '💰' },
  { value: 'atendimento', label: 'Melhorar atendimento', icon: '💬' },
  { value: 'conteudo', label: 'Criar conteúdo', icon: '✍️' },
  { value: 'produtividade', label: 'Aumentar produtividade', icon: '🚀' },
  { value: 'outros', label: 'Outros desafios', icon: '💭' }
];

export const StepSeuNegocio: React.FC<StepSeuNegocioProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const firstName = data.name.split(' ')[0];

  return (
    <>
      <MilagrinhoAssistant
        userName={firstName}
        message="Agora me conte sobre sua empresa! Essas informações me ajudarão a entender melhor seu contexto de negócio para criar recomendações mais precisas."
      />
      
      <QuickFormStep
        title="Seu Negócio"
        description="Vamos entender melhor sua empresa e desafios"
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={onNext}
        onPrevious={onPrevious}
        canProceed={canProceed}
        showBack={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Nome da empresa <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.companyName}
              onChange={(e) => onUpdate('companyName', e.target.value)}
              placeholder="Sua empresa"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Seu cargo <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.role}
              onChange={(e) => onUpdate('role', e.target.value)}
              placeholder="Ex: CEO, Gerente, Analista"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>
        </div>

        <DropdownModerno
          value={data.companySize}
          onChange={(value) => onUpdate('companySize', value)}
          options={COMPANY_SIZE_OPTIONS}
          placeholder="Selecione o tamanho da empresa"
          label="Tamanho da empresa"
          required
        />

        <DropdownModerno
          value={data.mainChallenge}
          onChange={(value) => onUpdate('mainChallenge', value)}
          options={MAIN_CHALLENGE_OPTIONS}
          placeholder="Qual seu principal desafio atual?"
          label="Principal desafio"
          required
        />
      </QuickFormStep>
    </>
  );
};
