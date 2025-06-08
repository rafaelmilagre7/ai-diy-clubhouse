
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Monitor, Users, Award, ChevronLeft } from 'lucide-react';
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
  onPrev,
  memberType,
  getFieldError
}: OnboardingStepProps) => {
  const [weeklyLearningTime, setWeeklyLearningTime] = useState(data.weeklyLearningTime || '');
  const [contentPreference, setContentPreference] = useState<'theoretical' | 'hands-on' | ''>(data.contentPreference || '');
  const [wantsNetworking, setWantsNetworking] = useState<'yes' | 'no' | ''>(data.wantsNetworking || '');
  const [bestDays, setBestDays] = useState<string[]>(data.bestDays || []);
  const [bestPeriods, setBestPeriods] = useState<string[]>(data.bestPeriods || []);
  const [acceptsCaseStudy, setAcceptsCaseStudy] = useState<'yes' | 'no' | ''>(data.acceptsCaseStudy || '');

  // Atualizar dados globais sempre que o estado local mudar
  useEffect(() => {
    const currentData = { 
      weeklyLearningTime,
      contentPreference,
      wantsNetworking,
      bestDays,
      bestPeriods,
      acceptsCaseStudy
    };
    onUpdateData(currentData);
  }, [weeklyLearningTime, contentPreference, wantsNetworking, bestDays, bestPeriods, acceptsCaseStudy, onUpdateData]);

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
    // Usar os dados locais atuais para validação
    const currentData = {
      weeklyLearningTime,
      contentPreference,
      wantsNetworking,
      acceptsCaseStudy
    };

    if (!currentData.weeklyLearningTime || !currentData.contentPreference || !currentData.wantsNetworking || !currentData.acceptsCaseStudy) {
      console.log('[OnboardingStep5] Campos obrigatórios faltando:', currentData);
      return;
    }

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

    const finalData = { 
      weeklyLearningTime,
      contentPreference,
      wantsNetworking,
      bestDays,
      bestPeriods,
      acceptsCaseStudy,
      aiFinalMessage
    };
    
    onUpdateData(finalData);
    onNext();
  };

  const handlePrev = () => {
    onPrev();
  };

  const weeklyTimeError = getFieldError?.('weeklyLearningTime');
  const contentPreferenceError = getFieldError?.('contentPreference');
  const networkingError = getFieldError?.('wantsNetworking');
  const caseStudyError = getFieldError?.('acceptsCaseStudy');

  const canProceed = weeklyLearningTime && contentPreference && wantsNetworking && acceptsCaseStudy;

  return (
    <div className="space-y-8">
      {/* Mensagem da IA da etapa anterior */}
      {data.aiMessage4 && (
        <AIMessageDisplay message={data.aiMessage4} />
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 flex items-center justify-center"
          >
            <Award className="w-10 h-10 text-viverblue" />
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-heading font-bold text-white"
          >
            Personalização final da{' '}
            <span className="bg-gradient-to-r from-viverblue to-viverblue-light bg-clip-text text-transparent">
              experiência! ✨
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed"
          >
            Últimos detalhes para criar uma experiência única e personalizada para você!
          </motion.p>
        </div>
      </motion.div>

      {/* Formulário */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-[#151823] border border-white/10 rounded-2xl p-8">
          <div className="space-y-8">
            {/* Seção de tempo e conteúdo */}
            <div className="space-y-6">
              <h3 className="text-xl font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-viverblue" />
                </div>
                Preferências de Aprendizado
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">
                    Quanto tempo semanal você pode dedicar? *
                  </Label>
                  <Select value={weeklyLearningTime} onValueChange={setWeeklyLearningTime}>
                    <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${weeklyTimeError ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Selecione o tempo disponível" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151823] border-white/10">
                      {weeklyLearningTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {weeklyTimeError && (
                    <p className="text-sm text-red-400">{weeklyTimeError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Que tipo de conteúdo prefere? *
                  </Label>
                  <Select value={contentPreference} onValueChange={(value: 'theoretical' | 'hands-on') => setContentPreference(value)}>
                    <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${contentPreferenceError ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Selecione sua preferência" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151823] border-white/10">
                      <SelectItem value="theoretical">📚 Mais teórico e conceitual</SelectItem>
                      <SelectItem value="hands-on">⚡ Mais prático e mão na massa</SelectItem>
                    </SelectContent>
                  </Select>
                  {contentPreferenceError && (
                    <p className="text-sm text-red-400">{contentPreferenceError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seção de networking */}
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-viverblue" />
                </div>
                Networking e Comunidade
              </h3>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Quer participar de networking com outros membros? *
                </Label>
                <Select value={wantsNetworking} onValueChange={(value: 'yes' | 'no') => setWantsNetworking(value)}>
                  <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${networkingError ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione sua preferência" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151823] border-white/10">
                    <SelectItem value="yes">✅ Sim, quero conhecer outros membros</SelectItem>
                    <SelectItem value="no">❌ Não, prefiro focar nos estudos</SelectItem>
                  </SelectContent>
                </Select>
                {networkingError && (
                  <p className="text-sm text-red-400">{networkingError}</p>
                )}
              </div>
            </div>

            {/* Seção de dias e horários - sempre visível */}
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-viverblue" />
                </div>
                Encontros ao Vivo
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white">
                    Melhores dias para encontros ao vivo (opcional):
                  </Label>
                  <div className="grid grid-cols-2 gap-2 p-4 border border-white/10 rounded-lg bg-[#181A2A] max-h-40 overflow-y-auto">
                    {bestDaysList.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={bestDays.includes(day)}
                          onCheckedChange={(checked) => handleBestDayChange(day, checked as boolean)}
                          className="border-white/20"
                        />
                        <Label htmlFor={day} className="text-sm text-white cursor-pointer">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white">
                    Melhores horários para encontros ao vivo (opcional):
                  </Label>
                  <div className="space-y-2 p-4 border border-white/10 rounded-lg bg-[#181A2A]">
                    {bestPeriodsList.map((period) => (
                      <div key={period} className="flex items-center space-x-2">
                        <Checkbox
                          id={period}
                          checked={bestPeriods.includes(period)}
                          onCheckedChange={(checked) => handleBestPeriodChange(period, checked as boolean)}
                          className="border-white/20"
                        />
                        <Label htmlFor={period} className="text-sm text-white cursor-pointer">
                          {period}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de case study */}
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Award className="w-4 h-4 text-viverblue" />
                </div>
                Inspiração para Outros
              </h3>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Aceita que usemos seu case de sucesso como exemplo? *
                </Label>
                <Select value={acceptsCaseStudy} onValueChange={(value: 'yes' | 'no') => setAcceptsCaseStudy(value)}>
                  <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${caseStudyError ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione sua preferência" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151823] border-white/10">
                    <SelectItem value="yes">✅ Sim, adoraria inspirar outros</SelectItem>
                    <SelectItem value="no">❌ Não, prefiro privacidade</SelectItem>
                  </SelectContent>
                </Select>
                {caseStudyError && (
                  <p className="text-sm text-red-400">{caseStudyError}</p>
                )}
                <p className="text-xs text-neutral-400">
                  Casos de sucesso ajudam outros membros a se inspirarem na jornada
                </p>
              </div>
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex items-center gap-2 h-12 px-6 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/30"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>

              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                size="lg"
                className="h-12 px-8 bg-viverblue hover:bg-viverblue-dark text-[#0F111A] text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Finalizar onboarding! 🎉
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dica */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="bg-viverblue/5 border border-viverblue/20 rounded-xl p-4 text-center max-w-2xl mx-auto"
      >
        <p className="text-sm text-neutral-300">
          💡 <strong className="text-white">Última etapa:</strong> Quase lá! Vamos finalizar sua jornada personalizada! 🚀
        </p>
      </motion.div>
    </div>
  );
};
