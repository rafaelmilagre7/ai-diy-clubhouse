
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const INTEREST_SUGGESTIONS = [
  'Automação de processos',
  'Marketing digital',
  'Análise de dados',
  'Atendimento ao cliente',
  'Vendas e CRM',
  'E-commerce',
  'Gestão de projetos',
  'Recursos humanos',
  'Finanças e contabilidade',
  'Operações',
  'Inovação tecnológica',
  'Sustentabilidade'
];

const TIME_PREFERENCE_OPTIONS = [
  'Manhã (06:00-12:00)',
  'Tarde (12:00-18:00)',
  'Noite (18:00-22:00)',
  'Madrugada (22:00-06:00)'
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

const SKILLS_SUGGESTIONS = [
  'Marketing digital',
  'Vendas',
  'Gestão de projetos',
  'Análise de dados',
  'Desenvolvimento',
  'Design',
  'Finanças',
  'Recursos humanos',
  'Operações',
  'Estratégia',
  'Liderança',
  'Consultoria'
];

export const StepPersonalizacao: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const addInterest = (interest: string) => {
    const currentInterests = data.interests || [];
    if (!currentInterests.includes(interest)) {
      onUpdate('interests', [...currentInterests, interest]);
    }
  };

  const removeInterest = (interest: string) => {
    const currentInterests = data.interests || [];
    onUpdate('interests', currentInterests.filter(i => i !== interest));
  };

  const toggleTimePreference = (time: string) => {
    const currentTimes = data.time_preference || [];
    if (currentTimes.includes(time)) {
      onUpdate('time_preference', currentTimes.filter(t => t !== time));
    } else {
      onUpdate('time_preference', [...currentTimes, time]);
    }
  };

  const toggleAvailableDay = (day: string) => {
    const currentDays = data.available_days || [];
    if (currentDays.includes(day)) {
      onUpdate('available_days', currentDays.filter(d => d !== day));
    } else {
      onUpdate('available_days', [...currentDays, day]);
    }
  };

  const addSkill = (skill: string) => {
    const currentSkills = data.skills_to_share || [];
    if (!currentSkills.includes(skill)) {
      onUpdate('skills_to_share', [...currentSkills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    const currentSkills = data.skills_to_share || [];
    onUpdate('skills_to_share', currentSkills.filter(s => s !== skill));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Personalização da experiência 🎨
        </h2>
        <p className="text-gray-400">
          Ajude-nos a personalizar sua jornada na plataforma
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Principais interesses (opcional)
          </label>
          
          {/* Interesses selecionados */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(data.interests || []).map((interest, index) => (
              <div
                key={index}
                className="bg-viverblue/20 text-viverblue px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>{interest}</span>
                <button
                  onClick={() => removeInterest(interest)}
                  className="text-viverblue hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Sugestões de interesses */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {INTEREST_SUGGESTIONS.map((interest, index) => (
              <button
                key={index}
                onClick={() => addInterest(interest)}
                disabled={(data.interests || []).includes(interest)}
                className={`text-left p-2 rounded-lg border transition-colors text-sm ${
                  (data.interests || []).includes(interest)
                    ? 'bg-viverblue/20 border-viverblue/40 text-viverblue cursor-not-allowed'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500'
                }`}
              >
                <Plus size={14} className="inline mr-1" />
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Horários preferidos para estudar (opcional)
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {TIME_PREFERENCE_OPTIONS.map((time, index) => (
              <button
                key={index}
                onClick={() => toggleTimePreference(time)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  (data.time_preference || []).includes(time)
                    ? 'bg-green-500/20 border-green-500/40 text-green-300'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Dias disponíveis para networking (opcional)
          </label>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {AVAILABLE_DAYS_OPTIONS.map((day, index) => (
              <button
                key={index}
                onClick={() => toggleAvailableDay(day)}
                className={`text-left p-2 rounded-lg border transition-colors text-sm ${
                  (data.available_days || []).includes(day)
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Habilidades que você pode compartilhar (opcional)
          </label>
          
          {/* Habilidades selecionadas */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(data.skills_to_share || []).map((skill, index) => (
              <div
                key={index}
                className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-orange-300 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Sugestões de habilidades */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SKILLS_SUGGESTIONS.map((skill, index) => (
              <button
                key={index}
                onClick={() => addSkill(skill)}
                disabled={(data.skills_to_share || []).includes(skill)}
                className={`text-left p-2 rounded-lg border transition-colors text-sm ${
                  (data.skills_to_share || []).includes(skill)
                    ? 'bg-orange-500/20 border-orange-500/40 text-orange-300 cursor-not-allowed'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500'
                }`}
              >
                <Plus size={14} className="inline mr-1" />
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Disponibilidade para networking (0-10)
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={data.networking_availability || 0}
            onChange={(e) => onUpdate('networking_availability', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-center text-gray-400">
            {data.networking_availability || 0}/10
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="authorize_case_usage"
              checked={data.authorize_case_usage || false}
              onChange={(e) => onUpdate('authorize_case_usage', e.target.checked)}
              className="h-4 w-4 text-viverblue border-gray-600 rounded focus:ring-viverblue/50"
            />
            <label htmlFor="authorize_case_usage" className="text-sm text-white">
              Autorizo o uso do meu caso como exemplo (anonimizado)
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="interested_in_interview"
              checked={data.interested_in_interview || false}
              onChange={(e) => onUpdate('interested_in_interview', e.target.checked)}
              className="h-4 w-4 text-viverblue border-gray-600 rounded focus:ring-viverblue/50"
            />
            <label htmlFor="interested_in_interview" className="text-sm text-white">
              Tenho interesse em participar de entrevistas/cases
            </label>
          </div>
        </div>

        <div className="bg-gradient-to-r from-viverblue/10 to-purple-500/10 border border-viverblue/20 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            🎉 <strong>Quase pronto!</strong> Essas informações nos ajudam a personalizar 
            sua experiência, conectar você com pessoas relevantes e sugerir conteúdos adequados ao seu perfil.
          </p>
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
            className="bg-gradient-to-r from-viverblue to-purple-600 hover:from-viverblue-dark hover:to-purple-700 transition-all flex items-center gap-2"
          >
            <span>Finalizar</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
