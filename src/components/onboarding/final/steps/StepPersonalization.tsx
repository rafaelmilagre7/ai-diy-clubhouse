
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Settings, CheckCircle } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

export const StepPersonalization: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const interestOptions = [
    'Automação de Processos',
    'ChatBots e Assistentes Virtuais',
    'Análise de Dados com IA',
    'Marketing com IA',
    'Vendas com IA',
    'Atendimento ao Cliente',
    'Recursos Humanos',
    'Financeiro e Contabilidade',
    'Produtividade Pessoal',
    'Criação de Conteúdo'
  ];

  const availableDaysOptions = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  const timePreferenceOptions = [
    'Manhã (8h-12h)',
    'Tarde (12h-18h)', 
    'Noite (18h-22h)'
  ];

  const handleInterestChange = (interest: string, checked: boolean) => {
    const currentInterests = data.personalization.interests || [];
    let updatedInterests;
    
    if (checked) {
      updatedInterests = [...currentInterests, interest];
    } else {
      updatedInterests = currentInterests.filter(item => item !== interest);
    }
    
    onUpdate('personalization', {
      ...data.personalization,
      interests: updatedInterests
    });
  };

  const handleDayChange = (day: string, checked: boolean) => {
    const currentDays = data.personalization.available_days || [];
    let updatedDays;
    
    if (checked) {
      updatedDays = [...currentDays, day];
    } else {
      updatedDays = currentDays.filter(item => item !== day);
    }
    
    onUpdate('personalization', {
      ...data.personalization,
      available_days: updatedDays
    });
  };

  const handleTimePreferenceChange = (time: string, checked: boolean) => {
    const currentTimes = data.personalization.time_preference || [];
    let updatedTimes;
    
    if (checked) {
      updatedTimes = [...currentTimes, time];
    } else {
      updatedTimes = currentTimes.filter(item => item !== time);
    }
    
    onUpdate('personalization', {
      ...data.personalization,
      time_preference: updatedTimes
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Última etapa!
        </h2>
        <p className="text-gray-300">
          Vamos personalizar sua experiência no Viver de IA Club.
        </p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-viverblue" />
            Seus Interesses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white mb-3 block">Que áreas de IA mais te interessam?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {interestOptions.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest}
                    checked={(data.personalization.interests || []).includes(interest)}
                    onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                  />
                  <Label htmlFor={interest} className="text-gray-300 text-sm cursor-pointer">
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Disponibilidade para Networking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white mb-3 block">Dias disponíveis para conexões:</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableDaysOptions.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={(data.personalization.available_days || []).includes(day)}
                    onCheckedChange={(checked) => handleDayChange(day, checked as boolean)}
                  />
                  <Label htmlFor={day} className="text-gray-300 text-sm cursor-pointer">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white mb-3 block">Horários preferenciais:</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {timePreferenceOptions.map((time) => (
                <div key={time} className="flex items-center space-x-2">
                  <Checkbox
                    id={time}
                    checked={(data.personalization.time_preference || []).includes(time)}
                    onCheckedChange={(checked) => handleTimePreferenceChange(time, checked as boolean)}
                  />
                  <Label htmlFor={time} className="text-gray-300 text-sm cursor-pointer">
                    {time}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="networking_availability" className="text-white">Disponibilidade geral para networking:</Label>
            <Select 
              value={data.personalization.networking_availability || ''} 
              onValueChange={(value) => onUpdate('personalization', {
                ...data.personalization,
                networking_availability: value
              })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione sua disponibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Muito disponível">Muito disponível</SelectItem>
                <SelectItem value="Disponível">Disponível</SelectItem>
                <SelectItem value="Pouco disponível">Pouco disponível</SelectItem>
                <SelectItem value="Não disponível no momento">Não disponível no momento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Autorização e Participação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="authorize_case_usage"
              checked={data.personalization.authorize_case_usage || false}
              onCheckedChange={(checked) => onUpdate('personalization', {
                ...data.personalization,
                authorize_case_usage: checked as boolean
              })}
            />
            <Label htmlFor="authorize_case_usage" className="text-gray-300 cursor-pointer">
              Autorizo ser apresentado como um case de sucesso ao implementar soluções do Viver de IA Club
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="interested_in_interview"
              checked={data.personalization.interested_in_interview || false}
              onCheckedChange={(checked) => onUpdate('personalization', {
                ...data.personalization,
                interested_in_interview: checked as boolean
              })}
            />
            <Label htmlFor="interested_in_interview" className="text-gray-300 cursor-pointer">
              Tenho interesse em participar de entrevistas ou depoimentos
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <Button
          onClick={onNext}
          className="bg-viverblue hover:bg-viverblue/90"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Finalizar Onboarding
        </Button>
      </div>

      <div className="text-center text-sm text-gray-400">
        Etapa {currentStep} de {totalSteps}
      </div>
    </div>
  );
};
