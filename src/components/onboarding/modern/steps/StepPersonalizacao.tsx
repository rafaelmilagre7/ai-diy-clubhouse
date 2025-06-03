
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { MultiSelectorModerno } from '../MultiSelectorModerno';

const INTERESTS_OPTIONS = [
  { value: 'automatizacao', label: '🤖 Automação de processos' },
  { value: 'marketing', label: '📊 Marketing digital' },
  { value: 'vendas', label: '💰 Automação de vendas' },
  { value: 'atendimento', label: '💬 Atendimento ao cliente' },
  { value: 'analise_dados', label: '📈 Análise de dados' },
  { value: 'desenvolvimento', label: '💻 Desenvolvimento de software' },
  { value: 'design', label: '🎨 Design e criatividade' },
  { value: 'gestao', label: '📋 Gestão e produtividade' },
  { value: 'financeiro', label: '💳 Gestão financeira' },
  { value: 'rh', label: '👥 Recursos humanos' },
];

const TIME_PREFERENCE_OPTIONS = [
  { value: 'manha', label: '🌅 Manhã (6h - 12h)' },
  { value: 'tarde', label: '☀️ Tarde (12h - 18h)' },
  { value: 'noite', label: '🌙 Noite (18h - 24h)' },
  { value: 'madrugada', label: '🌃 Madrugada (0h - 6h)' },
];

const AVAILABLE_DAYS_OPTIONS = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

const SKILLS_OPTIONS = [
  { value: 'marketing_digital', label: '📱 Marketing Digital' },
  { value: 'vendas', label: '💼 Vendas' },
  { value: 'design', label: '🎨 Design' },
  { value: 'desenvolvimento', label: '💻 Desenvolvimento' },
  { value: 'gestao_projetos', label: '📊 Gestão de Projetos' },
  { value: 'analise_dados', label: '📈 Análise de Dados' },
  { value: 'atendimento_cliente', label: '🎧 Atendimento ao Cliente' },
  { value: 'financeiro', label: '💰 Gestão Financeira' },
  { value: 'recursos_humanos', label: '👥 Recursos Humanos' },
  { value: 'consultoria', label: '🎯 Consultoria' },
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
  const handleInterestsChange = (newInterests: string[]) => {
    onUpdate('interests', newInterests);
  };

  const handleInterestsRemove = (interestToRemove: string) => {
    const currentInterests = Array.isArray(data.interests) ? data.interests : [];
    const updatedInterests = currentInterests.filter(interest => interest !== interestToRemove);
    onUpdate('interests', updatedInterests);
  };

  const handleTimePreferenceChange = (newTimePrefs: string[]) => {
    onUpdate('time_preference', newTimePrefs);
  };

  const handleTimePreferenceRemove = (timeToRemove: string) => {
    const currentTimePrefs = Array.isArray(data.time_preference) 
      ? data.time_preference 
      : typeof data.time_preference === 'string' 
        ? [data.time_preference] 
        : [];
    const updatedTimePrefs = currentTimePrefs.filter((time: string) => time !== timeToRemove);
    onUpdate('time_preference', updatedTimePrefs);
  };

  const handleAvailableDaysChange = (newDays: string[]) => {
    onUpdate('available_days', newDays);
  };

  const handleAvailableDaysRemove = (dayToRemove: string) => {
    const currentDays = Array.isArray(data.available_days) ? data.available_days : [];
    const updatedDays = currentDays.filter(day => day !== dayToRemove);
    onUpdate('available_days', updatedDays);
  };

  const handleSkillsChange = (newSkills: string[]) => {
    onUpdate('skills_to_share', newSkills);
  };

  const handleSkillsRemove = (skillToRemove: string) => {
    const currentSkills = Array.isArray(data.skills_to_share) ? data.skills_to_share : [];
    const updatedSkills = currentSkills.filter(skill => skill !== skillToRemove);
    onUpdate('skills_to_share', updatedSkills);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Personalização da experiência 🎯
        </h2>
        <p className="text-gray-400">
          Vamos personalizar sua experiência na comunidade
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-8">
        <MultiSelectorModerno
          title="Áreas de interesse"
          description="Selecione as áreas que mais te interessam"
          options={INTERESTS_OPTIONS}
          selectedValues={Array.isArray(data.interests) ? data.interests : []}
          onSelectionChange={handleInterestsChange}
          onRemove={handleInterestsRemove}
          placeholder="Clique para selecionar suas áreas de interesse"
          emptyMessage="Nenhuma área selecionada"
        />

        <MultiSelectorModerno
          title="Horários preferenciais"
          description="Quando você prefere participar de atividades?"
          options={TIME_PREFERENCE_OPTIONS}
          selectedValues={Array.isArray(data.time_preference) 
            ? data.time_preference 
            : typeof data.time_preference === 'string' 
              ? [data.time_preference] 
              : []
          }
          onSelectionChange={handleTimePreferenceChange}
          onRemove={handleTimePreferenceRemove}
          placeholder="Selecione seus horários preferenciais"
          emptyMessage="Nenhum horário selecionado"
        />

        <MultiSelectorModerno
          title="Dias disponíveis"
          description="Em quais dias da semana você tem mais disponibilidade?"
          options={AVAILABLE_DAYS_OPTIONS}
          selectedValues={Array.isArray(data.available_days) ? data.available_days : []}
          onSelectionChange={handleAvailableDaysChange}
          onRemove={handleAvailableDaysRemove}
          placeholder="Selecione seus dias disponíveis"
          emptyMessage="Nenhum dia selecionado"
        />

        <MultiSelectorModerno
          title="Habilidades para compartilhar"
          description="Quais conhecimentos você poderia compartilhar com a comunidade?"
          options={SKILLS_OPTIONS}
          selectedValues={Array.isArray(data.skills_to_share) ? data.skills_to_share : []}
          onSelectionChange={handleSkillsChange}
          onRemove={handleSkillsRemove}
          placeholder="Selecione as habilidades que você pode compartilhar"
          emptyMessage="Nenhuma habilidade selecionada"
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Disponibilidade para networking
            </label>
            <select
              value={data.networking_availability === true ? 'sim' : data.networking_availability === false ? 'nao' : ''}
              onChange={(e) => onUpdate('networking_availability', e.target.value === 'sim' ? true : e.target.value === 'nao' ? false : '')}
              className="w-full h-12 p-3 bg-gray-800/50 border border-gray-600 text-white rounded-md focus:ring-viverblue/50"
            >
              <option value="">Selecione uma opção</option>
              <option value="sim">Sim, tenho interesse em networking</option>
              <option value="nao">Não, prefiro focar no aprendizado</option>
            </select>
            <p className="text-xs text-gray-400">
              {data.networking_availability === true ? '✅ Interesse em networking' : ''}
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={data.authorize_case_usage || false}
                onChange={(e) => onUpdate('authorize_case_usage', e.target.checked)}
                className="w-4 h-4 text-viverblue bg-gray-800 border-gray-600 rounded focus:ring-viverblue"
              />
              <span className="text-sm text-white">
                Autorizo o uso do meu caso de sucesso como exemplo para outros membros
              </span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={data.interested_in_interview || false}
                onChange={(e) => onUpdate('interested_in_interview', e.target.checked)}
                className="w-4 h-4 text-viverblue bg-gray-800 border-gray-600 rounded focus:ring-viverblue"
              />
              <span className="text-sm text-white">
                Tenho interesse em participar de entrevistas/depoimentos
              </span>
            </label>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            🌟 <strong>Comunidade:</strong> Essas informações nos ajudam a conectar você 
            com pessoas que têm interesses similares e criar experiências mais relevantes.
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
