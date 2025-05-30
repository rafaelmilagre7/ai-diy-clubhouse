
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';
import { Slider } from '@/components/ui/slider';

const INTERESTS_OPTIONS = [
  'Automação de processos',
  'Análise de dados',
  'Marketing digital',
  'Atendimento ao cliente',
  'Vendas e CRM',
  'Gestão de projetos',
  'Recursos humanos',
  'Finanças e contabilidade',
  'Logística',
  'Desenvolvimento de produtos',
  'E-commerce',
  'Educação e treinamento'
];

const TIME_PREFERENCE_OPTIONS = [
  { value: 'manha', label: '🌅 Manhã (06h - 12h)' },
  { value: 'tarde', label: '☀️ Tarde (12h - 18h)' },
  { value: 'noite', label: '🌙 Noite (18h - 24h)' },
  { value: 'madrugada', label: '🌃 Madrugada (00h - 06h)' }
];

const AVAILABLE_DAYS_OPTIONS = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

const SKILLS_OPTIONS = [
  'Marketing Digital',
  'Vendas',
  'Gestão de Projetos',
  'Análise de Dados',
  'Design Gráfico',
  'Desenvolvimento Web',
  'Finanças',
  'Recursos Humanos',
  'Logística',
  'Automação',
  'Consultoria',
  'Educação'
];

const MENTORSHIP_TOPICS_OPTIONS = [
  'Estratégia de IA',
  'Implementação técnica',
  'Gestão de mudanças',
  'ROI e métricas',
  'Automação de processos',
  'Análise de dados',
  'Marketing com IA',
  'Vendas automatizadas',
  'Atendimento inteligente',
  'Inovação digital'
];

export const StepPersonalizacao: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const handleMultiSelectToggle = (field: keyof typeof data, value: string) => {
    const currentValues = (data[field] as string[]) || [];
    const isSelected = currentValues.includes(value);
    
    if (isSelected) {
      onUpdate(field, currentValues.filter(v => v !== value));
    } else {
      onUpdate(field, [...currentValues, value]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Personalização 🎨
        </h2>
        <p className="text-gray-400">
          Vamos personalizar sua experiência na Viver de IA
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Áreas de interesse <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Selecione suas áreas de interesse para personalizar conteúdo
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {INTERESTS_OPTIONS.map((interest) => {
              const isSelected = (data.interests || []).includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleMultiSelectToggle('interests', interest)}
                  className={`
                    p-3 rounded-lg border text-left text-sm transition-all
                    ${isSelected 
                      ? 'bg-viverblue/20 border-viverblue text-viverblue-light' 
                      : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{interest}</span>
                    {isSelected && (
                      <span className="text-viverblue">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Horários preferenciais <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TIME_PREFERENCE_OPTIONS.map((time) => {
              const isSelected = (data.time_preference || []).includes(time.value);
              return (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => handleMultiSelectToggle('time_preference', time.value)}
                  className={`
                    p-3 rounded-lg border text-left text-sm transition-all
                    ${isSelected 
                      ? 'bg-viverblue/20 border-viverblue text-viverblue-light' 
                      : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{time.label}</span>
                    {isSelected && (
                      <span className="text-viverblue">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Dias disponíveis <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_DAYS_OPTIONS.map((day) => {
              const isSelected = (data.available_days || []).includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleMultiSelectToggle('available_days', day.value)}
                  className={`
                    p-3 rounded-lg border text-center text-sm transition-all
                    ${isSelected 
                      ? 'bg-viverblue/20 border-viverblue text-viverblue-light' 
                      : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Disponibilidade para networking (0-10)
          </label>
          <p className="text-xs text-gray-400 mb-3">
            0 = Prefiro não participar | 10 = Muito interessado em networking
          </p>
          
          <div className="px-3">
            <Slider
              value={[data.networking_availability || 5]}
              onValueChange={(value) => onUpdate('networking_availability', value[0])}
              max={10}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>0</span>
              <span className="text-white font-medium">{data.networking_availability || 5}</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">
              Habilidades para compartilhar
            </label>
            <p className="text-xs text-gray-400 mb-3">
              O que você pode ensinar para outros membros?
            </p>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {SKILLS_OPTIONS.map((skill) => {
                const isSelected = (data.skills_to_share || []).includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleMultiSelectToggle('skills_to_share', skill)}
                    className={`
                      w-full p-2 rounded-lg border text-left text-sm transition-all
                      ${isSelected 
                        ? 'bg-green-500/20 border-green-500 text-green-400' 
                        : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{skill}</span>
                      {isSelected && <span>✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">
              Mentoria desejada
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Em que áreas gostaria de receber mentoria?
            </p>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {MENTORSHIP_TOPICS_OPTIONS.map((topic) => {
                const isSelected = (data.mentorship_topics || []).includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleMultiSelectToggle('mentorship_topics', topic)}
                    className={`
                      w-full p-2 rounded-lg border text-left text-sm transition-all
                      ${isSelected 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                        : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{topic}</span>
                      {isSelected && <span>✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-viverblue/10 to-purple-500/10 border border-viverblue/20 rounded-lg p-4">
          <p className="text-sm text-viverblue-light">
            🎉 <strong>Parabéns!</strong> Você está quase finalizando seu onboarding. 
            Essas informações nos ajudam a criar uma experiência única e personalizada para você!
          </p>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <div></div>
          
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
