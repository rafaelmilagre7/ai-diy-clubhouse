
import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Clock, Users2, Calendar, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingStepProps } from '../types/onboardingTypes';

const weeklyLearningTimes = [
  '1-2 horas por semana',
  '3-5 horas por semana',
  '6-10 horas por semana',
  'Mais de 10 horas por semana'
];

const contentPreferences = [
  'Vídeos curtos e práticos',
  'Artigos e textos detalhados',
  'Podcasts e áudios',
  'Webinars ao vivo',
  'Workshops práticos',
  'Cases de sucesso',
  'Templates e ferramentas prontas'
];

const weekDays = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

const dayPeriods = [
  'Manhã (6h às 12h)',
  'Tarde (12h às 18h)',
  'Noite (18h às 22h)',
  'Madrugada (22h às 6h)'
];

const OnboardingStep5: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const selectedContentPreferences = data.contentPreference || [];
  const selectedBestDays = data.bestDays || [];
  const selectedBestPeriods = data.bestPeriods || [];

  const handleContentPreferenceToggle = (preference: string, checked: boolean) => {
    const currentPreferences = selectedContentPreferences;
    let newPreferences;
    
    if (checked) {
      newPreferences = [...currentPreferences, preference];
    } else {
      newPreferences = currentPreferences.filter(p => p !== preference);
    }
    
    onUpdateData({ contentPreference: newPreferences });
  };

  const handleBestDayToggle = (day: string, checked: boolean) => {
    const currentDays = selectedBestDays;
    let newDays;
    
    if (checked) {
      newDays = [...currentDays, day];
    } else {
      newDays = currentDays.filter(d => d !== day);
    }
    
    onUpdateData({ bestDays: newDays });
  };

  const handleBestPeriodToggle = (period: string, checked: boolean) => {
    const currentPeriods = selectedBestPeriods;
    let newPeriods;
    
    if (checked) {
      newPeriods = [...currentPeriods, period];
    } else {
      newPeriods = currentPeriods.filter(p => p !== period);
    }
    
    onUpdateData({ bestPeriods: newPeriods });
  };

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
          <Settings className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Personalização da Experiência
        </h2>
        <p className="text-slate-400">
          Vamos personalizar sua jornada de aprendizado para maximizar seus resultados
        </p>
      </div>

      <div className="space-y-6">
        {/* Tempo de Aprendizado */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Tempo de Aprendizado</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Quanto tempo você pode dedicar ao aprendizado semanalmente? *
              </Label>
              <Select 
                value={data.weeklyLearningTime || ''} 
                onValueChange={(value) => onUpdateData({ weeklyLearningTime: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione o tempo disponível" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {weeklyLearningTimes.map((time) => (
                    <SelectItem key={time} value={time} className="text-white hover:bg-white/10">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('weeklyLearningTime') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('weeklyLearningTime')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Preferências de Conteúdo */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-viverblue" />
              <Label className="text-slate-200 text-base font-medium">
                Que tipo de conteúdo você prefere? * (selecione pelo menos um)
              </Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contentPreferences.map((preference) => (
                <div key={preference} className="flex items-center space-x-2">
                  <Checkbox
                    id={preference}
                    checked={selectedContentPreferences.includes(preference)}
                    onCheckedChange={(checked) => handleContentPreferenceToggle(preference, checked as boolean)}
                    className="border-white/30 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                  />
                  <Label 
                    htmlFor={preference} 
                    className="text-sm text-slate-300 cursor-pointer"
                  >
                    {preference}
                  </Label>
                </div>
              ))}
            </div>
            
            {getFieldError?.('contentPreference') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('contentPreference')}</p>
            )}
          </div>
        </Card>

        {/* Networking */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Users2 className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Networking</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Tem interesse em participar de eventos de networking? *
              </Label>
              <Select 
                value={data.wantsNetworking || ''} 
                onValueChange={(value) => onUpdateData({ wantsNetworking: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione sua preferência" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  <SelectItem value="sim" className="text-white hover:bg-white/10">
                    Sim, tenho muito interesse
                  </SelectItem>
                  <SelectItem value="talvez" className="text-white hover:bg-white/10">
                    Talvez, dependendo do evento
                  </SelectItem>
                  <SelectItem value="nao" className="text-white hover:bg-white/10">
                    Não, prefiro conteúdo individual
                  </SelectItem>
                </SelectContent>
              </Select>
              {getFieldError?.('wantsNetworking') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('wantsNetworking')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Disponibilidade */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Disponibilidade</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Quais os melhores dias para você? * (selecione pelo menos um)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {weekDays.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={selectedBestDays.includes(day)}
                      onCheckedChange={(checked) => handleBestDayToggle(day, checked as boolean)}
                      className="border-white/30 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                    />
                    <Label 
                      htmlFor={day} 
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
              {getFieldError?.('bestDays') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('bestDays')}</p>
              )}
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Quais os melhores horários? * (selecione pelo menos um)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {dayPeriods.map((period) => (
                  <div key={period} className="flex items-center space-x-2">
                    <Checkbox
                      id={period}
                      checked={selectedBestPeriods.includes(period)}
                      onCheckedChange={(checked) => handleBestPeriodToggle(period, checked as boolean)}
                      className="border-white/30 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                    />
                    <Label 
                      htmlFor={period} 
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      {period}
                    </Label>
                  </div>
                ))}
              </div>
              {getFieldError?.('bestPeriods') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('bestPeriods')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Estudo de Caso */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div>
              <Label className="text-slate-200 text-base font-medium">
                Aceita que seu case seja usado como estudo de sucesso? *
              </Label>
              <Select 
                value={data.acceptsCaseStudy || ''} 
                onValueChange={(value) => onUpdateData({ acceptsCaseStudy: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione sua preferência" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  <SelectItem value="sim" className="text-white hover:bg-white/10">
                    Sim, autorizo o uso do meu case
                  </SelectItem>
                  <SelectItem value="nao" className="text-white hover:bg-white/10">
                    Não, prefiro manter privacidade
                  </SelectItem>
                  <SelectItem value="conversar" className="text-white hover:bg-white/10">
                    Vamos conversar sobre isso depois
                  </SelectItem>
                </SelectContent>
              </Select>
              {getFieldError?.('acceptsCaseStudy') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('acceptsCaseStudy')}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default OnboardingStep5;
