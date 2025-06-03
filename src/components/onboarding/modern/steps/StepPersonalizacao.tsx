
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { SliderInput } from '../SliderInput';

const INTERESTS_OPTIONS = [
  { value: 'networking', label: '🤝 Networking empresarial' },
  { value: 'mentoria', label: '👨‍🏫 Mentorias e coaching' },
  { value: 'eventos', label: '🎯 Eventos e workshops' },
  { value: 'conteudo', label: '📚 Conteúdo educativo' },
  { value: 'comunidade', label: '👥 Participação em comunidade' },
  { value: 'parcerias', label: '🤝 Oportunidades de parceria' },
  { value: 'inovacao', label: '🚀 Inovação e tendências' },
  { value: 'casos-sucesso', label: '⭐ Cases de sucesso' }
];

const TIME_PREFERENCES = [
  { value: 'manha', label: '🌅 Manhã (8h-12h)' },
  { value: 'tarde', label: '☀️ Tarde (13h-17h)' },
  { value: 'noite', label: '🌙 Noite (18h-22h)' },
  { value: 'fins-semana', label: '🏖️ Fins de semana' }
];

const SKILLS_TO_SHARE = [
  { value: 'marketing-digital', label: 'Marketing Digital' },
  { value: 'vendas', label: 'Vendas e Negociação' },
  { value: 'gestao', label: 'Gestão e Liderança' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'operacoes', label: 'Operações' },
  { value: 'rh', label: 'Recursos Humanos' },
  { value: 'juridico', label: 'Jurídico' },
  { value: 'design', label: 'Design e UX' },
  { value: 'estrategia', label: 'Estratégia' }
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
  const selectedInterests = Array.isArray(data.interests) ? data.interests : [];
  const selectedTimePrefs = Array.isArray(data.time_preference) ? data.time_preference : [];
  const selectedSkills = Array.isArray(data.skills_to_share) ? data.skills_to_share : [];

  const toggleInterest = (interest: string) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    onUpdate('interests', updated);
  };

  const toggleTimePref = (time: string) => {
    const updated = selectedTimePrefs.includes(time)
      ? selectedTimePrefs.filter(t => t !== time)
      : [...selectedTimePrefs, time];
    onUpdate('time_preference', updated);
  };

  const toggleSkill = (skill: string) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    onUpdate('skills_to_share', updated);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Personalização da experiência 🎨
        </h2>
        <p className="text-gray-400">
          Vamos personalizar sua jornada na comunidade
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            O que mais te interessa? (opcional)
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {INTERESTS_OPTIONS.map((interest) => (
              <div
                key={interest.value}
                onClick={() => toggleInterest(interest.value)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedInterests.includes(interest.value)
                    ? 'border-viverblue bg-viverblue/10 text-viverblue'
                    : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                }`}
              >
                <span className="text-sm">{interest.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Melhor horário para participar de eventos (opcional)
          </label>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TIME_PREFERENCES.map((time) => (
              <div
                key={time.value}
                onClick={() => toggleTimePref(time.value)}
                className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                  selectedTimePrefs.includes(time.value)
                    ? 'border-viverblue bg-viverblue/10 text-viverblue'
                    : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                }`}
              >
                <span className="text-sm">{time.label}</span>
              </div>
            ))}
          </div>
        </div>

        <SliderInput
          label="Interesse em networking (0-10)"
          value={data.networking_availability || 5}
          onChange={(value) => onUpdate('networking_availability', value)}
          min={0}
          max={10}
          step={1}
        />

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Habilidades que pode compartilhar (opcional)
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SKILLS_TO_SHARE.map((skill) => (
              <div
                key={skill.value}
                onClick={() => toggleSkill(skill.value)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSkills.includes(skill.value)
                    ? 'border-viverblue bg-viverblue/10 text-viverblue'
                    : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                }`}
              >
                <span className="text-sm">{skill.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-viverblue/10 to-purple-500/10 border border-viverblue/20 rounded-lg p-4">
          <p className="text-sm text-viverblue-light">
            ✨ <strong>Quase lá!</strong> Com essas informações, vamos criar uma experiência 
            personalizada e conectar você com as pessoas e oportunidades certas.
          </p>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <Button
            onClick={onPrevious}
            variant="ghost"
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Button>
          
          <div className="text-sm text-gray-400">
            Etapa {currentStep} de {totalSteps}
          </div>
          
          <Button
            onClick={onNext}
            disabled={!canProceed}
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
