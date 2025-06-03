
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { SliderInput } from '../SliderInput';
import { MultiSelectorModerno } from '../MultiSelectorModerno';

const INTERESTS_OPTIONS = [
  { value: 'automacao_processos', label: '🤖 Automação de Processos' },
  { value: 'chatbots', label: '💬 Chatbots e Assistentes Virtuais' },
  { value: 'analise_dados', label: '📊 Análise de Dados com IA' },
  { value: 'marketing_digital', label: '📱 Marketing Digital com IA' },
  { value: 'vendas', label: '💰 Otimização de Vendas' },
  { value: 'atendimento', label: '🎧 Atendimento ao Cliente' },
  { value: 'gestao', label: '📈 Gestão e Produtividade' },
  { value: 'criacao_conteudo', label: '✍️ Criação de Conteúdo' }
];

const TIME_PREFERENCE_OPTIONS = [
  { value: 'manha', label: '🌅 Manhã (06:00 - 12:00)' },
  { value: 'tarde', label: '☀️ Tarde (12:00 - 18:00)' },
  { value: 'noite', label: '🌙 Noite (18:00 - 24:00)' }
];

const AVAILABLE_DAYS_OPTIONS = [
  { value: 'segunda', label: '📅 Segunda-feira' },
  { value: 'terca', label: '📅 Terça-feira' },
  { value: 'quarta', label: '📅 Quarta-feira' },
  { value: 'quinta', label: '📅 Quinta-feira' },
  { value: 'sexta', label: '📅 Sexta-feira' },
  { value: 'sabado', label: '📅 Sábado' },
  { value: 'domingo', label: '📅 Domingo' }
];

const SKILLS_OPTIONS = [
  { value: 'marketing', label: '📊 Marketing Digital' },
  { value: 'vendas', label: '💰 Vendas' },
  { value: 'tecnologia', label: '💻 Tecnologia' },
  { value: 'gestao', label: '👥 Gestão de Equipe' },
  { value: 'financeiro', label: '💰 Financeiro' },
  { value: 'operacoes', label: '⚙️ Operações' },
  { value: 'rh', label: '👤 Recursos Humanos' },
  { value: 'design', label: '🎨 Design' }
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
  // Ensure we work with arrays
  const getArrayValue = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  const currentInterests = getArrayValue(data.interests);
  const currentTimePreference = getArrayValue(data.time_preference);
  const currentAvailableDays = getArrayValue(data.available_days);
  const currentSkills = getArrayValue(data.skills_to_share);

  const handleInterestsChange = (selectedInterests: string[]) => {
    onUpdate('interests', selectedInterests);
  };

  const handleTimePreferenceChange = (selectedTimes: string[]) => {
    onUpdate('time_preference', selectedTimes);
  };

  const handleAvailableDaysChange = (selectedDays: string[]) => {
    onUpdate('available_days', selectedDays);
  };

  const handleSkillsChange = (selectedSkills: string[]) => {
    onUpdate('skills_to_share', selectedSkills);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Personalização da experiência 🎯
        </h2>
        <p className="text-gray-400">
          Vamos personalizar sua jornada no VIVER DE IA Club
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-8">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Áreas de interesse em IA <span className="text-red-400">*</span>
          </label>
          <MultiSelectorModerno
            value={currentInterests}
            onChange={handleInterestsChange}
            options={INTERESTS_OPTIONS}
            placeholder="Selecione suas áreas de interesse..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Horários preferidos para lives/eventos
          </label>
          <MultiSelectorModerno
            value={currentTimePreference}
            onChange={handleTimePreferenceChange}
            options={TIME_PREFERENCE_OPTIONS}
            placeholder="Selecione seus horários preferidos..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Dias disponíveis para networking
          </label>
          <MultiSelectorModerno
            value={currentAvailableDays}
            onChange={handleAvailableDaysChange}
            options={AVAILABLE_DAYS_OPTIONS}
            placeholder="Selecione os dias disponíveis..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Conhecimentos que pode compartilhar
          </label>
          <MultiSelectorModerno
            value={currentSkills}
            onChange={handleSkillsChange}
            options={SKILLS_OPTIONS}
            placeholder="Selecione suas expertise..."
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Interesse em participar de lives/eventos (0-10)
          </label>
          <SliderInput
            value={typeof data.live_interest === 'number' ? data.live_interest : 5}
            onChange={(value) => onUpdate('live_interest', value)}
            min={0}
            max={10}
            step={1}
            label="Interesse em lives"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="networking"
              checked={!!data.networking_availability}
              onChange={(e) => onUpdate('networking_availability', e.target.checked)}
              className="w-4 h-4 text-viverblue bg-gray-800 border-gray-600 rounded focus:ring-viverblue"
            />
            <label htmlFor="networking" className="text-sm font-medium text-white">
              Disponível para networking com outros membros
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="authorize_case"
              checked={!!data.authorize_case_usage}
              onChange={(e) => onUpdate('authorize_case_usage', e.target.checked)}
              className="w-4 h-4 text-viverblue bg-gray-800 border-gray-600 rounded focus:ring-viverblue"
            />
            <label htmlFor="authorize_case" className="text-sm font-medium text-white">
              Autorizo uso do meu caso como exemplo (anonimizado)
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="interview"
              checked={!!data.interested_in_interview}
              onChange={(e) => onUpdate('interested_in_interview', e.target.checked)}
              className="w-4 h-4 text-viverblue bg-gray-800 border-gray-600 rounded focus:ring-viverblue"
            />
            <label htmlFor="interview" className="text-sm font-medium text-white">
              Interesse em participar de entrevistas/cases
            </label>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            🎯 <strong>Personalização:</strong> Usaremos essas informações para 
            personalizar sua experiência, recomendar conteúdos relevantes e conectar 
            você com outros membros com interesses similares.
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
