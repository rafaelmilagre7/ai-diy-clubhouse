
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const BUSINESS_CHALLENGES_OPTIONS = [
  'Falta de processos automatizados',
  'Dificuldade em escalar o negócio',
  'Problemas de produtividade da equipe',
  'Atendimento ao cliente ineficiente',
  'Análise de dados manual e demorada',
  'Marketing sem personalização',
  'Gestão de leads desorganizada',
  'Operações repetitivas que consomem tempo'
];

const SHORT_TERM_GOALS_OPTIONS = [
  'Automatizar processos manuais',
  'Melhorar atendimento ao cliente',
  'Aumentar conversão de vendas',
  'Otimizar marketing digital',
  'Reduzir custos operacionais',
  'Acelerar tomada de decisões'
];

const MEDIUM_TERM_GOALS_OPTIONS = [
  'Escalar o negócio com IA',
  'Criar vantagem competitiva',
  'Expandir para novos mercados',
  'Desenvolver novos produtos/serviços',
  'Construir equipe mais produtiva',
  'Tornar-se referência no setor'
];

const IMPORTANT_KPIS_OPTIONS = [
  'Receita/Faturamento',
  'Margem de lucro',
  'Satisfação do cliente (NPS)',
  'Tempo de resposta ao cliente',
  'Taxa de conversão',
  'Produtividade da equipe',
  'Custo de aquisição de clientes (CAC)',
  'Lifetime Value (LTV)'
];

export const StepContextoNegocio: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const handleChallengesChange = (challenge: string, checked: boolean) => {
    const currentChallenges = Array.isArray(data.business_challenges) ? data.business_challenges : [];
    if (checked) {
      onUpdate('business_challenges', [...currentChallenges, challenge]);
    } else {
      onUpdate('business_challenges', currentChallenges.filter(c => c !== challenge));
    }
  };

  const handleShortTermGoalsChange = (goal: string, checked: boolean) => {
    const currentGoals = Array.isArray(data.short_term_goals) ? data.short_term_goals : [];
    if (checked) {
      onUpdate('short_term_goals', [...currentGoals, goal]);
    } else {
      onUpdate('short_term_goals', currentGoals.filter(g => g !== goal));
    }
  };

  const handleMediumTermGoalsChange = (goal: string, checked: boolean) => {
    const currentGoals = Array.isArray(data.medium_term_goals) ? data.medium_term_goals : [];
    if (checked) {
      onUpdate('medium_term_goals', [...currentGoals, goal]);
    } else {
      onUpdate('medium_term_goals', currentGoals.filter(g => g !== goal));
    }
  };

  const handleKPIsChange = (kpi: string, checked: boolean) => {
    const currentKPIs = Array.isArray(data.important_kpis) ? data.important_kpis : [];
    if (checked) {
      onUpdate('important_kpis', [...currentKPIs, kpi]);
    } else {
      onUpdate('important_kpis', currentKPIs.filter(k => k !== kpi));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Contexto do seu negócio 🎯
        </h2>
        <p className="text-gray-400">
          Vamos entender melhor os desafios e objetivos da sua empresa
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Quais são os principais desafios do seu negócio?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BUSINESS_CHALLENGES_OPTIONS.map((challenge) => (
              <label key={challenge} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.business_challenges) && data.business_challenges.includes(challenge)}
                  onCheckedChange={(checked) => handleChallengesChange(challenge, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{challenge}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Objetivos de curto prazo (3-6 meses)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SHORT_TERM_GOALS_OPTIONS.map((goal) => (
              <label key={goal} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.short_term_goals) && data.short_term_goals.includes(goal)}
                  onCheckedChange={(checked) => handleShortTermGoalsChange(goal, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Objetivos de médio prazo (6-18 meses)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MEDIUM_TERM_GOALS_OPTIONS.map((goal) => (
              <label key={goal} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.medium_term_goals) && data.medium_term_goals.includes(goal)}
                  onCheckedChange={(checked) => handleMediumTermGoalsChange(goal, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Quais KPIs são mais importantes para você?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {IMPORTANT_KPIS_OPTIONS.map((kpi) => (
              <label key={kpi} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.important_kpis) && data.important_kpis.includes(kpi)}
                  onCheckedChange={(checked) => handleKPIsChange(kpi, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{kpi}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Contexto adicional (opcional)
          </label>
          <Textarea
            value={data.additional_context || ''}
            onChange={(e) => onUpdate('additional_context', e.target.value)}
            placeholder="Compartilhe qualquer informação adicional que possa nos ajudar a personalizar melhor sua experiência..."
            className="h-24 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
          />
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <Button
            onClick={onPrevious}
            variant="ghost"
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Anterior</span>
          </Button>
          
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
