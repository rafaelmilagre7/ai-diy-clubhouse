
import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingStepProps } from '../types/onboardingTypes';

const mainObjectives = [
  'Aumentar produtividade e eficiência',
  'Reduzir custos operacionais',
  'Melhorar atendimento ao cliente',
  'Automatizar processos repetitivos',
  'Gerar insights de dados',
  'Criar novos produtos/serviços',
  'Otimizar marketing e vendas',
  'Melhorar tomada de decisões',
  'Inovar no mercado',
  'Outros'
];

const budgetRanges = [
  'Até R$ 5.000',
  'R$ 5.000 - R$ 15.000',
  'R$ 15.000 - R$ 30.000',
  'R$ 30.000 - R$ 50.000',
  'R$ 50.000 - R$ 100.000',
  'Acima de R$ 100.000',
  'Ainda não defini'
];

const OnboardingStep4: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
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
          Objetivos e Expectativas
        </h2>
        <p className="text-slate-400">
          Vamos definir seus objetivos para criar uma experiência personalizada
        </p>
      </div>

      <div className="space-y-6">
        {/* Objetivo Principal */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div>
              <Label className="text-slate-200 text-base font-medium">
                Qual o seu principal objetivo com IA? *
              </Label>
              <Select 
                value={data.mainObjective || ''} 
                onValueChange={(value) => onUpdateData({ mainObjective: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione seu objetivo principal" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {mainObjectives.map((objective) => (
                    <SelectItem key={objective} value={objective} className="text-white hover:bg-white/10">
                      {objective}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('mainObjective') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('mainObjective')}</p>
              )}
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Qual área do seu negócio você quer impactar primeiro? *
              </Label>
              <Textarea
                value={data.areaToImpact || ''}
                onChange={(e) => onUpdateData({ areaToImpact: e.target.value })}
                className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500 min-h-[100px]"
                placeholder="Ex: Atendimento ao cliente, vendas, operações, marketing..."
              />
              {getFieldError?.('areaToImpact') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('areaToImpact')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Expectativas */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Expectativas</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Que resultado você espera alcançar em 90 dias? *
              </Label>
              <Textarea
                value={data.expectedResult90Days || ''}
                onChange={(e) => onUpdateData({ expectedResult90Days: e.target.value })}
                className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500 min-h-[100px]"
                placeholder="Ex: Reduzir 30% do tempo gasto em tarefas manuais..."
              />
              {getFieldError?.('expectedResult90Days') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('expectedResult90Days')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Orçamento */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Investimento</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Qual o orçamento disponível para implementar IA? *
              </Label>
              <Select 
                value={data.aiImplementationBudget || ''} 
                onValueChange={(value) => onUpdateData({ aiImplementationBudget: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione a faixa de orçamento" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {budgetRanges.map((budget) => (
                    <SelectItem key={budget} value={budget} className="text-white hover:bg-white/10">
                      {budget}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('aiImplementationBudget') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('aiImplementationBudget')}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default OnboardingStep4;
