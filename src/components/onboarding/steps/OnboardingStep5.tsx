
import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Clock, Users, Bell, Calendar, Sun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingStepProps } from '../types/onboardingTypes';

const learningTimeOptions = [
  '1-2 horas por semana',
  '3-5 horas por semana',
  '6-10 horas por semana',
  'Mais de 10 horas por semana',
  'Conforme a necessidade'
];

const contentPreferences = [
  'Vídeos tutoriais',
  'Artigos e guias escritos',
  'Webinars ao vivo',
  'Cases práticos',
  'Templates e ferramentas',
  'Podcasts',
  'Comunidade e networking',
  'Mentoria 1:1'
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
  'Manhã (08:00 - 12:00)',
  'Tarde (12:00 - 18:00)',
  'Noite (18:00 - 22:00)'
];

const OnboardingStep5: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const selectedPreferences = Array.isArray(data.contentPreference) ? data.contentPreference : [];
  const selectedDays = data.bestDays || [];
  const selectedPeriods = data.bestPeriods || [];

  const handlePreferenceToggle = (preference: string, checked: boolean) => {
    const currentPreferences = selectedPreferences;
    let newPreferences;
    
    if (checked) {
      newPreferences = [...currentPreferences, preference];
    } else {
      newPreferences = currentPreferences.filter(p => p !== preference);
    }
    
    onUpdateData({ contentPreference: newPreferences });
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    const currentDays = selectedDays;
    let newDays;
    
    if (checked) {
      newDays = [...currentDays, day];
    } else {
      newDays = currentDays.filter(d => d !== day);
    }
    
    onUpdateData({ bestDays: newDays });
  };

  const handlePeriodToggle = (period: string, checked: boolean) => {
    const currentPeriods = selectedPeriods;
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
          Vamos personalizar sua jornada de aprendizado e definir suas preferências
        </p>
      </div>

      <div className="space-y-6">
        {/* Tempo de Aprendizado */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Dedicação ao Aprendizado</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Quanto tempo você pode dedicar ao aprendizado por semana? *
              </Label>
              <Select 
                value={data.weeklyLearningTime || ''} 
                onValueChange={(value) => onUpdateData({ weeklyLearningTime: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione seu tempo disponível" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {learningTimeOptions.map((time) => (
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
              <Bell className="w-5 h-5 text-viverblue" />
              <Label className="text-slate-200 text-base font-medium">
                Como você prefere aprender? *
              </Label>
            </div>
            <p className="text-sm text-slate-400">
              Selecione todas as opções que fazem sentido para você
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contentPreferences.map((preference) => (
                <div key={preference} className="flex items-center space-x-3">
                  <Checkbox
                    id={preference}
                    checked={selectedPreferences.includes(preference)}
                    onCheckedChange={(checked) => handlePreferenceToggle(preference, checked as boolean)}
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
            
            {selectedPreferences.length > 0 && (
              <div className="mt-4 p-3 bg-viverblue/10 border border-viverblue/30 rounded-lg">
                <p className="text-sm text-viverblue font-medium">
                  {selectedPreferences.length} preferência(s) selecionada(s)
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Networking */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Networking e Comunidade</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Você tem interesse em participar de networking e eventos?
              </Label>
              <Select 
                value={data.wantsNetworking || ''} 
                onValueChange={(value) => onUpdateData({ wantsNetworking: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione seu interesse" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  <SelectItem value="yes" className="text-white hover:bg-white/10">
                    Sim, tenho muito interesse
                  </SelectItem>
                  <SelectItem value="maybe" className="text-white hover:bg-white/10">
                    Talvez, dependendo do formato
                  </SelectItem>
                  <SelectItem value="no" className="text-white hover:bg-white/10">
                    Não, prefiro focar no conteúdo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Horários e Disponibilidade */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Disponibilidade para Encontros</h3>
            </div>

            {/* Melhores dias da semana */}
            <div>
              <Label className="text-slate-200 text-base font-medium">
                Qual o melhor dia da semana para encontros ao vivo? *
              </Label>
              <p className="text-sm text-slate-400 mb-3">
                Selecione todos os dias que funcionam para você
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {weekDays.map((day) => (
                  <div key={day} className="flex items-center space-x-3">
                    <Checkbox
                      id={day}
                      checked={selectedDays.includes(day)}
                      onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
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

            {/* Melhores períodos do dia */}
            <div>
              <Label className="text-slate-200 text-base font-medium">
                Qual melhor período do dia? *
              </Label>
              <p className="text-sm text-slate-400 mb-3">
                Selecione todos os períodos que funcionam para você
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {dayPeriods.map((period) => (
                  <div key={period} className="flex items-center space-x-3">
                    <Checkbox
                      id={period}
                      checked={selectedPeriods.includes(period)}
                      onCheckedChange={(checked) => handlePeriodToggle(period, checked as boolean)}
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

        {/* Case de Sucesso */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Compartilhamento de Sucesso</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Aceita ser um case de sucesso do Viver de IA? *
              </Label>
              <p className="text-sm text-slate-400 mb-3">
                Caso obtenha resultados positivos, gostaria de compartilhar sua história?
              </p>
              <Select 
                value={data.acceptsCaseStudy || ''} 
                onValueChange={(value) => onUpdateData({ acceptsCaseStudy: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione sua resposta" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  <SelectItem value="yes" className="text-white hover:bg-white/10">
                    Sim, adoraria compartilhar minha história
                  </SelectItem>
                  <SelectItem value="maybe" className="text-white hover:bg-white/10">
                    Talvez, dependendo dos resultados
                  </SelectItem>
                  <SelectItem value="no" className="text-white hover:bg-white/10">
                    Não, prefiro manter privacidade
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
