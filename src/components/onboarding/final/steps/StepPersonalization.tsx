
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';
import { ValidationError } from '../ValidationError';

const INTEREST_OPTIONS = [
  'Automação de Processos',
  'Análise de Dados',
  'Atendimento ao Cliente',
  'Marketing Digital',
  'Vendas',
  'Recursos Humanos',
  'Finanças',
  'Operações',
  'Inovação',
  'Estratégia'
];

const TIME_PREFERENCE_OPTIONS = [
  'Manhã (6h-12h)',
  'Tarde (12h-18h)', 
  'Noite (18h-24h)',
  'Madrugada (0h-6h)'
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

const SKILLS_OPTIONS = [
  'Gestão de Projetos',
  'Análise de Dados',
  'Marketing',
  'Vendas',
  'Tecnologia',
  'Finanças',
  'Recursos Humanos',
  'Operações',
  'Estratégia',
  'Inovação'
];

const MENTORSHIP_TOPICS_OPTIONS = [
  'Implementação de IA',
  'Automação de Processos',
  'Análise de Dados',
  'Transformação Digital',
  'Gestão de Mudanças',
  'Estratégia de Negócios',
  'Liderança',
  'Inovação'
];

export const StepPersonalization: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed
}) => {
  const handleArrayToggle = (field: keyof typeof data.personalization, value: string) => {
    const currentArray = data.personalization[field] as string[] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    onUpdate('personalization', { [field]: newArray });
  };

  const handleTimePreferenceToggle = (value: string) => {
    const currentPrefs = Array.isArray(data.personalization.time_preference) 
      ? data.personalization.time_preference 
      : data.personalization.time_preference 
        ? [data.personalization.time_preference] 
        : [];
    
    const newPrefs = currentPrefs.includes(value)
      ? currentPrefs.filter(pref => pref !== value)
      : [...currentPrefs, value];
    
    onUpdate('personalization', { time_preference: newPrefs });
  };

  const handleNetworkingAvailabilityChange = (checked: boolean) => {
    onUpdate('personalization', { networking_availability: checked });
  };

  const handleLiveInterestChange = (value: string) => {
    const numericValue = parseInt(value) || 0;
    onUpdate('personalization', { live_interest: numericValue });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Personalização da Experiência
        </h2>
        <p className="text-gray-400">
          Vamos personalizar sua experiência na plataforma
        </p>
      </div>

      <div className="space-y-6">
        {/* Interesses */}
        <div className="space-y-3">
          <Label className="text-white font-medium">
            Áreas de Interesse
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {INTEREST_OPTIONS.map(interest => (
              <div key={interest} className="flex items-center space-x-2">
                <Checkbox
                  id={`interest-${interest}`}
                  checked={(data.personalization.interests || []).includes(interest)}
                  onCheckedChange={() => handleArrayToggle('interests', interest)}
                />
                <Label htmlFor={`interest-${interest}`} className="text-sm text-gray-300">
                  {interest}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Preferência de Horário */}
        <div className="space-y-3">
          <Label className="text-white font-medium">
            Preferência de Horário para Atividades
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {TIME_PREFERENCE_OPTIONS.map(time => {
              const currentPrefs = Array.isArray(data.personalization.time_preference) 
                ? data.personalization.time_preference 
                : data.personalization.time_preference 
                  ? [data.personalization.time_preference] 
                  : [];
              
              return (
                <div key={time} className="flex items-center space-x-2">
                  <Checkbox
                    id={`time-${time}`}
                    checked={currentPrefs.includes(time)}
                    onCheckedChange={() => handleTimePreferenceToggle(time)}
                  />
                  <Label htmlFor={`time-${time}`} className="text-sm text-gray-300">
                    {time}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dias Disponíveis */}
        <div className="space-y-3">
          <Label className="text-white font-medium">
            Dias da Semana Disponíveis
          </Label>
          <div className="grid grid-cols-4 gap-3">
            {AVAILABLE_DAYS_OPTIONS.map(day => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={(data.personalization.available_days || []).includes(day)}
                  onCheckedChange={() => handleArrayToggle('available_days', day)}
                />
                <Label htmlFor={`day-${day}`} className="text-sm text-gray-300">
                  {day}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Habilidades para Compartilhar */}
        <div className="space-y-3">
          <Label className="text-white font-medium">
            Habilidades que Pode Compartilhar
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {SKILLS_OPTIONS.map(skill => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={(data.personalization.skills_to_share || []).includes(skill)}
                  onCheckedChange={() => handleArrayToggle('skills_to_share', skill)}
                />
                <Label htmlFor={`skill-${skill}`} className="text-sm text-gray-300">
                  {skill}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Tópicos de Mentoria */}
        <div className="space-y-3">
          <Label className="text-white font-medium">
            Tópicos de Interesse para Mentoria
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {MENTORSHIP_TOPICS_OPTIONS.map(topic => (
              <div key={topic} className="flex items-center space-x-2">
                <Checkbox
                  id={`mentorship-${topic}`}
                  checked={(data.personalization.mentorship_topics || []).includes(topic)}
                  onCheckedChange={() => handleArrayToggle('mentorship_topics', topic)}
                />
                <Label htmlFor={`mentorship-${topic}`} className="text-sm text-gray-300">
                  {topic}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Disponibilidade para Networking */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-white font-medium">
              Disponível para Networking
            </Label>
            <Switch
              checked={Boolean(data.personalization.networking_availability)}
              onCheckedChange={handleNetworkingAvailabilityChange}
            />
          </div>
          <p className="text-sm text-gray-400">
            Permita que outros membros da comunidade entrem em contato para networking
          </p>
        </div>

        {/* Interesse em Lives */}
        <div className="space-y-3">
          <Label className="text-white font-medium">
            Interesse em Participar de Lives (0-10)
          </Label>
          <Input
            type="number"
            min="0"
            max="10"
            value={data.personalization.live_interest?.toString() || ''}
            onChange={(e) => handleLiveInterestChange(e.target.value)}
            className="bg-gray-800/50 border-gray-600 text-white"
            placeholder="Digite um número de 0 a 10"
          />
        </div>

        {/* Permissões */}
        <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <h3 className="text-white font-medium">Permissões</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Autorizar uso de caso de sucesso</Label>
              <p className="text-sm text-gray-400">
                Permitir que sua história seja usada como caso de sucesso
              </p>
            </div>
            <Switch
              checked={Boolean(data.personalization.authorize_case_usage)}
              onCheckedChange={(checked) => onUpdate('personalization', { authorize_case_usage: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Interessado em entrevistas</Label>
              <p className="text-sm text-gray-400">
                Disponível para participar de entrevistas e depoimentos
              </p>
            </div>
            <Switch
              checked={Boolean(data.personalization.interested_in_interview)}
              onCheckedChange={(checked) => onUpdate('personalization', { interested_in_interview: checked })}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-700/50">
        {onPrevious && (
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white"
          >
            Anterior
          </Button>
        )}
        
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="ml-auto bg-viverblue hover:bg-viverblue/90"
        >
          Finalizar Onboarding
        </Button>
      </div>
    </div>
  );
};
