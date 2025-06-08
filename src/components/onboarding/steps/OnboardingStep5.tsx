
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Monitor, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';

const weeklyLearningTimes = [
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
  'Manhã (6h-12h)',
  'Tarde (12h-18h)',
  'Noite (18h-22h)',
  'Madrugada (22h-6h)'
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

  const handleBestDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setBestDays([...bestDays, day]);
    } else {
      setBestDays(bestDays.filter(d => d !== day));
    }
  };

  const handleBestPeriodChange = (period: string, checked: boolean) => {
    if (checked) {
      setBestPeriods([...bestPeriods, period]);
    } else {
      setBestPeriods(bestPeriods.filter(p => p !== period));
    }
  };

  const handleNext = () => {
    // Gerar mensagem final da IA
    const firstName = data.name?.split(' ')[0] || 'Amigo';
    const timeComment = weeklyLearningTime.includes('10') ? 
      'Uau! Com mais de 10 horas semanais você vai voar na implementação! ' :
      weeklyLearningTime.includes('6-10') ?
      'Excelente! Com 6-10 horas semanais teremos resultados incríveis! ' :
      'Perfeito! Vamos otimizar ao máximo seu tempo de aprendizado! ';

    const networkingComment = wantsNetworking === 'yes' ? 
      'E que demais que você quer fazer networking - nossa comunidade vai adorar te conhecer! ' :
      'Tudo bem não querer networking agora, vamos focar no seu crescimento! ';

    const contentComment = contentPreference === 'hands-on' ? 
      'Adoro pessoas práticas como você! ' :
      'Perfeita escolha em equilibrar teoria e prática! ';

    const aiFinalMessage = `${firstName}, ESTOU MUITO EMPOLGADO! 🎉 ${timeComment}${contentComment}${networkingComment}Agora vou criar um plano de implementação 100% personalizado para você baseado em tudo que conversamos. Prepare-se para uma jornada transformadora! 🚀✨`;

    onUpdateData({ 
      weeklyLearningTime,
      contentPreference,
      wantsNetworking,
      bestDays,
      bestPeriods,
      acceptsCaseStudy,
      aiFinalMessage
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
            <Award className="w-8 h-8 text-viverblue" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Personalização final da experiência! ✨
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Últimos detalhes para criar uma experiência única e personalizada para você!
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
            Quanto tempo semanal você pode dedicar? *
          </Label>
          <Select value={weeklyLearningTime} onValueChange={setWeeklyLearningTime}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tempo disponível" />
            </SelectTrigger>
            <SelectContent>
              {weeklyLearningTimes.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Que tipo de conteúdo prefere? *
          </Label>
          <Select value={contentPreference} onValueChange={(value: 'theoretical' | 'hands-on') => setContentPreference(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua preferência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="theoretical">📚 Mais teórico e conceitual</SelectItem>
              <SelectItem value="hands-on">⚡ Mais prático e mão na massa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Quer participar de networking com outros membros? *
          </Label>
          <Select value={wantsNetworking} onValueChange={(value: 'yes' | 'no') => setWantsNetworking(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua preferência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">✅ Sim, quero conhecer outros membros</SelectItem>
              <SelectItem value="no">❌ Não, prefiro focar nos estudos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {wantsNetworking === 'yes' && (
          <>
            <div className="space-y-3">
              <Label>Melhores dias para eventos/networking (opcional):</Label>
              <div className="grid grid-cols-2 gap-2">
                {bestDaysList.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={bestDays.includes(day)}
                      onCheckedChange={(checked) => handleBestDayChange(day, checked as boolean)}
                    />
                    <Label htmlFor={day} className="text-sm cursor-pointer">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Melhores horários (opcional):</Label>
              <div className="grid grid-cols-1 gap-2">
                {bestPeriodsList.map((period) => (
                  <div key={period} className="flex items-center space-x-2">
                    <Checkbox
                      id={period}
                      checked={bestPeriods.includes(period)}
                      onCheckedChange={(checked) => handleBestPeriodChange(period, checked as boolean)}
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
            <Award className="w-4 h-4" />
            Aceita que usemos seu case de sucesso como exemplo? *
          </Label>
          <Select value={acceptsCaseStudy} onValueChange={(value: 'yes' | 'no') => setAcceptsCaseStudy(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua preferência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">✅ Sim, adoraria inspirar outros</SelectItem>
              <SelectItem value="no">❌ Não, prefiro privacidade</SelectItem>
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
            Finalizar onboarding! 🎉
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
          💡 <strong>Última etapa:</strong> Quase lá! Vamos finalizar sua jornada personalizada! 🚀
        </p>
      </motion.div>
    </div>
  );
};
