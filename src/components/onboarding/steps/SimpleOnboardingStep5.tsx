import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface SimpleOnboardingStep5Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export const SimpleOnboardingStep5: React.FC<SimpleOnboardingStep5Props> = ({
  data,
  onNext,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    main_objective: data.goals_info?.main_objective || '',
    ai_knowledge_level: data.goals_info?.ai_knowledge_level || '',
    areas_of_interest: data.goals_info?.areas_of_interest || [],
    specific_goals: data.goals_info?.specific_goals || '',
    ...data.goals_info
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

  const mainObjectives = [
    { value: 'learn_ai', label: 'Aprender sobre IA e suas aplicações' },
    { value: 'implement_ai', label: 'Implementar IA no meu negócio' },
    { value: 'improve_productivity', label: 'Melhorar produtividade com IA' },
    { value: 'stay_updated', label: 'Ficar atualizado sobre tendências' },
    { value: 'network', label: 'Fazer networking com outros profissionais' },
    { value: 'other', label: 'Outro objetivo' }
  ];

  const knowledgeLevels = [
    { value: 'beginner', label: 'Iniciante - Pouco ou nenhum conhecimento' },
    { value: 'intermediate', label: 'Intermediário - Já uso algumas ferramentas' },
    { value: 'advanced', label: 'Avançado - Tenho experiência sólida' }
  ];

  const areasOfInterest = [
    'Automação de processos',
    'Atendimento ao cliente',
    'Marketing e vendas',
    'Criação de conteúdo',
    'Análise de dados',
    'Desenvolvimento de produtos',
    'Recursos humanos',
    'Finanças e contabilidade'
  ];

  const handleAreaToggle = (area: string, checked: boolean) => {
    const currentAreas = formData.areas_of_interest || [];
    if (checked) {
      handleInputChange('areas_of_interest', [...currentAreas, area]);
    } else {
      handleInputChange('areas_of_interest', currentAreas.filter((a: string) => a !== area));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          Seus Objetivos
        </h2>
        <p className="text-muted-foreground">
          Entender seus objetivos nos permite criar um plano de aprendizado personalizado.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Qual é seu principal objetivo?</Label>
          <RadioGroup
            value={formData.main_objective}
            onValueChange={(value) => handleInputChange('main_objective', value)}
          >
            {mainObjectives.map((objective) => (
              <div key={objective.value} className="flex items-center space-x-2">
                <RadioGroupItem value={objective.value} id={objective.value} />
                <Label htmlFor={objective.value} className="font-normal">
                  {objective.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Qual seu nível de conhecimento em IA?</Label>
          <RadioGroup
            value={formData.ai_knowledge_level}
            onValueChange={(value) => handleInputChange('ai_knowledge_level', value)}
          >
            {knowledgeLevels.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <RadioGroupItem value={level.value} id={level.value} />
                <Label htmlFor={level.value} className="font-normal">
                  {level.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Áreas de interesse (selecione todas que se aplicam):</Label>
          <div className="grid grid-cols-2 gap-3">
            {areasOfInterest.map((area) => (
              <div key={area} className="flex items-center space-x-2">
                <Checkbox
                  id={area}
                  checked={(formData.areas_of_interest || []).includes(area)}
                  onCheckedChange={(checked) => handleAreaToggle(area, checked as boolean)}
                />
                <Label htmlFor={area} className="font-normal text-sm">
                  {area}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specific_goals">
            Objetivos específicos (opcional)
          </Label>
          <Textarea
            id="specific_goals"
            placeholder="Descreva objetivos específicos que gostaria de alcançar..."
            value={formData.specific_goals}
            onChange={(e) => handleInputChange('specific_goals', e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};