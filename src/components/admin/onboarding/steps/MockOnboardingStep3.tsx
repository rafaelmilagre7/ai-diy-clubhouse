
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

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
    <div className="space-y-6">
      <Card className="bg-[#1a1f2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            🤖 Maturidade em IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Implementação de IA */}
          <div>
            <Label className="text-slate-200">
              Sua empresa já implementou alguma solução de IA? *
            </Label>
            <RadioGroup
              value={data.hasImplementedAI || ''}
              onValueChange={(value) => handleRadioChange('hasImplementedAI', value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sim" id="implemented-yes" />
                <Label htmlFor="implemented-yes" className="text-white">
                  Sim, já implementamos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao" id="implemented-no" />
                <Label htmlFor="implemented-no" className="text-white">
                  Não, ainda não implementamos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="parcial" id="implemented-partial" />
                <Label htmlFor="implemented-partial" className="text-white">
                  Parcialmente, estamos testando
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('hasImplementedAI') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('hasImplementedAI')}</p>
            )}
          </div>

          {/* Ferramentas de IA */}
          <div>
            <Label className="text-slate-200">
              Quais ferramentas de IA você/sua equipe já utiliza? (selecione todas que se aplicam)
            </Label>
            <div className="mt-2 space-y-2">
              {[
                'ChatGPT',
                'Claude',
                'Gemini',
                'Copilot',
                'Midjourney',
                'DALL-E',
                'Canva AI',
                'Notion AI',
                'Outras'
              ].map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tool-${tool}`}
                    checked={(data.aiToolsUsed || []).includes(tool)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('aiToolsUsed', data.aiToolsUsed || [], tool, checked as boolean)
                    }
                  />
                  <Label htmlFor={`tool-${tool}`} className="text-white">
                    {tool}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Nível de conhecimento */}
          <div>
            <Label className="text-slate-200">
              Como você avalia seu nível de conhecimento em IA? *
            </Label>
            <RadioGroup
              value={data.aiKnowledgeLevel || ''}
              onValueChange={(value) => handleRadioChange('aiKnowledgeLevel', value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="iniciante" id="level-beginner" />
                <Label htmlFor="level-beginner" className="text-white">
                  Iniciante - Pouco ou nenhum conhecimento
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="basico" id="level-basic" />
                <Label htmlFor="level-basic" className="text-white">
                  Básico - Uso algumas ferramentas básicas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediario" id="level-intermediate" />
                <Label htmlFor="level-intermediate" className="text-white">
                  Intermediário - Uso várias ferramentas com facilidade
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="avancado" id="level-advanced" />
                <Label htmlFor="level-advanced" className="text-white">
                  Avançado - Domino bem as tecnologias de IA
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('aiKnowledgeLevel') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('aiKnowledgeLevel')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep3;
