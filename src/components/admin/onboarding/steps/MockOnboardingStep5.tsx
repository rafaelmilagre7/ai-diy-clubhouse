
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingStep5Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const MockOnboardingStep5: React.FC<MockOnboardingStep5Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const handleRadioChange = (field: keyof OnboardingData, value: string) => {
    onUpdateData({ [field]: value });
  };

  const handleCheckboxChange = (field: keyof OnboardingData, values: string[], value: string, checked: boolean) => {
    let newValues = [...values];
    if (checked) {
      if (!newValues.includes(value)) {
        newValues.push(value);
      }
    } else {
      newValues = newValues.filter(v => v !== value);
    }
    onUpdateData({ [field]: newValues });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1f2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            ⚙️ Personalização da Experiência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tempo de aprendizado */}
          <div>
            <Label className="text-slate-200">
              Quanto tempo por semana você tem disponível para aprender? *
            </Label>
            <RadioGroup
              value={data.weeklyLearningTime || ''}
              onValueChange={(value) => handleRadioChange('weeklyLearningTime', value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1-2h" id="time-1-2" />
                <Label htmlFor="time-1-2" className="text-white">
                  1-2 horas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3-5h" id="time-3-5" />
                <Label htmlFor="time-3-5" className="text-white">
                  3-5 horas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="6-10h" id="time-6-10" />
                <Label htmlFor="time-6-10" className="text-white">
                  6-10 horas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10h+" id="time-10-plus" />
                <Label htmlFor="time-10-plus" className="text-white">
                  Mais de 10 horas
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('weeklyLearningTime') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('weeklyLearningTime')}</p>
            )}
          </div>

          {/* Preferência de conteúdo */}
          <div>
            <Label className="text-slate-200">
              Qual formato de conteúdo você prefere? (selecione todos que se aplicam) *
            </Label>
            <div className="mt-2 space-y-2">
              {[
                'Vídeo-aulas',
                'Textos e artigos',
                'Podcasts',
                'Webinars ao vivo',
                'Exercícios práticos',
                'Casos de estudo',
                'Infográficos'
              ].map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <Checkbox
                    id={`format-${format}`}
                    checked={(data.contentPreference || []).includes(format)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('contentPreference', data.contentPreference || [], format, checked as boolean)
                    }
                  />
                  <Label htmlFor={`format-${format}`} className="text-white">
                    {format}
                  </Label>
                </div>
              ))}
            </div>
            {getFieldError?.('contentPreference') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('contentPreference')}</p>
            )}
          </div>

          {/* Networking */}
          <div>
            <Label className="text-slate-200">
              Tem interesse em participar de eventos de networking? *
            </Label>
            <RadioGroup
              value={data.wantsNetworking || ''}
              onValueChange={(value) => handleRadioChange('wantsNetworking', value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sim" id="networking-yes" />
                <Label htmlFor="networking-yes" className="text-white">
                  Sim, tenho muito interesse
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="talvez" id="networking-maybe" />
                <Label htmlFor="networking-maybe" className="text-white">
                  Talvez, dependendo do evento
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao" id="networking-no" />
                <Label htmlFor="networking-no" className="text-white">
                  Não, prefiro focar no conteúdo
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('wantsNetworking') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('wantsNetworking')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep5;
