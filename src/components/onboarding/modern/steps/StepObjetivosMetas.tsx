
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { RealtimeFieldValidation } from '../RealtimeFieldValidation';
import { useRealtimeValidation } from '@/hooks/onboarding/useRealtimeValidation';
import { DropdownModerno } from '../DropdownModerno';

const PRIMARY_GOAL_OPTIONS = [
  { value: 'automatizar_processos', label: '🤖 Automatizar processos operacionais' },
  { value: 'melhorar_atendimento', label: '🎯 Melhorar atendimento ao cliente' },
  { value: 'otimizar_vendas', label: '💰 Otimizar processo de vendas' },
  { value: 'analisar_dados', label: '📊 Melhorar análise de dados' },
  { value: 'reduzir_custos', label: '💸 Reduzir custos operacionais' },
  { value: 'aumentar_produtividade', label: '⚡ Aumentar produtividade da equipe' },
  { value: 'personalizar_experiencia', label: '🎨 Personalizar experiência do usuário' },
  { value: 'inovar_produtos', label: '🚀 Inovar produtos/serviços' },
  { value: 'competir_mercado', label: '🏆 Manter competitividade no mercado' },
  { value: 'outro', label: '🤔 Outro objetivo' }
];

const EXPECTED_OUTCOMES_OPTIONS = [
  'Redução de tempo em tarefas repetitivas',
  'Aumento na satisfação do cliente',
  'Melhoria na qualidade das decisões',
  'Crescimento na receita',
  'Redução de erros humanos',
  'Melhor insights sobre dados',
  'Processos mais eficientes',
  'Diferenciação no mercado',
  'Escalabilidade do negócio',
  'ROI positivo em até 6 meses'
];

const OUTCOME_30DAYS_OPTIONS = [
  { value: 'processo_mapeado', label: '📋 Ter processo de IA mapeado' },
  { value: 'equipe_capacitada', label: '👥 Equipe capacitada em IA' },
  { value: 'ferramenta_implementada', label: '🛠️ Primeira ferramenta implementada' },
  { value: 'piloto_funcionando', label: '🧪 Projeto piloto funcionando' },
  { value: 'estrategia_definida', label: '🎯 Estratégia de IA definida' },
  { value: 'roi_calculado', label: '📈 ROI dos projetos calculado' }
];

export const StepObjetivosMetas: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const { getFieldValidation } = useRealtimeValidation(data, currentStep);

  const handleOutcomeToggle = (outcome: string) => {
    const currentOutcomes = data.expected_outcomes || [];
    const isSelected = currentOutcomes.includes(outcome);
    
    if (isSelected) {
      onUpdate('expected_outcomes', currentOutcomes.filter(o => o !== outcome));
    } else {
      onUpdate('expected_outcomes', [...currentOutcomes, outcome]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Objetivos e metas 🎯
        </h2>
        <p className="text-gray-400">
          Vamos definir seus objetivos com IA
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.primary_goal || ''}
          onChange={(value) => onUpdate('primary_goal', value)}
          options={PRIMARY_GOAL_OPTIONS}
          placeholder="Selecione seu principal objetivo"
          label="Qual seu principal objetivo com IA?"
          required
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Resultados esperados <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Selecione os resultados que espera alcançar (múltipla escolha)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXPECTED_OUTCOMES_OPTIONS.map((outcome) => {
              const isSelected = (data.expected_outcomes || []).includes(outcome);
              return (
                <button
                  key={outcome}
                  type="button"
                  onClick={() => handleOutcomeToggle(outcome)}
                  className={`
                    p-3 rounded-lg border text-left text-sm transition-all
                    ${isSelected 
                      ? 'bg-viverblue/20 border-viverblue text-viverblue-light' 
                      : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{outcome}</span>
                    {isSelected && (
                      <span className="text-viverblue">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <DropdownModerno
          value={data.expected_outcome_30days || ''}
          onChange={(value) => onUpdate('expected_outcome_30days', value)}
          options={OUTCOME_30DAYS_OPTIONS}
          placeholder="Selecione sua expectativa"
          label="O que espera alcançar nos próximos 30 dias?"
          required
        />

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-sm text-green-400">
            🎯 <strong>Dica:</strong> Objetivos claros e mensuráveis nos ajudam a criar 
            uma trilha de implementação mais assertiva e direcionada para seu negócio!
          </p>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <div></div>
          
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
