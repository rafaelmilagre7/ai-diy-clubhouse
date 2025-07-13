import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingData, OnboardingStepProps } from '../types/simpleOnboardingTypes';

interface SimpleStep3Props {
  data: OnboardingData;
  onPrev: () => void;
  onComplete: () => void;
  onUpdateData: (stepData: Partial<OnboardingData>) => void;
}

const SimpleStep3: React.FC<SimpleStep3Props> = ({
  data,
  onPrev,
  onComplete,
  onUpdateData
}) => {
  const [formData, setFormData] = useState({
    mainObjective: data.mainObjective || '',
    expectedResult90Days: data.expectedResult90Days || ''
  });

  const handleObjectiveChange = (value: string) => {
    const newData = { ...formData, mainObjective: value };
    setFormData(newData);
    onUpdateData(newData);
  };

  const handleExpectationsChange = (value: string) => {
    const newData = { ...formData, expectedResult90Days: value };
    setFormData(newData);
    onUpdateData(newData);
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Seus Objetivos</CardTitle>
        <CardDescription>
          Para finalizar, conte-nos sobre seus objetivos para que possamos oferecer a melhor experiência.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="mainObjective">Qual é seu principal objetivo com a IA?</Label>
          <Textarea
            id="mainObjective"
            placeholder="Exemplo: Automatizar processos, melhorar atendimento, aumentar vendas..."
            value={formData.mainObjective}
            onChange={(e) => handleObjectiveChange(e.target.value)}
            className="w-full min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedResult90Days">O que você espera alcançar nos próximos 90 dias?</Label>
          <Textarea
            id="expectedResult90Days"
            placeholder="Compartilhe suas expectativas sobre como nossa plataforma pode ajudar você e sua empresa..."
            value={formData.expectedResult90Days}
            onChange={(e) => handleExpectationsChange(e.target.value)}
            className="w-full min-h-[120px]"
          />
        </div>

        <div className="bg-primary/5 p-4 rounded-lg">
          <h4 className="font-medium text-primary mb-2">🎉 Quase pronto!</h4>
          <p className="text-sm text-muted-foreground">
            Ao finalizar, você terá acesso completo à plataforma com conteúdos e ferramentas 
            personalizados baseados no que você compartilhou conosco.
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrev}>
            Voltar
          </Button>
          <Button onClick={handleComplete} size="lg" className="px-8">
            Finalizar Onboarding
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleStep3;