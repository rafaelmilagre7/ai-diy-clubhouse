
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, BookOpen, Users, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';

const weeklyTimes = [
  '1-2 horas por semana',
  '3-5 horas por semana',
  '6-10 horas por semana',
  'Mais de 10 horas por semana'
];

const bestDaysList = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

const bestPeriodsList = [
  'Manhã (7h-12h)',
  'Tarde (12h-18h)',
  'Noite (18h-22h)',
  'Madrugada (22h-7h)'
];

export const OnboardingStep5 = ({ 
  data, 
  onUpdateData, 
  onNext, 
  memberType 
}: OnboardingStepProps) => {
  const [weeklyLearningTime, setWeeklyLearningTime] = useState(data.weeklyLearningTime || '');
  const [contentPreference, setContentPreference] = useState<'theoretical' | 'hands-on' | ''>(data.contentPreference || '');
  const [wantsNetworking, setWantsNetworking] = useState<'yes' | 'no' | ''>(data.wantsNetworking || '');
  const [bestDays, setBestDays] = useState<string[]>(data.bestDays || []);
  const [bestPeriods, setBestPeriods] = useState<string[]>(data.bestPeriods || []);
  const [acceptsCaseStudy, setAcceptsCaseStudy] = useState<'yes' | 'no' | ''>(data.acceptsCaseStudy || '');

  const handleDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setBestDays([...bestDays, day]);
    } else {
      setBestDays(bestDays.filter(d => d !== day));
    }
  };

  const handlePeriodChange = (period: string, checked: boolean) => {
    if (checked) {
      setBestPeriods([...bestPeriods, period]);
    } else {
      setBestPeriods(bestPeriods.filter(p => p !== period));
    }
  };

  const handleNext = () => {
    // Gerar mensagem personalizada da IA baseada nas respostas
    const firstName = data.name?.split(' ')[0] || 'Amigo';
    
    const timeComment = weeklyLearningTime.includes('10') ? 
      'Uau! Com mais de 10 horas por semana você vai acelerar muito! ' : 
      weeklyLearningTime.includes('6-10') ? 
      'Excelente dedicação! 6-10 horas por semana é o ideal! ' : 
      'Perfeito! Vamos otimizar cada minuto do seu tempo! ';

    const networkingComment = wantsNetworking === 'yes' ? 
      'E que ótimo que quer networking - nossos encontros são incríveis! ' : 
      'Sem problemas sobre networking, vamos focar no seu aprendizado individual! ';

    const caseComment = acceptsCaseStudy === 'yes' ? 
      'E adorei que topou ser um case! Vamos fazer você brilhar! ✨' : 
      'Sem problemas sobre o case, seu sucesso já será uma vitória! ';

    const aiMessage = `${firstName}, AGORA SIM! ${timeComment}${networkingComment}${caseComment} Sua experiência está 100% personalizada! Vou processar todas essas informações e criar um plano INCRÍVEL para você! 🚀`;

    onUpdateData({ 
      weeklyLearningTime,
      contentPreference,
      wantsNetworking,
      bestDays,
      bestPeriods,
      acceptsCaseStudy,
      aiMessage5: aiMessage
    });
    onNext();
  };

  const canProceed = weeklyLearningTime && contentPreference && wantsNetworking && acceptsCaseStudy;

  return (
    <div className="space-y-8">
      {/* Mensagem da IA da etapa anterior */}
      {data.aiMessage4 && (
        <AIMessageDisplay message={data.aiMessage4} />
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 p-4 rounded-full">
            <Sparkles className="w-8 h-8 text-viverblue" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Personalização da sua experiência! ✨
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Últimos detalhes para criar a experiência mais personalizada possível para você!
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
            <Clock className="w-4 h-4" />
            Quanto tempo por semana pode dedicar ao aprendizado? *
          </Label>
          <Select value={weeklyLearningTime} onValueChange={setWeeklyLearningTime}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tempo disponível" />
            </SelectTrigger>
            <SelectContent>
              {weeklyTimes.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Prefere conteúdo teórico ou hands-on? *
          </Label>
          <Select value={contentPreference} onValueChange={(value: 'theoretical' | 'hands-on') => setContentPreference(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua preferência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="theoretical">📚 Teórico - Explicações detalhadas e conceitos</SelectItem>
              <SelectItem value="hands-on">⚡ Hands-on - Prática direto ao ponto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Quer participar de networking com outros empresários? *
          </Label>
          <Select value={wantsNetworking} onValueChange={(value: 'yes' | 'no') => setWantsNetworking(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua preferência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">✅ Sim, adoro networking!</SelectItem>
              <SelectItem value="no">❌ Não, prefiro focar no aprendizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {wantsNetworking === 'yes' && (
          <>
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Qual o melhor dia para encontros ao vivo? (pode marcar vários)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {bestDaysList.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={bestDays.includes(day)}
                      onCheckedChange={(checked) => handleDayChange(day, checked as boolean)}
                    />
                    <Label htmlFor={day} className="text-sm cursor-pointer">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Qual melhor período do dia? (pode marcar vários)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {bestPeriodsList.map((period) => (
                  <div key={period} className="flex items-center space-x-2">
                    <Checkbox
                      id={period}
                      checked={bestPeriods.includes(period)}
                      onCheckedChange={(checked) => handlePeriodChange(period, checked as boolean)}
                    />
                    <Label htmlFor={period} className="text-sm cursor-pointer">
                      {period}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Aceita ser um case de sucesso do VIVER DE IA? *
          </Label>
          <Select value={acceptsCaseStudy} onValueChange={(value: 'yes' | 'no') => setAcceptsCaseStudy(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua resposta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">✅ Sim, adoraria compartilhar meu sucesso!</SelectItem>
              <SelectItem value="no">❌ Não, prefiro manter privacidade</SelectItem>
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
            Finalizar Onboarding! 🎉
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
          💡 <strong>Etapa 5 de 5:</strong> Última etapa! Sua experiência será incrível! ✨
        </p>
      </motion.div>
    </div>
  );
};
