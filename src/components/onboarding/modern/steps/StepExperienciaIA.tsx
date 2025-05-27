
import React from 'react';
import { QuickFormStep } from '../QuickFormStep';
import { SliderInput } from '../SliderInput';
import { DropdownModerno } from '../DropdownModerno';
import MilagrinhoAssistant from '../../MilagrinhoAssistant';

interface StepExperienciaIAProps {
  data: {
    name: string;
    aiKnowledge: number;
    usesAI: string;
    mainGoal: string;
  };
  onUpdate: (field: string, value: string | number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
}

const USES_AI_OPTIONS = [
  { value: 'sim', label: 'Sim, uso regularmente', icon: '✅' },
  { value: 'pouco', label: 'Uso um pouco', icon: '🔄' },
  { value: 'nao', label: 'Não uso ainda', icon: '❌' }
];

const MAIN_GOAL_OPTIONS = [
  { value: 'tempo', label: 'Economizar tempo', icon: '⏰' },
  { value: 'produtividade', label: 'Aumentar produtividade', icon: '📊' },
  { value: 'automatizar', label: 'Automatizar tarefas', icon: '🤖' },
  { value: 'resultados', label: 'Melhorar resultados', icon: '🎯' },
  { value: 'aprender', label: 'Aprender sobre IA', icon: '🎓' }
];

export const StepExperienciaIA: React.FC<StepExperienciaIAProps> = ({
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
        message="Perfeito! Agora vamos entender sua experiência com IA. Com base nisso, vou recomendar as melhores soluções para seu perfil e necessidades!"
      />
      
      <QuickFormStep
        title="Experiência com IA"
        description="Me conte sobre seu conhecimento e objetivos com Inteligência Artificial"
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={onNext}
        onPrevious={onPrevious}
        canProceed={canProceed}
        showBack={true}
      >
        <SliderInput
          value={data.aiKnowledge}
          onChange={(value) => onUpdate('aiKnowledge', value)}
          label="Qual seu nível de conhecimento em IA?"
          min={0}
          max={10}
        />

        <DropdownModerno
          value={data.usesAI}
          onChange={(value) => onUpdate('usesAI', value)}
          options={USES_AI_OPTIONS}
          placeholder="Selecione uma opção"
          label="Já usa IA no trabalho?"
          required
        />

        <DropdownModerno
          value={data.mainGoal}
          onChange={(value) => onUpdate('mainGoal', value)}
          options={MAIN_GOAL_OPTIONS}
          placeholder="Qual seu principal objetivo?"
          label="Principal objetivo com IA"
          required
        />
      </QuickFormStep>
    </>
  );
};
