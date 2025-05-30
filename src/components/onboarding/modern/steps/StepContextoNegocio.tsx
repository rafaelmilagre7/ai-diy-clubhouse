
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const BUSINESS_MODEL_OPTIONS = [
  { value: 'b2b', label: 'B2B (Empresa para Empresa)' },
  { value: 'b2c', label: 'B2C (Empresa para Consumidor)' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'saas', label: 'SaaS (Software como Serviço)' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'servicos', label: 'Prestação de Serviços' },
  { value: 'outro', label: 'Outro' }
];

const MAIN_CHALLENGE_OPTIONS = [
  { value: 'produtividade', label: 'Aumentar produtividade da equipe' },
  { value: 'custos', label: 'Reduzir custos operacionais' },
  { value: 'vendas', label: 'Melhorar processo de vendas' },
  { value: 'atendimento', label: 'Otimizar atendimento ao cliente' },
  { value: 'marketing', label: 'Melhorar estratégias de marketing' },
  { value: 'gestao', label: 'Melhorar gestão e controle' },
  { value: 'inovacao', label: 'Acelerar inovação' },
  { value: 'competitividade', label: 'Manter competitividade' }
];

const BUSINESS_CHALLENGES_OPTIONS = [
  'Falta de automação em processos',
  'Dificuldade em análise de dados',
  'Atendimento ao cliente lento',
  'Processos manuais demorados',
  'Falta de insights de negócio',
  'Dificuldade em tomada de decisões',
  'Baixa produtividade da equipe',
  'Custos operacionais altos',
  'Competição acirrada',
  'Falta de inovação'
];

const SHORT_TERM_GOALS_OPTIONS = [
  'Automatizar pelo menos 1 processo',
  'Reduzir tempo de atendimento',
  'Melhorar análise de dados',
  'Implementar chatbot',
  'Otimizar processos internos',
  'Capacitar equipe em IA',
  'Reduzir custos operacionais',
  'Melhorar experiência do cliente'
];

const MEDIUM_TERM_GOALS_OPTIONS = [
  'Transformação digital completa',
  'IA integrada em todos processos',
  'Análise preditiva implementada',
  'Automação de vendas',
  'Sistema de recomendações',
  'Processos totalmente otimizados',
  'Equipe especializada em IA',
  'ROI positivo em IA'
];

const IMPORTANT_KPIS_OPTIONS = [
  'Receita/Faturamento',
  'Margem de lucro',
  'Produtividade por funcionário',
  'Tempo de resposta ao cliente',
  'Taxa de conversão',
  'Satisfação do cliente (NPS)',
  'Redução de custos',
  'Eficiência operacional',
  'Tempo de implementação',
  'ROI em tecnologia'
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
          Entenda melhor seu modelo de negócio e principais desafios
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Modelo de negócio <span className="text-red-400">*</span>
            </label>
            <Select value={data.business_model || ''} onValueChange={(value) => onUpdate('business_model', value)}>
              <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
                <SelectValue placeholder="Selecione seu modelo de negócio" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {BUSINESS_MODEL_OPTIONS.map((option) => (
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Principal desafio atual <span className="text-red-400">*</span>
            </label>
            <Select value={data.main_challenge || ''} onValueChange={(value) => onUpdate('main_challenge', value)}>
              <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
                <SelectValue placeholder="Qual seu maior desafio?" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {MAIN_CHALLENGE_OPTIONS.map((option) => (
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
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Desafios do negócio (selecione todos que se aplicam)
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
            Metas de curto prazo (próximos 3-6 meses)
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
            Metas de médio prazo (6-12 meses)
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
            KPIs mais importantes para você
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Contexto adicional (opcional)
          </label>
          <Textarea
            value={data.additional_context || ''}
            onChange={(e) => onUpdate('additional_context', e.target.value)}
            placeholder="Conte-nos mais sobre seu negócio, desafios específicos ou objetivos..."
            className="min-h-[100px] bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
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
