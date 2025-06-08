
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingStepProps } from '../types/onboardingTypes';

export const OnboardingStep5 = ({ 
  data, 
  onUpdateData, 
  onNext, 
  memberType 
}: OnboardingStepProps) => {
  const [primaryGoals, setPrimaryGoals] = useState<string[]>(data.primaryGoals || []);
  const [timeframe, setTimeframe] = useState<'1month' | '3months' | '6months' | '1year' | ''>(data.timeframe || '');
  const [successMetrics, setSuccessMetrics] = useState(data.successMetrics?.join(', ') || '');

  const clubGoals = [
    'Automatizar processos repetitivos',
    'Melhorar atendimento ao cliente',
    'Aumentar vendas e conversões',
    'Reduzir custos operacionais',
    'Criar conteúdo mais rápido',
    'Tomar decisões baseadas em dados'
  ];

  const formacaoGoals = [
    'Conseguir um emprego melhor',
    'Mudar de carreira',
    'Aumentar meu salário',
    'Aprender habilidades do futuro',
    'Ser mais produtivo no trabalho',
    'Criar projetos pessoais'
  ];

  const goals = memberType === 'club' ? clubGoals : formacaoGoals;

  // Wrapper function para resolver incompatibilidade de tipos com Radix UI Select
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value as typeof timeframe);
  };

  const handleGoalChange = (goal: string, checked: boolean) => {
    if (checked) {
      setPrimaryGoals([...primaryGoals, goal]);
    } else {
      setPrimaryGoals(primaryGoals.filter(g => g !== goal));
    }
  };

  const handleNext = () => {
    onUpdateData({ 
      primaryGoals,
      timeframe,
      successMetrics: successMetrics.split(',').map(s => s.trim()).filter(Boolean)
    });
    onNext();
  };

  const isClubMember = memberType === 'club';
  const canProceed = primaryGoals.length > 0 && timeframe;

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 p-4 rounded-full">
            <Trophy className="w-8 h-8 text-viverblue" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isClubMember ? 'Seus objetivos de negócio 🏆' : 'Seus objetivos de formação 🎯'}
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {isClubMember 
            ? 'Agora vamos definir seus objetivos para que possamos criar um plano personalizado!'
            : 'Vamos definir seus objetivos de aprendizado para personalizar sua jornada!'
          }
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 max-w-md mx-auto"
      >
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Quais são seus principais objetivos? (escolha quantos quiser)
          </Label>
          <div className="space-y-2">
            {goals.map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox
                  id={goal}
                  checked={primaryGoals.includes(goal)}
                  onCheckedChange={(checked) => handleGoalChange(goal, checked as boolean)}
                />
                <Label 
                  htmlFor={goal}
                  className="text-sm font-normal cursor-pointer"
                >
                  {goal}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Em quanto tempo quer alcançar esses objetivos?
          </Label>
          <Select value={timeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o prazo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">🚀 1 mês (urgente)</SelectItem>
              <SelectItem value="3months">⚡ 3 meses (rápido)</SelectItem>
              <SelectItem value="6months">📈 6 meses (moderado)</SelectItem>
              <SelectItem value="1year">🎯 1 ano (longo prazo)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Como você vai medir o sucesso?
          </Label>
          <Textarea
            value={successMetrics}
            onChange={(e) => setSuccessMetrics(e.target.value)}
            placeholder={isClubMember ? 
              "Ex: Economizar 10 horas por semana, Aumentar vendas em 20%..." : 
              "Ex: Conseguir certificação, Aumentar salário, Criar um projeto..."
            }
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Separe por vírgulas suas métricas de sucesso
          </p>
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
            className="w-full bg-viverblue hover:bg-viverblue-dark text-lg py-6"
          >
            Personalizar experiência! ✨
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
