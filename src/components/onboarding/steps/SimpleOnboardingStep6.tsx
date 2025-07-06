import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface SimpleOnboardingStep6Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export const SimpleOnboardingStep6: React.FC<SimpleOnboardingStep6Props> = ({
  data,
  onNext,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    weekly_time_commitment: data.personalization?.weekly_time_commitment || '',
    preferred_learning_style: data.personalization?.preferred_learning_style || [],
    wants_networking: data.personalization?.wants_networking || '',
    communication_preferences: data.personalization?.communication_preferences || [],
    ...data.personalization
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  const timeCommitments = [
    { value: '1-2', label: '1-2 horas por semana' },
    { value: '3-5', label: '3-5 horas por semana' },
    { value: '6-10', label: '6-10 horas por semana' },
    { value: '10+', label: 'Mais de 10 horas por semana' }
  ];

  const learningStyles = [
    'Vídeos e tutoriais',
    'Artigos e textos',
    'Exercícios práticos',
    'Estudos de caso',
    'Webinars ao vivo',
    'Comunidade e discussões'
  ];

  const communicationPreferences = [
    'Email semanal',
    'Notificações push',
    'WhatsApp',
    'Newsletter mensal'
  ];

  const handleLearningStyleToggle = (style: string, checked: boolean) => {
    const currentStyles = formData.preferred_learning_style || [];
    if (checked) {
      handleInputChange('preferred_learning_style', [...currentStyles, style]);
    } else {
      handleInputChange('preferred_learning_style', currentStyles.filter((s: string) => s !== style));
    }
  };

  const handleCommunicationToggle = (pref: string, checked: boolean) => {
    const currentPrefs = formData.communication_preferences || [];
    if (checked) {
      handleInputChange('communication_preferences', [...currentPrefs, pref]);
    } else {
      handleInputChange('communication_preferences', currentPrefs.filter((p: string) => p !== pref));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          Finalização
        </h2>
        <p className="text-muted-foreground">
          Últimas informações para personalizar sua experiência.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Quanto tempo você pode dedicar ao aprendizado por semana?</Label>
          <RadioGroup
            value={formData.weekly_time_commitment}
            onValueChange={(value) => handleInputChange('weekly_time_commitment', value)}
          >
            {timeCommitments.map((time) => (
              <div key={time.value} className="flex items-center space-x-2">
                <RadioGroupItem value={time.value} id={time.value} />
                <Label htmlFor={time.value} className="font-normal">
                  {time.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Como você prefere aprender? (selecione todas que se aplicam)</Label>
          <div className="grid grid-cols-2 gap-3">
            {learningStyles.map((style) => (
              <div key={style} className="flex items-center space-x-2">
                <Checkbox
                  id={style}
                  checked={(formData.preferred_learning_style || []).includes(style)}
                  onCheckedChange={(checked) => handleLearningStyleToggle(style, checked as boolean)}
                />
                <Label htmlFor={style} className="font-normal text-sm">
                  {style}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Gostaria de participar de atividades de networking?</Label>
          <RadioGroup
            value={formData.wants_networking}
            onValueChange={(value) => handleInputChange('wants_networking', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="networking-yes" />
              <Label htmlFor="networking-yes" className="font-normal">
                Sim, quero conectar com outros profissionais
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="networking-no" />
              <Label htmlFor="networking-no" className="font-normal">
                Não, prefiro focar apenas no conteúdo
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Como você gostaria de receber comunicações?</Label>
          <div className="grid grid-cols-2 gap-3">
            {communicationPreferences.map((pref) => (
              <div key={pref} className="flex items-center space-x-2">
                <Checkbox
                  id={pref}
                  checked={(formData.communication_preferences || []).includes(pref)}
                  onCheckedChange={(checked) => handleCommunicationToggle(pref, checked as boolean)}
                />
                <Label htmlFor={pref} className="font-normal text-sm">
                  {pref}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-semibold mb-2">Pronto para começar!</h3>
          <p className="text-sm text-muted-foreground">
            Clique em "Finalizar" para criar seu perfil personalizado e começar sua jornada de aprendizado em IA.
          </p>
        </div>
      </div>
    </div>
  );
};