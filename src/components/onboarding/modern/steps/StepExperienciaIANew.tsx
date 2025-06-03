
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
  { value: 'iniciante', label: 'Iniciante - Nunca usei IA no trabalho', icon: '🌱' },
  { value: 'basico', label: 'Básico - Já usei ChatGPT ou similar', icon: '📚' },
  { value: 'intermediario', label: 'Intermediário - Uso algumas ferramentas', icon: '⚡' },
  { value: 'avancado', label: 'Avançado - Tenho experiência sólida', icon: '🚀' },
  { value: 'especialista', label: 'Especialista - Trabalho com IA', icon: '🎯' }
];

const USES_AI_OPTIONS = [
  { value: 'nao', label: 'Não uso IA no trabalho', icon: '❌' },
  { value: 'ocasionalmente', label: 'Uso ocasionalmente', icon: '🔄' },
  { value: 'semanalmente', label: 'Uso semanalmente', icon: '📅' },
  { value: 'diariamente', label: 'Uso diariamente', icon: '⭐' },
  { value: 'constantemente', label: 'Uso constantemente', icon: '🔥' }
];

const MAIN_GOAL_OPTIONS = [
  { value: 'automatizar-processos', label: 'Automatizar processos', icon: '🤖' },
  { value: 'melhorar-atendimento', label: 'Melhorar atendimento ao cliente', icon: '💬' },
  { value: 'aumentar-vendas', label: 'Aumentar vendas', icon: '💰' },
  { value: 'criar-conteudo', label: 'Criar conteúdo', icon: '📝' },
  { value: 'analisar-dados', label: 'Analisar dados', icon: '📊' },
  { value: 'reduzir-custos', label: 'Reduzir custos', icon: '💡' },
  { value: 'inovar-produtos', label: 'Inovar produtos/serviços', icon: '🚀' },
  { value: 'outros', label: 'Outros objetivos', icon: '🎯' }
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
        message="Agora quero entender sua experiência com IA para recomendar as soluções mais adequadas ao seu nível!"
      />
      
      <QuickFormStep
        title="Sua experiência com IA"
        description="Vamos entender seu nível atual e objetivos com inteligência artificial"
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
          label="Com que frequência você usa IA atualmente?"
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

        <div className="bg-viverblue/10 border border-viverblue/30 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="text-white font-medium mb-1">Dica do Milagrinho</h4>
              <p className="text-gray-300 text-sm">
                Com base nas suas respostas, vou criar uma trilha personalizada com soluções 
                de IA que se encaixam perfeitamente no seu negócio e nível de experiência!
              </p>
            </div>
          </div>
        </div>
      </QuickFormStep>
    </>
  );
};
