
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { Settings } from 'lucide-react';

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
    <div className="space-y-8">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
            <Settings className="h-5 w-5 text-viverblue" />
            Personalização da Experiência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Disponibilidade de Tempo */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium text-base">
              Quanto tempo semanal está disponível para capacitação? *
            </Label>
            <RadioGroup
              value={data.weeklyLearningTime || ''}
              onValueChange={(value) => handleRadioChange('weeklyLearningTime', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="1-2h" id="time-1-2" className="border-slate-400" />
                <Label htmlFor="time-1-2" className="text-white font-normal cursor-pointer flex-1">
                  1-2 horas semanais
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="3-5h" id="time-3-5" className="border-slate-400" />
                <Label htmlFor="time-3-5" className="text-white font-normal cursor-pointer flex-1">
                  3-5 horas semanais
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="6-10h" id="time-6-10" className="border-slate-400" />
                <Label htmlFor="time-6-10" className="text-white font-normal cursor-pointer flex-1">
                  6-10 horas semanais
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="10h+" id="time-10-plus" className="border-slate-400" />
                <Label htmlFor="time-10-plus" className="text-white font-normal cursor-pointer flex-1">
                  Mais de 10 horas semanais
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('weeklyLearningTime') && (
              <p className="text-red-400 text-sm">{getFieldError('weeklyLearningTime')}</p>
            )}
          </div>

          {/* Preferências de Conteúdo */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium text-base">
              Quais formatos de conteúdo prefere para capacitação? *
            </Label>
            <p className="text-slate-400 text-sm">Selecione todas as opções de seu interesse</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Vídeo-aulas práticas',
                'Documentação técnica',
                'Podcasts especializados',
                'Webinars ao vivo',
                'Exercícios hands-on',
                'Cases de sucesso',
                'Infográficos e guias visuais'
              ].map((format) => (
                <div key={format} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                  <Checkbox
                    id={`format-${format}`}
                    checked={(data.contentPreference || []).includes(format)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('contentPreference', data.contentPreference || [], format, checked as boolean)
                    }
                    className="border-slate-400"
                  />
                  <Label htmlFor={`format-${format}`} className="text-white font-normal cursor-pointer flex-1">
                    {format}
                  </Label>
                </div>
              ))}
            </div>
            {getFieldError?.('contentPreference') && (
              <p className="text-red-400 text-sm">{getFieldError('contentPreference')}</p>
            )}
          </div>

          {/* Interesse em Networking */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium text-base">
              Tem interesse em participar de eventos de networking empresarial? *
            </Label>
            <RadioGroup
              value={data.wantsNetworking || ''}
              onValueChange={(value) => handleRadioChange('wantsNetworking', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="sim" id="networking-yes" className="border-slate-400" />
                <Label htmlFor="networking-yes" className="text-white font-normal cursor-pointer flex-1">
                  Sim, tenho grande interesse
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="talvez" id="networking-maybe" className="border-slate-400" />
                <Label htmlFor="networking-maybe" className="text-white font-normal cursor-pointer flex-1">
                  Dependendo do evento e agenda
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="nao" id="networking-no" className="border-slate-400" />
                <Label htmlFor="networking-no" className="text-white font-normal cursor-pointer flex-1">
                  Prefiro focar apenas no conteúdo
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('wantsNetworking') && (
              <p className="text-red-400 text-sm">{getFieldError('wantsNetworking')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep5;
