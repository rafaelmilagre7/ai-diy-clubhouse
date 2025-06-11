
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Target, TrendingUp, Calendar, DollarSign, Sparkles } from 'lucide-react';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';

const OnboardingStep4: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  memberType,
  getFieldError
}) => {
  const { generateMessage, isGenerating, generatedMessage } = useAIMessageGeneration();
  const [shouldGenerateMessage, setShouldGenerateMessage] = useState(false);

  const objetivos = [
    'Aumentar produtividade da equipe',
    'Reduzir custos operacionais',
    'Melhorar atendimento ao cliente',
    'Automatizar processos repetitivos',
    'Gerar insights de dados',
    'Criar novos produtos/serviços',
    'Otimizar marketing e vendas',
    'Outros'
  ];

  const orcamentos = [
    'Até R$ 1.000/mês',
    'R$ 1.000 - R$ 5.000/mês',
    'R$ 5.000 - R$ 10.000/mês',
    'R$ 10.000 - R$ 50.000/mês',
    'Acima de R$ 50.000/mês',
    'Ainda não defini'
  ];

  // Gerar mensagem quando objetivos estiverem preenchidos
  useEffect(() => {
    const hasObjectives = data.mainObjective && data.areaToImpact && data.expectedResult90Days;
    if (hasObjectives && !generatedMessage && !isGenerating && !shouldGenerateMessage) {
      setShouldGenerateMessage(true);
      generateMessage(data, memberType);
    }
  }, [data.mainObjective, data.areaToImpact, data.expectedResult90Days, generatedMessage, isGenerating, shouldGenerateMessage, generateMessage, data, memberType]);

  const handleInputChange = (field: string, value: string) => {
    onUpdateData({ [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-viverblue/20 rounded-full flex items-center justify-center">
          <Target className="w-8 h-8 text-viverblue" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Objetivos e Expectativas
        </h2>
        <p className="text-slate-300">
          Defina seus objetivos para que possamos criar uma estratégia personalizada
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Objetivos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Principal Objetivo */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Principal Objetivo</h3>
              </div>

              <div>
                <Label htmlFor="mainObjective" className="text-slate-200">
                  Qual é seu principal objetivo com IA? *
                </Label>
                <Select value={data.mainObjective || ''} onValueChange={(value) => handleInputChange('mainObjective', value)}>
                  <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                    <SelectValue placeholder="Selecione seu objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {objetivos.map((objetivo) => (
                      <SelectItem key={objetivo} value={objetivo}>{objetivo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError?.('mainObjective') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('mainObjective')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="areaToImpact" className="text-slate-200">
                  Em qual área específica você quer implementar IA primeiro? *
                </Label>
                <Textarea
                  id="areaToImpact"
                  value={data.areaToImpact || ''}
                  onChange={(e) => handleInputChange('areaToImpact', e.target.value)}
                  placeholder="Ex: Atendimento ao cliente, processo de vendas, análise de dados..."
                  rows={3}
                  className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                />
                {getFieldError?.('areaToImpact') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('areaToImpact')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Orçamento */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Investimento</h3>
              </div>

              <div>
                <Label htmlFor="aiImplementationBudget" className="text-slate-200">
                  Qual orçamento você tem para implementação de IA? *
                </Label>
                <Select value={data.aiImplementationBudget || ''} onValueChange={(value) => handleInputChange('aiImplementationBudget', value)}>
                  <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                    <SelectValue placeholder="Selecione a faixa de orçamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {orcamentos.map((orcamento) => (
                      <SelectItem key={orcamento} value={orcamento}>{orcamento}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError?.('aiImplementationBudget') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('aiImplementationBudget')}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Coluna Direita - Expectativas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Resultados Esperados */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Expectativas</h3>
              </div>

              <div>
                <Label htmlFor="expectedResult90Days" className="text-slate-200">
                  Que resultado você espera alcançar nos primeiros 90 dias? *
                </Label>
                <Textarea
                  id="expectedResult90Days"
                  value={data.expectedResult90Days || ''}
                  onChange={(e) => handleInputChange('expectedResult90Days', e.target.value)}
                  placeholder="Descreva o resultado específico que você gostaria de ver..."
                  rows={4}
                  className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                />
                {getFieldError?.('expectedResult90Days') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('expectedResult90Days')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Mensagem da IA */}
          {(generatedMessage || isGenerating) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Estratégia Recomendada</h3>
              </div>
              <AIMessageDisplay 
                message={generatedMessage || ''} 
                isLoading={isGenerating}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingStep4;
