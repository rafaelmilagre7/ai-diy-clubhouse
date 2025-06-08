
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';

const mainObjectives = [
  { value: 'reduce-costs', label: '💰 Reduzir custos operacionais', icon: '💰' },
  { value: 'increase-sales', label: '📈 Aumentar vendas e conversões', icon: '📈' },
  { value: 'automate-processes', label: '🔄 Automatizar processos repetitivos', icon: '🔄' },
  { value: 'innovate-products', label: '🚀 Inovar produtos e serviços', icon: '🚀' }
];

const areasToImpact = [
  'Atendimento ao Cliente',
  'Vendas e Marketing',
  'Operações e Processos',
  'Recursos Humanos',
  'Financeiro e Controladoria',
  'Produção/Desenvolvimento',
  'Logística e Suprimentos',
  'Qualidade e Controle',
  'Estratégia e Planejamento',
  'Tecnologia da Informação'
];

const expectedResults90Days = [
  'Economia de 20-30% em custos operacionais',
  'Aumento de 15-25% nas vendas',
  'Redução de 50% no tempo de processos manuais',
  'Melhoria de 40% na satisfação do cliente',
  'Automatização de 80% das tarefas repetitivas',
  'Aumento de 30% na produtividade da equipe',
  'Lançamento de 1-2 novos produtos/serviços',
  'Implementação de 3-5 soluções de IA'
];

const budgetRanges = [
  'Até R$ 5.000',
  'R$ 5.000 - R$ 15.000',
  'R$ 15.000 - R$ 50.000',
  'R$ 50.000 - R$ 100.000',
  'R$ 100.000 - R$ 500.000',
  'Acima de R$ 500.000',
  'Ainda não defini orçamento'
];

export const OnboardingStep4 = ({ 
  data, 
  onUpdateData, 
  onNext, 
  memberType 
}: OnboardingStepProps) => {
  const [mainObjective, setMainObjective] = useState<'reduce-costs' | 'increase-sales' | 'automate-processes' | 'innovate-products' | ''>(data.mainObjective || '');
  const [areaToImpact, setAreaToImpact] = useState(data.areaToImpact || '');
  const [expectedResult90Days, setExpectedResult90Days] = useState(data.expectedResult90Days || '');
  const [aiImplementationBudget, setAiImplementationBudget] = useState(data.aiImplementationBudget || '');

  const handleNext = () => {
    // Gerar mensagem personalizada da IA baseada nas respostas
    const firstName = data.name?.split(' ')[0] || 'Amigo';
    const objectiveLabel = mainObjectives.find(obj => obj.value === mainObjective)?.label || '';
    
    let budgetComment = '';
    if (aiImplementationBudget.includes('500.000')) {
      budgetComment = 'Com esse orçamento, podemos implementar soluções robustas e transformadoras! ';
    } else if (aiImplementationBudget.includes('100.000')) {
      budgetComment = 'Excelente orçamento para começar com implementações impactantes! ';
    } else if (aiImplementationBudget.includes('50.000')) {
      budgetComment = 'Ótimo orçamento para projetos iniciais com resultados concretos! ';
    } else {
      budgetComment = 'Vamos focar em soluções de alto impacto e baixo custo para começar! ';
    }

    const aiMessage = `${firstName}, agora estou MUITO empolgado! ${objectiveLabel.replace('💰', '').replace('📈', '').replace('🔄', '').replace('🚀', '')} na área de ${areaToImpact?.toLowerCase()} é um objetivo fantástico! ${budgetComment}E essa meta para 90 dias: "${expectedResult90Days}" - é ambiciosa e totalmente alcançável! Agora só faltam os últimos detalhes para personalizar sua experiência! ✨`;

    onUpdateData({ 
      mainObjective,
      areaToImpact,
      expectedResult90Days,
      aiImplementationBudget,
      aiMessage4: aiMessage
    });
    onNext();
  };

  const canProceed = mainObjective && areaToImpact && expectedResult90Days && aiImplementationBudget;

  return (
    <div className="space-y-8">
      {/* Mensagem da IA da etapa anterior */}
      {data.aiMessage3 && (
        <AIMessageDisplay message={data.aiMessage3} />
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 p-4 rounded-full">
            <Target className="w-8 h-8 text-viverblue" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Seus objetivos e expectativas 🎯
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Agora vamos definir seus objetivos específicos para criar um plano 
          de implementação personalizado!
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Principal objetivo com IA *
          </Label>
          <Select value={mainObjective} onValueChange={(value: typeof mainObjective) => setMainObjective(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu objetivo principal" />
            </SelectTrigger>
            <SelectContent>
              {mainObjectives.map((objective) => (
                <SelectItem key={objective.value} value={objective.value}>
                  {objective.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Qual área da empresa quer impactar primeiro? *
          </Label>
          <Select value={areaToImpact} onValueChange={setAreaToImpact}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a área" />
            </SelectTrigger>
            <SelectContent>
              {areasToImpact.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Qual resultado espera alcançar em 90 dias? *
          </Label>
          <Select value={expectedResult90Days} onValueChange={setExpectedResult90Days}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o resultado esperado" />
            </SelectTrigger>
            <SelectContent>
              {expectedResults90Days.map((result) => (
                <SelectItem key={result} value={result}>
                  {result}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Orçamento disponível para implementação de IA *
          </Label>
          <Select value={aiImplementationBudget} onValueChange={setAiImplementationBudget}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o orçamento" />
            </SelectTrigger>
            <SelectContent>
              {budgetRanges.map((budget) => (
                <SelectItem key={budget} value={budget}>
                  {budget}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-6"
        >
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full bg-viverblue hover:bg-viverblue-dark text-lg py-6 disabled:opacity-50"
          >
            Personalizar experiência! ✨
          </Button>
        </motion.div>
      </motion.div>

      {/* Dica com progresso */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/20 rounded-lg p-4 text-center"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          💡 <strong>Etapa 4 de 5:</strong> Excelente! Seus objetivos estão claros! 🎯
        </p>
      </motion.div>
    </div>
  );
};
