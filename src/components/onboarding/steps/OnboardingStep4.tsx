
import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingStepProps } from '../types/onboardingTypes';

const mainObjectives = [
  'Automatizar processos repetitivos',
  'Melhorar atendimento ao cliente',
  'Otimizar marketing e vendas',
  'Aumentar produtividade da equipe',
  'Reduzir custos operacionais',
  'Criar novos produtos/serviços',
  'Melhorar tomada de decisões',
  'Personalizar experiência do cliente',
  'Outro'
];

const impactAreas = [
  'Atendimento ao Cliente',
  'Marketing e Vendas',
  'Operações e Logística',
  'Recursos Humanos',
  'Finanças e Contabilidade',
  'Desenvolvimento de Produtos',
  'Gestão de Projetos',
  'Análise de Dados',
  'Segurança e Compliance',
  'Toda a empresa'
];

const budgetRanges = [
  'Até R$ 1.000/mês',
  'R$ 1.000 - R$ 5.000/mês',
  'R$ 5.000 - R$ 10.000/mês',
  'R$ 10.000 - R$ 25.000/mês',
  'R$ 25.000 - R$ 50.000/mês',
  'Acima de R$ 50.000/mês',
  'Ainda não defini orçamento'
];

const implementationResponsible = [
  'Eu mesmo(a)',
  'Minha equipe interna',
  'Consultoria externa',
  'Fornecedor/Parceiro',
  'Ainda não sei',
  'Combinação de interno e externo'
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
          Vamos definir seus objetivos específicos e como você planeja implementar IA no seu negócio
        </p>
      </div>

      <div className="space-y-6">
        {/* Objetivo Principal */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div>
              <Label className="text-slate-200 text-base font-medium">
                Qual seu principal objetivo com IA? *
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
                Em qual área você quer causar maior impacto? *
              </Label>
              <Select 
                value={data.areaToImpact || ''} 
                onValueChange={(value) => onUpdateData({ areaToImpact: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione a área de impacto" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {impactAreas.map((area) => (
                    <SelectItem key={area} value={area} className="text-white hover:bg-white/10">
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('areaToImpact') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('areaToImpact')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Expectativas de Resultado */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Expectativas de Resultado</h3>
            </div>

            <div>
              <Label htmlFor="expectedResult90Days" className="text-slate-200 text-base font-medium">
                Que resultado você espera alcançar nos próximos 90 dias? *
              </Label>
              <Textarea
                id="expectedResult90Days"
                value={data.expectedResult90Days || ''}
                onChange={(e) => onUpdateData({ expectedResult90Days: e.target.value })}
                className="mt-3 bg-[#151823] border-white/20 text-white min-h-[100px]"
                placeholder="Descreva de forma específica o que você espera alcançar..."
              />
              {getFieldError?.('expectedResult90Days') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('expectedResult90Days')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Orçamento e Implementação */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Planejamento de Implementação</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Qual seu orçamento mensal estimado para IA?
              </Label>
              <Select 
                value={data.aiImplementationBudget || ''} 
                onValueChange={(value) => onUpdateData({ aiImplementationBudget: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione a faixa de orçamento" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range} className="text-white hover:bg-white/10">
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Quem será responsável pela implementação?
              </Label>
              <Select 
                value={data.whoWillImplement || ''} 
                onValueChange={(value) => onUpdateData({ whoWillImplement: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione quem será responsável" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {implementationResponsible.map((responsible) => (
                    <SelectItem key={responsible} value={responsible} className="text-white hover:bg-white/10">
                      {responsible}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default OnboardingStep4;
