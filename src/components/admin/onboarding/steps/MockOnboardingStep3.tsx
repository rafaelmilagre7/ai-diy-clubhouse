
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { Settings } from 'lucide-react';

interface MockOnboardingStep3Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const MockOnboardingStep3: React.FC<MockOnboardingStep3Props> = ({
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
            Maturidade Tecnológica em IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Status de Implementação */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium text-base">
              Sua empresa já implementou soluções de Inteligência Artificial? *
            </Label>
            <RadioGroup
              value={data.hasImplementedAI || ''}
              onValueChange={(value) => handleRadioChange('hasImplementedAI', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="sim" id="implemented-yes" className="border-slate-400" />
                <Label htmlFor="implemented-yes" className="text-white font-normal cursor-pointer flex-1">
                  Sim, já implementamos soluções de IA
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="nao" id="implemented-no" className="border-slate-400" />
                <Label htmlFor="implemented-no" className="text-white font-normal cursor-pointer flex-1">
                  Não, ainda não implementamos
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="parcial" id="implemented-partial" className="border-slate-400" />
                <Label htmlFor="implemented-partial" className="text-white font-normal cursor-pointer flex-1">
                  Parcialmente, estamos em fase de testes
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('hasImplementedAI') && (
              <p className="text-red-400 text-sm">{getFieldError('hasImplementedAI')}</p>
            )}
          </div>

          {/* Ferramentas Utilizadas */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium text-base">
              Quais ferramentas de IA são utilizadas pela sua equipe?
            </Label>
            <p className="text-slate-400 text-sm">Selecione todas as opções que se aplicam</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'ChatGPT',
                'Claude',
                'Gemini',
                'Copilot',
                'Midjourney',
                'DALL-E',
                'Canva AI',
                'Notion AI',
                'Outras ferramentas'
              ].map((tool) => (
                <div key={tool} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                  <Checkbox
                    id={`tool-${tool}`}
                    checked={(data.aiToolsUsed || []).includes(tool)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('aiToolsUsed', data.aiToolsUsed || [], tool, checked as boolean)
                    }
                    className="border-slate-400"
                  />
                  <Label htmlFor={`tool-${tool}`} className="text-white font-normal cursor-pointer flex-1">
                    {tool}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Nível de Conhecimento */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-medium text-base">
              Como avalia o nível de conhecimento em IA da sua equipe? *
            </Label>
            <RadioGroup
              value={data.aiKnowledgeLevel || ''}
              onValueChange={(value) => handleRadioChange('aiKnowledgeLevel', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="iniciante" id="level-beginner" className="border-slate-400" />
                <Label htmlFor="level-beginner" className="text-white font-normal cursor-pointer flex-1">
                  Iniciante - Conhecimento básico ou limitado
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="basico" id="level-basic" className="border-slate-400" />
                <Label htmlFor="level-basic" className="text-white font-normal cursor-pointer flex-1">
                  Básico - Uso ferramentas simples ocasionalmente
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="intermediario" id="level-intermediate" className="border-slate-400" />
                <Label htmlFor="level-intermediate" className="text-white font-normal cursor-pointer flex-1">
                  Intermediário - Uso regular de múltiplas ferramentas
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                <RadioGroupItem value="avancado" id="level-advanced" className="border-slate-400" />
                <Label htmlFor="level-advanced" className="text-white font-normal cursor-pointer flex-1">
                  Avançado - Domínio técnico das tecnologias
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('aiKnowledgeLevel') && (
              <p className="text-red-400 text-sm">{getFieldError('aiKnowledgeLevel')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep3;
