
import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingData } from '../types/onboardingTypes';
import { Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface OnboardingStep4Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  onNext: () => Promise<void>;
  onPrev: () => void;
  memberType: 'club' | 'formacao';
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
}

const OnboardingStep4: React.FC<OnboardingStep4Props> = ({
  data,
  onUpdateData,
  validationErrors,
  getFieldError
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-viverblue/20 rounded-full flex items-center justify-center">
          <Target className="w-8 h-8 text-viverblue" />
        </div>
        
        <h1 className="text-3xl font-bold text-white">
          Objetivos e Expectativas
        </h1>
        
        <p className="text-xl text-slate-300">
          Defina seus objetivos com IA
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1A1E2E] rounded-xl p-6 border border-white/10 space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="mainObjective" className="text-white flex items-center gap-2">
              <Target className="w-4 h-4" />
              Principal Objetivo com IA *
            </Label>
            <Select value={data.mainObjective || ''} onValueChange={(value) => onUpdateData({ mainObjective: value })}>
              <SelectTrigger className="bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione seu objetivo principal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reduce-costs">Reduzir custos operacionais</SelectItem>
                <SelectItem value="increase-sales">Aumentar vendas/receita</SelectItem>
                <SelectItem value="automate-processes">Automatizar processos</SelectItem>
                <SelectItem value="innovate-products">Inovar produtos/serviços</SelectItem>
                <SelectItem value="improve-efficiency">Melhorar eficiência</SelectItem>
                <SelectItem value="enhance-customer-experience">Melhorar experiência do cliente</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('mainObjective') && (
              <p className="text-red-400 text-sm">{getFieldError('mainObjective')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="areaToImpact" className="text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Área Principal para Implementar IA *
            </Label>
            <Textarea
              id="areaToImpact"
              value={data.areaToImpact || ''}
              onChange={(e) => onUpdateData({ areaToImpact: e.target.value })}
              placeholder="Descreva a principal área/departamento onde deseja implementar IA primeiro"
              className="bg-[#151823] border-white/20 text-white placeholder:text-slate-400 min-h-[80px]"
            />
            {getFieldError('areaToImpact') && (
              <p className="text-red-400 text-sm">{getFieldError('areaToImpact')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedResult90Days" className="text-white flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Resultado Esperado em 90 Dias *
            </Label>
            <Textarea
              id="expectedResult90Days"
              value={data.expectedResult90Days || ''}
              onChange={(e) => onUpdateData({ expectedResult90Days: e.target.value })}
              placeholder="Descreva o resultado específico que espera alcançar nos primeiros 90 dias"
              className="bg-[#151823] border-white/20 text-white placeholder:text-slate-400 min-h-[80px]"
            />
            {getFieldError('expectedResult90Days') && (
              <p className="text-red-400 text-sm">{getFieldError('expectedResult90Days')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="aiImplementationBudget" className="text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Orçamento para Implementação de IA *
            </Label>
            <Select value={data.aiImplementationBudget || ''} onValueChange={(value) => onUpdateData({ aiImplementationBudget: value })}>
              <SelectTrigger className="bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione a faixa de orçamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ate-5k">Até R$ 5.000</SelectItem>
                <SelectItem value="5k-15k">R$ 5.000 - R$ 15.000</SelectItem>
                <SelectItem value="15k-50k">R$ 15.000 - R$ 50.000</SelectItem>
                <SelectItem value="50k-100k">R$ 50.000 - R$ 100.000</SelectItem>
                <SelectItem value="100k+">Acima de R$ 100.000</SelectItem>
                <SelectItem value="ainda-definindo">Ainda estou definindo</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('aiImplementationBudget') && (
              <p className="text-red-400 text-sm">{getFieldError('aiImplementationBudget')}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingStep4;
