
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingStep5Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const weeklyLearningTimes = [
  '1-2 horas por semana',
  '3-5 horas por semana',
  '6-10 horas por semana',
  'Mais de 10 horas por semana',
  'Conforme necessário'
];

const contentPreferences = [
  { value: 'theoretical', label: 'Mais teórico (conceitos e fundamentos)' },
  { value: 'hands-on', label: 'Mais prático (implementação direta)' },
  { value: 'videos', label: 'Vídeos e tutoriais' },
  { value: 'texts', label: 'Textos e artigos' },
  { value: 'interactive', label: 'Conteúdo interativo' }
];

const bestDays = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

const bestPeriods = [
  'Manhã (6h-12h)',
  'Tarde (12h-18h)',
  'Noite (18h-22h)',
  'Madrugada (22h-6h)'
];

const MockOnboardingStep5: React.FC<MockOnboardingStep5Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const handleArrayChange = (item: string, checked: boolean, field: keyof OnboardingData) => {
    const currentArray = (data[field] as string[]) || [];
    if (checked) {
      onUpdateData({ [field]: [...currentArray, item] });
    } else {
      onUpdateData({ [field]: currentArray.filter(i => i !== item) });
    }
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
          <Clock className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Personalização da Experiência
        </h2>
        <p className="text-slate-400">
          Vamos personalizar sua jornada de aprendizado
        </p>
      </div>

      <div className="space-y-6">
        {/* Tempo de Aprendizado */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Tempo Disponível</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Quanto tempo por semana você pode dedicar ao aprendizado? *
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
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Preferências de Conteúdo</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Que tipo de conteúdo você prefere? (opcional)
              </Label>
              <div className="mt-3 space-y-3">
                {contentPreferences.map((pref) => (
                  <div key={pref.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`content-${pref.value}`}
                      checked={(data.contentPreference || []).includes(pref.value)}
                      onCheckedChange={(checked) => 
                        handleArrayChange(pref.value, checked as boolean, 'contentPreference')
                      }
                      className="border-white/20"
                    />
                    <Label 
                      htmlFor={`content-${pref.value}`}
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      {pref.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Você tem interesse em networking com outros membros? *
              </Label>
              <Select 
                value={data.wantsNetworking || ''} 
                onValueChange={(value) => onUpdateData({ wantsNetworking: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione sua preferência" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  <SelectItem value="yes" className="text-white hover:bg-white/10">
                    Sim, tenho interesse
                  </SelectItem>
                  <SelectItem value="no" className="text-white hover:bg-white/10">
                    Não, prefiro focar no aprendizado
                  </SelectItem>
                  <SelectItem value="maybe" className="text-white hover:bg-white/10">
                    Talvez, dependendo da oportunidade
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
                Quais os melhores dias para você? (opcional)
              </Label>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                {bestDays.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={(data.bestDays || []).includes(day)}
                      onCheckedChange={(checked) => 
                        handleArrayChange(day, checked as boolean, 'bestDays')
                      }
                      className="border-white/20"
                    />
                    <Label 
                      htmlFor={`day-${day}`}
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Quais os melhores períodos? (opcional)
              </Label>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {bestPeriods.map((period) => (
                  <div key={period} className="flex items-center space-x-2">
                    <Checkbox
                      id={`period-${period}`}
                      checked={(data.bestPeriods || []).includes(period)}
                      onCheckedChange={(checked) => 
                        handleArrayChange(period, checked as boolean, 'bestPeriods')
                      }
                      className="border-white/20"
                    />
                    <Label 
                      htmlFor={`period-${period}`}
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      {period}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Você aceita compartilhar seu caso de sucesso futuramente? *
              </Label>
              <Select 
                value={data.acceptsCaseStudy || ''} 
                onValueChange={(value) => onUpdateData({ acceptsCaseStudy: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione sua preferência" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  <SelectItem value="yes" className="text-white hover:bg-white/10">
                    Sim, aceito compartilhar
                  </SelectItem>
                  <SelectItem value="no" className="text-white hover:bg-white/10">
                    Não, prefiro manter privacidade
                  </SelectItem>
                  <SelectItem value="maybe" className="text-white hover:bg-white/10">
                    Talvez, dependendo do caso
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

export default MockOnboardingStep5;
