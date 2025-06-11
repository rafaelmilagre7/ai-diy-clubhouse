
import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '../types/onboardingTypes';
import { Settings, Clock, BookOpen, Users, Calendar, CheckCircle } from 'lucide-react';

interface OnboardingStep5Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  onNext: () => Promise<void>;
  onPrev: () => void;
  memberType: 'club' | 'formacao';
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
}

const OnboardingStep5: React.FC<OnboardingStep5Props> = ({
  data,
  onUpdateData,
  validationErrors,
  getFieldError
}) => {
  const handleDayChange = (day: string, checked: boolean) => {
    const currentDays = data.bestDays || [];
    if (checked) {
      onUpdateData({ bestDays: [...currentDays, day] });
    } else {
      onUpdateData({ bestDays: currentDays.filter(d => d !== day) });
    }
  };

  const handlePeriodChange = (period: string, checked: boolean) => {
    const currentPeriods = data.bestPeriods || [];
    if (checked) {
      onUpdateData({ bestPeriods: [...currentPeriods, period] });
    } else {
      onUpdateData({ bestPeriods: currentPeriods.filter(p => p !== period) });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-viverblue/20 rounded-full flex items-center justify-center">
          <Settings className="w-8 h-8 text-viverblue" />
        </div>
        
        <h1 className="text-3xl font-bold text-white">
          Personalização da Experiência
        </h1>
        
        <p className="text-xl text-slate-300">
          Configure sua experiência de aprendizado
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1A1E2E] rounded-xl p-6 border border-white/10 space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="weeklyLearningTime" className="text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tempo Semanal para Aprendizado *
            </Label>
            <Select value={data.weeklyLearningTime || ''} onValueChange={(value) => onUpdateData({ weeklyLearningTime: value })}>
              <SelectTrigger className="bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione o tempo disponível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2h">1-2 horas por semana</SelectItem>
                <SelectItem value="3-5h">3-5 horas por semana</SelectItem>
                <SelectItem value="6-10h">6-10 horas por semana</SelectItem>
                <SelectItem value="10h+">Mais de 10 horas por semana</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('weeklyLearningTime') && (
              <p className="text-red-400 text-sm">{getFieldError('weeklyLearningTime')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentPreference" className="text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Preferência de Conteúdo *
            </Label>
            <Select value={data.contentPreference || ''} onValueChange={(value) => onUpdateData({ contentPreference: value })}>
              <SelectTrigger className="bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Como prefere aprender?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theoretical">Mais teórico/conceitual</SelectItem>
                <SelectItem value="hands-on">Mais prático/hands-on</SelectItem>
                <SelectItem value="balanced">Equilibrio entre teoria e prática</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('contentPreference') && (
              <p className="text-red-400 text-sm">{getFieldError('contentPreference')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wantsNetworking" className="text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Interesse em Networking *
            </Label>
            <Select value={data.wantsNetworking || ''} onValueChange={(value) => onUpdateData({ wantsNetworking: value })}>
              <SelectTrigger className="bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Tem interesse em networking?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Sim, tenho muito interesse</SelectItem>
                <SelectItem value="no">Não, prefiro focar no conteúdo</SelectItem>
                <SelectItem value="maybe">Talvez, depende da oportunidade</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('wantsNetworking') && (
              <p className="text-red-400 text-sm">{getFieldError('wantsNetworking')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="acceptsCaseStudy" className="text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Case de Sucesso *
            </Label>
            <Select value={data.acceptsCaseStudy || ''} onValueChange={(value) => onUpdateData({ acceptsCaseStudy: value })}>
              <SelectTrigger className="bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Aceitaria participar de um case?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Sim, adoraria compartilhar minha experiência</SelectItem>
                <SelectItem value="no">Não, prefiro manter privacidade</SelectItem>
                <SelectItem value="maybe">Talvez, dependendo do caso</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('acceptsCaseStudy') && (
              <p className="text-red-400 text-sm">{getFieldError('acceptsCaseStudy')}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Melhores Dias da Semana *
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day}`}
                    checked={(data.bestDays || []).includes(day)}
                    onCheckedChange={(checked) => handleDayChange(day, checked as boolean)}
                  />
                  <Label htmlFor={`day-${day}`} className="text-sm text-white">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
            {getFieldError('bestDays') && (
              <p className="text-red-400 text-sm">{getFieldError('bestDays')}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Melhores Períodos do Dia *
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Manhã (6h-12h)', 'Tarde (12h-18h)', 'Noite (18h-24h)'].map((period) => (
                <div key={period} className="flex items-center space-x-2">
                  <Checkbox
                    id={`period-${period}`}
                    checked={(data.bestPeriods || []).includes(period)}
                    onCheckedChange={(checked) => handlePeriodChange(period, checked as boolean)}
                  />
                  <Label htmlFor={`period-${period}`} className="text-sm text-white">
                    {period}
                  </Label>
                </div>
              ))}
            </div>
            {getFieldError('bestPeriods') && (
              <p className="text-red-400 text-sm">{getFieldError('bestPeriods')}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingStep5;
