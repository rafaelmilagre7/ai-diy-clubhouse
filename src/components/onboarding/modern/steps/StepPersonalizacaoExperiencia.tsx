
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const INTERESTS_OPTIONS = [
  'Automação de processos',
  'Chatbots e atendimento',
  'Análise de dados e BI',
  'Marketing digital',
  'Vendas e CRM',
  'Recursos humanos',
  'Finanças e contabilidade',
  'Operações e logística',
  'Inovação e P&D',
  'Gestão estratégica'
];

const TIME_PREFERENCE_OPTIONS = [
  'Manhã (6h - 12h)',
  'Tarde (12h - 18h)',
  'Noite (18h - 22h)',
  'Madrugada (22h - 6h)'
];

const AVAILABLE_DAYS_OPTIONS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

const SKILLS_TO_SHARE_OPTIONS = [
  'Gestão e liderança',
  'Marketing digital',
  'Vendas e negociação',
  'Tecnologia e desenvolvimento',
  'Análise de dados',
  'Finanças e investimentos',
  'Recursos humanos',
  'Operações e processos',
  'Empreendedorismo',
  'Comunicação e apresentação'
];

const MENTORSHIP_TOPICS_OPTIONS = [
  'Primeiros passos com IA',
  'Implementação de chatbots',
  'Automação de processos',
  'Análise de dados',
  'Estratégia de IA',
  'ROI em tecnologia',
  'Transformação digital',
  'Gestão de mudanças',
  'Capacitação de equipes',
  'Cases de sucesso'
];

export const StepPersonalizacaoExperiencia: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const handleInterestsChange = (interest: string, checked: boolean) => {
    const currentInterests = Array.isArray(data.interests) ? data.interests : [];
    if (checked) {
      onUpdate('interests', [...currentInterests, interest]);
    } else {
      onUpdate('interests', currentInterests.filter(i => i !== interest));
    }
  };

  const handleTimePreferenceChange = (time: string, checked: boolean) => {
    const currentTimes = Array.isArray(data.time_preference) ? data.time_preference : [];
    if (checked) {
      onUpdate('time_preference', [...currentTimes, time]);
    } else {
      onUpdate('time_preference', currentTimes.filter(t => t !== time));
    }
  };

  const handleAvailableDaysChange = (day: string, checked: boolean) => {
    const currentDays = Array.isArray(data.available_days) ? data.available_days : [];
    if (checked) {
      onUpdate('available_days', [...currentDays, day]);
    } else {
      onUpdate('available_days', currentDays.filter(d => d !== day));
    }
  };

  const handleSkillsChange = (skill: string, checked: boolean) => {
    const currentSkills = Array.isArray(data.skills_to_share) ? data.skills_to_share : [];
    if (checked) {
      onUpdate('skills_to_share', [...currentSkills, skill]);
    } else {
      onUpdate('skills_to_share', currentSkills.filter(s => s !== skill));
    }
  };

  const handleMentorshipChange = (topic: string, checked: boolean) => {
    const currentTopics = Array.isArray(data.mentorship_topics) ? data.mentorship_topics : [];
    if (checked) {
      onUpdate('mentorship_topics', [...currentTopics, topic]);
    } else {
      onUpdate('mentorship_topics', currentTopics.filter(t => t !== topic));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Personalização da experiência ✨
        </h2>
        <p className="text-gray-400">
          Vamos personalizar sua experiência na comunidade
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Principais interesses (selecione até 5)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {INTERESTS_OPTIONS.map((interest) => (
              <label key={interest} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.interests) && data.interests.includes(interest)}
                  onCheckedChange={(checked) => handleInterestsChange(interest, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Horários preferenciais para conteúdo/eventos
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TIME_PREFERENCE_OPTIONS.map((time) => (
              <label key={time} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.time_preference) && data.time_preference.includes(time)}
                  onCheckedChange={(checked) => handleTimePreferenceChange(time, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{time}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Dias da semana disponíveis
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_DAYS_OPTIONS.map((day) => (
              <label key={day} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.available_days) && data.available_days.includes(day)}
                  onCheckedChange={(checked) => handleAvailableDaysChange(day, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Interesse em networking (1 = Baixo, 10 = Alto)
          </label>
          <div className="px-4">
            <Slider
              value={[data.networking_availability || 5]}
              onValueChange={(value) => onUpdate('networking_availability', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Baixo interesse</span>
              <span className="text-viverblue font-medium">
                {data.networking_availability || 5}/10
              </span>
              <span>Alto interesse</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Habilidades que pode compartilhar com a comunidade
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SKILLS_TO_SHARE_OPTIONS.map((skill) => (
              <label key={skill} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.skills_to_share) && data.skills_to_share.includes(skill)}
                  onCheckedChange={(checked) => handleSkillsChange(skill, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{skill}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Tópicos em que gostaria de receber mentoria
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MENTORSHIP_TOPICS_OPTIONS.map((topic) => (
              <label key={topic} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.mentorship_topics) && data.mentorship_topics.includes(topic)}
                  onCheckedChange={(checked) => handleMentorshipChange(topic, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{topic}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <Button
            onClick={onPrevious}
            variant="ghost"
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Anterior</span>
          </Button>
          
          <div className="text-sm text-gray-400">
            Etapa {currentStep} de {totalSteps}
          </div>
          
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="bg-viverblue hover:bg-viverblue-dark transition-colors flex items-center gap-2"
          >
            <span>Continuar</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
