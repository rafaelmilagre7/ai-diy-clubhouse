
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
  { value: 'iniciante', label: 'Iniciante - Pouco ou nenhum conhecimento', icon: '🌱' },
  { value: 'basico', label: 'Básico - Já usei algumas ferramentas', icon: '📚' },
  { value: 'intermediario', label: 'Intermediário - Uso regularmente', icon: '⚡' },
  { value: 'avancado', label: 'Avançado - Implemento soluções', icon: '🚀' },
  { value: 'especialista', label: 'Especialista - Desenvolvo IA', icon: '🧠' }
];

const USES_AI_OPTIONS = [
  { value: 'nunca', label: 'Nunca usei IA no trabalho', icon: '❌' },
  { value: 'raramente', label: 'Raramente (menos de 1x/semana)', icon: '🔸' },
  { value: 'ocasionalmente', label: 'Ocasionalmente (1-3x/semana)', icon: '🔹' },
  { value: 'frequentemente', label: 'Frequentemente (4-6x/semana)', icon: '⭐' },
  { value: 'diariamente', label: 'Diariamente', icon: '🔥' }
];

const MAIN_GOAL_OPTIONS = [
  { value: 'reduzir-custos', label: 'Reduzir custos operacionais', icon: '💰' },
  { value: 'aumentar-receita', label: 'Aumentar receita', icon: '📈' },
  { value: 'automatizar-processos', label: 'Automatizar processos', icon: '🤖' },
  { value: 'melhorar-produtividade', label: 'Melhorar produtividade', icon: '⚡' },
  { value: 'inovar-produtos', label: 'Inovar produtos/serviços', icon: '💡' },
  { value: 'melhorar-experiencia', label: 'Melhorar experiência do cliente', icon: '😊' },
  { value: 'tomar-decisoes', label: 'Tomar decisões baseadas em dados', icon: '📊' },
  { value: 'competitividade', label: 'Manter competitividade', icon: '🎯' }
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
        message="Agora me conte sobre sua experiência com IA para eu criar a trilha perfeita para você!"
      />
      
      <QuickFormStep
        title="Sua experiência com IA"
        description="Conte-nos sobre seu nível de conhecimento e objetivos com inteligência artificial"
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
          placeholder="Selecione a frequência"
          label="Com que frequência você usa IA no trabalho?"
          required
        />

        <DropdownModerno
          value={data.main_goal}
          onChange={(value) => onUpdate('main_goal', value)}
          options={MAIN_GOAL_OPTIONS}
          placeholder="Selecione seu principal objetivo"
          label="Qual seu principal objetivo com IA?"
          required
        />
      </QuickFormStep>
    </>
  );
};
