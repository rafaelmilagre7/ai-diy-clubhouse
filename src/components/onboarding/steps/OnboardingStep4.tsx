
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Brain, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingStepProps } from '../types/onboardingTypes';

export const OnboardingStep4 = ({ 
  data, 
  onUpdateData, 
  onNext, 
  memberType 
}: OnboardingStepProps) => {
  const [aiExperience, setAiExperience] = useState<'none' | 'basic' | 'intermediate' | 'advanced' | ''>(data.aiExperience || '');
  const [aiToolsUsed, setAiToolsUsed] = useState(data.aiToolsUsed?.join(', ') || '');
  const [aiChallenges, setAiChallenges] = useState(data.aiChallenges?.join(', ') || '');

  // Wrapper function para resolver incompatibilidade de tipos com Radix UI Select
  const handleAiExperienceChange = (value: string) => {
    setAiExperience(value as typeof aiExperience);
  };

  const handleNext = () => {
    onUpdateData({ 
      aiExperience,
      aiToolsUsed: aiToolsUsed.split(',').map(s => s.trim()).filter(Boolean),
      aiChallenges: aiChallenges.split(',').map(s => s.trim()).filter(Boolean)
    });
    onNext();
  };

  const isClubMember = memberType === 'club';
  const canProceed = aiExperience;

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 p-4 rounded-full">
            <Bot className="w-8 h-8 text-viverblue" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sua experiência com IA 🤖
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {isClubMember 
            ? 'Vamos entender seu nível atual com Inteligência Artificial para personalizar seu aprendizado!'
            : 'Queremos conhecer sua experiência com IA para adaptar o conteúdo ao seu nível!'
          }
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 max-w-md mx-auto"
      >
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Qual seu nível de experiência com IA?
          </Label>
          <Select value={aiExperience} onValueChange={handleAiExperienceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">🌱 Nunca usei (iniciante total)</SelectItem>
              <SelectItem value="basic">📚 Básico (já ouvi falar, usei pouco)</SelectItem>
              <SelectItem value="intermediate">⚡ Intermediário (uso algumas ferramentas)</SelectItem>
              <SelectItem value="advanced">🚀 Avançado (uso frequentemente)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Que ferramentas de IA você já usou?
          </Label>
          <Input
            value={aiToolsUsed}
            onChange={(e) => setAiToolsUsed(e.target.value)}
            placeholder="Ex: ChatGPT, Canva AI, Midjourney..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Separe por vírgulas. Deixe em branco se nunca usou
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Quais suas principais dificuldades com IA?
          </Label>
          <Textarea
            value={aiChallenges}
            onChange={(e) => setAiChallenges(e.target.value)}
            placeholder={isClubMember ? 
              "Ex: Não sei como aplicar no meu negócio, Medo de substituir funcionários..." : 
              "Ex: Não sei por onde começar, Qual ferramenta usar para cada situação..."
            }
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Separe por vírgulas se houver múltiplas dificuldades
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
            Definir objetivos! 🎯
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
