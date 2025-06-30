
import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingStep4Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const mainObjectives = [
  'Aumentar produtividade e eficiência operacional',
  'Reduzir custos e otimizar processos',
  'Melhorar experiência e atendimento ao cliente',
  'Automatizar tarefas repetitivas',
  'Gerar insights estratégicos de dados',
  'Desenvolver novos produtos ou serviços',
  'Otimizar estratégias de marketing e vendas',
  'Aprimorar processo de tomada de decisões',
  'Inovar e se diferenciar no mercado',
  'Outros objetivos específicos'
];

const budgetRanges = [
  'Até R$ 10.000',
  'R$ 10.000 - R$ 25.000',
  'R$ 25.000 - R$ 50.000',
  'R$ 50.000 - R$ 100.000',
  'R$ 100.000 - R$ 250.000',
  'Acima de R$ 250.000',
  'Orçamento a definir'
];

const MockOnboardingStep4: React.FC<MockOnboardingStep4Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Target className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Objetivos Estratégicos
        </h2>
        <p className="text-slate-400">
          Defina seus objetivos para criar uma estratégia de implementação personalizada
        </p>
      </div>

      <div className="space-y-8">
        {/* Objetivos Principais */}
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Objetivos Principais</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Qual o principal objetivo da sua empresa com IA? *
              </Label>
              <Select 
                value={data.mainObjective || ''} 
                onValueChange={(value) => onUpdateData({ mainObjective: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                  <SelectValue placeholder="Selecione o objetivo estratégico principal" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                  {mainObjectives.map((objective) => (
                    <SelectItem key={objective} value={objective} className="text-white hover:bg-slate-700">
                      {objective}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('mainObjective') && (
                <p className="text-red-400 text-sm">{getFieldError('mainObjective')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Qual área do negócio será impactada prioritariamente? *
              </Label>
              <Textarea
                value={data.areaToImpact || ''}
                onChange={(e) => onUpdateData({ areaToImpact: e.target.value })}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue min-h-[100px] resize-none"
                placeholder="Descreva a área específica (ex: atendimento ao cliente, vendas, operações, marketing, RH, etc.)"
                maxLength={500}
              />
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Seja específico sobre o departamento ou processo</span>
                <span className="text-slate-400">
                  {(data.areaToImpact || '').length}/500
                </span>
              </div>
              {getFieldError?.('areaToImpact') && (
                <p className="text-red-400 text-sm">{getFieldError('areaToImpact')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Expectativas e Resultados */}
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Expectativas de Resultados</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Quais resultados espera alcançar nos primeiros 90 dias? *
              </Label>
              <Textarea
                value={data.expectedResult90Days || ''}
                onChange={(e) => onUpdateData({ expectedResult90Days: e.target.value })}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue min-h-[120px] resize-none"
                placeholder="Descreva resultados mensuráveis esperados (ex: redução de 30% no tempo de atendimento, aumento de 20% na eficiência, etc.)"
                maxLength={600}
              />
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Inclua métricas específicas quando possível</span>
                <span className="text-slate-400">
                  {(data.expectedResult90Days || '').length}/600
                </span>
              </div>
              {getFieldError?.('expectedResult90Days') && (
                <p className="text-red-400 text-sm">{getFieldError('expectedResult90Days')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Investimento */}
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Investimento Disponível</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-medium">
                Qual o orçamento disponível para implementação de IA? *
              </Label>
              <Select 
                value={data.aiImplementationBudget || ''} 
                onValueChange={(value) => onUpdateData({ aiImplementationBudget: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                  <SelectValue placeholder="Selecione a faixa de investimento" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {budgetRanges.map((budget) => (
                    <SelectItem key={budget} value={budget} className="text-white hover:bg-slate-700">
                      {budget}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('aiImplementationBudget') && (
                <p className="text-red-400 text-sm">{getFieldError('aiImplementationBudget')}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default MockOnboardingStep4;
