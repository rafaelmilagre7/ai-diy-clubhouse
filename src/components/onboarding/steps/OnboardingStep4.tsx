
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Clock, DollarSign, ChevronLeft } from 'lucide-react';
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
  onPrev,
  memberType,
  getFieldError
}: OnboardingStepProps) => {
  const [mainObjective, setMainObjective] = useState<'reduce-costs' | 'increase-sales' | 'automate-processes' | 'innovate-products' | ''>(data.mainObjective || '');
  const [areaToImpact, setAreaToImpact] = useState(data.areaToImpact || '');
  const [expectedResult90Days, setExpectedResult90Days] = useState(data.expectedResult90Days || '');
  const [aiImplementationBudget, setAiImplementationBudget] = useState(data.aiImplementationBudget || '');

  // Atualizar dados globais sempre que o estado local mudar
  useEffect(() => {
    onUpdateData({ 
      mainObjective,
      areaToImpact,
      expectedResult90Days,
      aiImplementationBudget
    });
  }, [mainObjective, areaToImpact, expectedResult90Days, aiImplementationBudget, onUpdateData]);

  const handleNext = () => {
    // Verificar se todos os campos obrigatórios estão preenchidos
    const currentData = {
      mainObjective,
      areaToImpact,
      expectedResult90Days,
      aiImplementationBudget
    };

    if (!currentData.mainObjective || !currentData.areaToImpact || !currentData.expectedResult90Days || !currentData.aiImplementationBudget) {
      console.log('[OnboardingStep4] Campos obrigatórios faltando:', currentData);
      return;
    }

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

  const handlePrev = () => {
    onPrev();
  };

  const mainObjectiveError = getFieldError?.('mainObjective');
  const areaToImpactError = getFieldError?.('areaToImpact');
  const expectedResultError = getFieldError?.('expectedResult90Days');
  const budgetError = getFieldError?.('aiImplementationBudget');

  const canProceed = mainObjective && areaToImpact && expectedResult90Days && aiImplementationBudget;

  return (
    <div className="space-y-8">
      {/* Mensagem da IA da etapa anterior */}
      {data.aiMessage3 && (
        <AIMessageDisplay message={data.aiMessage3} />
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 flex items-center justify-center"
          >
            <Target className="w-10 h-10 text-viverblue" />
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-heading font-bold text-white"
          >
            Seus objetivos e{' '}
            <span className="bg-gradient-to-r from-viverblue to-viverblue-light bg-clip-text text-transparent">
              expectativas! 🎯
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed"
          >
            Agora vamos definir seus objetivos específicos para criar um plano 
            de implementação personalizado!
          </motion.p>
        </div>
      </motion.div>

      {/* Formulário */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-[#151823] border border-white/10 rounded-2xl p-8">
          <div className="space-y-8">
            {/* Seção de objetivo principal */}
            <div className="space-y-6">
              <h3 className="text-xl font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-viverblue" />
                </div>
                Objetivo Principal
              </h3>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Principal objetivo com IA *
                </Label>
                <Select value={mainObjective} onValueChange={(value: typeof mainObjective) => setMainObjective(value)}>
                  <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${mainObjectiveError ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione seu objetivo principal" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151823] border-white/10">
                    {mainObjectives.map((objective) => (
                      <SelectItem key={objective.value} value={objective.value}>
                        {objective.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mainObjectiveError && (
                  <p className="text-sm text-red-400">{mainObjectiveError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Qual área da empresa quer impactar primeiro? *
                </Label>
                <Select value={areaToImpact} onValueChange={setAreaToImpact}>
                  <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${areaToImpactError ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151823] border-white/10">
                    {areasToImpact.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {areaToImpactError && (
                  <p className="text-sm text-red-400">{areaToImpactError}</p>
                )}
              </div>
            </div>

            {/* Seção de resultados e orçamento */}
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-viverblue" />
                </div>
                Resultados e Investimento
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">
                    Qual resultado espera alcançar em 90 dias? *
                  </Label>
                  <Select value={expectedResult90Days} onValueChange={setExpectedResult90Days}>
                    <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${expectedResultError ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Selecione o resultado esperado" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151823] border-white/10">
                      {expectedResults90Days.map((result) => (
                        <SelectItem key={result} value={result}>
                          {result}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {expectedResultError && (
                    <p className="text-sm text-red-400">{expectedResultError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Orçamento disponível para implementação de IA *
                  </Label>
                  <Select value={aiImplementationBudget} onValueChange={setAiImplementationBudget}>
                    <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${budgetError ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Selecione o orçamento" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151823] border-white/10">
                      {budgetRanges.map((budget) => (
                        <SelectItem key={budget} value={budget}>
                          {budget}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {budgetError && (
                    <p className="text-sm text-red-400">{budgetError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex items-center gap-2 h-12 px-6 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/30"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>

              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                size="lg"
                className="h-12 px-8 bg-viverblue hover:bg-viverblue-dark text-[#0F111A] text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Personalizar experiência! ✨
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dica */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="bg-viverblue/5 border border-viverblue/20 rounded-xl p-4 text-center max-w-2xl mx-auto"
      >
        <p className="text-sm text-neutral-300">
          💡 <strong className="text-white">Etapa 4 de 5:</strong> Excelente! Seus objetivos estão claros! 🎯
        </p>
      </motion.div>
    </div>
  );
};
