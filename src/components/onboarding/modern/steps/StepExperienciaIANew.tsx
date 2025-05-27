
import React from 'react';
import { QuickFormStep } from '../QuickFormStep';
import { DropdownModerno } from '../DropdownModerno';
import MilagrinhoAssistant from '../../MilagrinhoAssistant';
import { QuickOnboardingData } from '@/types/quickOnboarding';

interface StepExperienciaIANewProps {
  data: QuickOnboardingData;
  onUpdate: (field: keyof QuickOnboardingData, value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
}

const AI_KNOWLEDGE_OPTIONS = [
  { value: 'iniciante', label: 'Iniciante - Nunca usei IA', icon: '🌱' },
  { value: 'basico', label: 'Básico - Uso ocasionalmente', icon: '📚' },
  { value: 'intermediario', label: 'Intermediário - Uso regularmente', icon: '⚡' },
  { value: 'avancado', label: 'Avançado - Domino várias ferramentas', icon: '🚀' },
  { value: 'expert', label: 'Expert - Desenvolvo soluções IA', icon: '🎯' }
];

const USES_AI_OPTIONS = [
  { value: 'sim', label: 'Sim, uso regularmente', icon: '✅' },
  { value: 'pouco', label: 'Uso um pouco', icon: '🔄' },
  { value: 'nao', label: 'Não uso ainda', icon: '❌' }
];

const MAIN_GOAL_OPTIONS = [
  { value: 'receita', label: 'Aumentar receita', icon: '💰' },
  { value: 'custos', label: 'Reduzir custos', icon: '📉' },
  { value: 'tempo', label: 'Economizar tempo', icon: '⏰' },
  { value: 'produtividade', label: 'Aumentar produtividade', icon: '📊' },
  { value: 'automatizar', label: 'Automatizar tarefas', icon: '🤖' },
  { value: 'resultados', label: 'Melhorar resultados', icon: '🎯' },
  { value: 'aprender', label: 'Aprender sobre IA', icon: '🎓' }
];

export const StepExperienciaIANew: React.FC<StepExperienciaIANewProps> = ({
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
        <DropdownModerno
          value={data.ai_knowledge_level}
          onChange={(value) => onUpdate('ai_knowledge_level', value)}
          options={AI_KNOWLEDGE_OPTIONS}
          placeholder="Selecione seu nível"
          label="Qual seu nível de conhecimento em IA?"
          required
        />

        <DropdownModerno
          value={data.uses_ai}
          onChange={(value) => onUpdate('uses_ai', value)}
          options={USES_AI_OPTIONS}
          placeholder="Selecione uma opção"
          label="Já usa IA no trabalho?"
          required
        />

        <DropdownModerno
          value={data.main_goal}
          onChange={(value) => onUpdate('main_goal', value)}
          options={MAIN_GOAL_OPTIONS}
          placeholder="Qual seu principal objetivo?"
          label="Principal objetivo com IA"
          required
        />
      </QuickFormStep>
    </>
  );
};
