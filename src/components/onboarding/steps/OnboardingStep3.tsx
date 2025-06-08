
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingStepProps } from '../types/onboardingTypes';

export const OnboardingStep3 = ({ 
  data, 
  onUpdateData, 
  onNext, 
  memberType 
}: OnboardingStepProps) => {
  const [targetMarket, setTargetMarket] = useState(data.targetMarket || '');
  const [mainChallenges, setMainChallenges] = useState(data.mainChallenges?.join(', ') || '');
  const [currentTools, setCurrentTools] = useState(data.currentTools?.join(', ') || '');

  const handleNext = () => {
    onUpdateData({ 
      targetMarket,
      mainChallenges: mainChallenges.split(',').map(s => s.trim()).filter(Boolean),
      currentTools: currentTools.split(',').map(s => s.trim()).filter(Boolean)
    });
    onNext();
  };

  const isClubMember = memberType === 'club';
  const canProceed = targetMarket.trim() && mainChallenges.trim();

  return (
    <div className="space-y-8">
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
          {isClubMember ? 'Seu mercado e desafios 🎯' : 'Sua área de atuação 🎯'}
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {isClubMember 
            ? 'Agora vamos entender melhor seu mercado-alvo e os principais desafios que você enfrenta!'
            : 'Vamos conhecer melhor sua área de atuação e os desafios que você quer superar!'
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
            <Target className="w-4 h-4" />
            {isClubMember ? 'Qual é seu mercado-alvo?' : 'Em qual área você quer se especializar?'}
          </Label>
          <Input
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            placeholder={isClubMember ? 
              "Ex: Pequenas empresas, Profissionais liberais..." : 
              "Ex: Análise de dados, Marketing digital, Gestão..."
            }
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {isClubMember ? 'Quais são seus principais desafios?' : 'Que desafios você quer superar?'}
          </Label>
          <Textarea
            value={mainChallenges}
            onChange={(e) => setMainChallenges(e.target.value)}
            placeholder={isClubMember ? 
              "Ex: Automatizar processos, Melhorar atendimento, Reduzir custos..." : 
              "Ex: Aprender novas tecnologias, Conseguir emprego, Mudar de carreira..."
            }
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Separe por vírgulas se houver múltiplos desafios
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            {isClubMember ? 'Que ferramentas você usa hoje?' : 'Que ferramentas você já conhece?'}
          </Label>
          <Input
            value={currentTools}
            onChange={(e) => setCurrentTools(e.target.value)}
            placeholder={isClubMember ? 
              "Ex: Excel, WhatsApp Business, Canva..." : 
              "Ex: Excel, PowerPoint, Photoshop..."
            }
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Separe por vírgulas. Pode deixar em branco se não usar nenhuma
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
            Vamos falar sobre IA! 🤖
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
