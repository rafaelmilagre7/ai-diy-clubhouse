import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { SimpleOnboardingData } from '../types/simpleOnboardingTypes';

interface SimpleStep3Props {
  data: SimpleOnboardingData;
  onPrev: () => void;
  onComplete: () => void;
  onUpdateData: (stepData: Partial<SimpleOnboardingData>) => void;
}

const SimpleStep3: React.FC<SimpleStep3Props> = ({
  data,
  onPrev,
  onComplete,
  onUpdateData
}) => {
  const [formData, setFormData] = useState({
    goals: data.goals || [],
    expectations: data.expectations || ''
  });

  const goalOptions = [
    'Automatizar processos repetitivos',
    'Melhorar atendimento ao cliente',
    'Aumentar produtividade da equipe',
    'Reduzir custos operacionais',
    'Criar novos produtos/serviços',
    'Melhorar análise de dados',
    'Otimizar marketing digital'
  ];

  const handleGoalChange = (goal: string, checked: boolean) => {
    const newGoals = checked 
      ? [...formData.goals, goal]
      : formData.goals.filter(g => g !== goal);
    
    const newData = { ...formData, goals: newGoals };
    setFormData(newData);
    onUpdateData(newData);
  };

  const handleExpectationsChange = (value: string) => {
    const newData = { ...formData, expectations: value };
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
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Quais são seus principais objetivos? (selecione todos que se aplicam)
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {goalOptions.map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox
                  id={goal}
                  checked={formData.goals.includes(goal)}
                  onCheckedChange={(checked) => handleGoalChange(goal, !!checked)}
                />
                <Label htmlFor={goal} className="text-sm font-normal cursor-pointer">
                  {goal}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectations">O que você espera desta plataforma?</Label>
          <Textarea
            id="expectations"
            placeholder="Compartilhe suas expectativas sobre como nossa plataforma pode ajudar você e sua empresa..."
            value={formData.expectations}
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