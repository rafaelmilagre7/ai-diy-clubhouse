import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Target, Clock, Zap } from 'lucide-react';
import { SimpleOnboardingData } from '@/hooks/useSimpleOnboarding';

interface SimpleStep4Props {
  data: SimpleOnboardingData;
  onNext: (stepData: Partial<SimpleOnboardingData>) => Promise<boolean>;
  onPrevious: () => void;
  isLoading: boolean;
}

const MAIN_OBJECTIVES = [
  { value: 'automate_processes', label: 'Automatizar processos', description: 'Reduzir tarefas manuais e repetitivas' },
  { value: 'improve_productivity', label: 'Aumentar produtividade', description: 'Fazer mais em menos tempo' },
  { value: 'reduce_costs', label: 'Reduzir custos', description: 'Diminuir gastos operacionais' },
  { value: 'improve_quality', label: 'Melhorar qualidade', description: 'Entregar melhores resultados' },
  { value: 'learn_ai', label: 'Aprender sobre IA', description: 'Entender melhor as possibilidades' },
  { value: 'other', label: 'Outro objetivo', description: 'Tenho um objetivo específico diferente' }
];

const URGENCY_LEVELS = [
  { value: 'immediate', label: 'Imediato', description: 'Preciso implementar agora' },
  { value: 'this_month', label: 'Este mês', description: 'Nas próximas semanas' },
  { value: 'this_quarter', label: 'Este trimestre', description: 'Nos próximos 3 meses' },
  { value: 'this_year', label: 'Este ano', description: 'Nos próximos 6-12 meses' },
  { value: 'exploring', label: 'Explorando', description: 'Ainda estou pesquisando' }
];

export const SimpleStep4: React.FC<SimpleStep4Props> = ({ data, onNext, onPrevious, isLoading }) => {
  const [formData, setFormData] = useState({
    main_objective: data.goals_info.main_objective || '',
    expected_result_90_days: data.goals_info.expected_result_90_days || '',
    urgency_level: data.goals_info.urgency_level || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar formData quando data mudar
  useEffect(() => {
    setFormData({
      main_objective: data.goals_info.main_objective || '',
      expected_result_90_days: data.goals_info.expected_result_90_days || '',
      urgency_level: data.goals_info.urgency_level || '',
    });
  }, [data.goals_info]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.main_objective) {
      newErrors.main_objective = 'Selecione seu objetivo principal';
    }

    if (!formData.urgency_level) {
      newErrors.urgency_level = 'Selecione o nível de urgência';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const stepData: Partial<SimpleOnboardingData> = {
      goals_info: {
        main_objective: formData.main_objective,
        expected_result_90_days: formData.expected_result_90_days.trim(),
        urgency_level: formData.urgency_level,
      }
    };

    await onNext(stepData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro quando o usuário fizer uma seleção
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Seus objetivos</h1>
        <p className="text-muted-foreground">
          Vamos alinhar nossas soluções com o que você realmente precisa alcançar.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Objetivo principal */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Target className="w-4 h-4" />
            Qual seu principal objetivo com IA? *
          </Label>
          <RadioGroup
            value={formData.main_objective}
            onValueChange={(value) => handleInputChange('main_objective', value)}
          >
            {MAIN_OBJECTIVES.map((objective) => (
              <div key={objective.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value={objective.value} id={objective.value} className="mt-1" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor={objective.value} className="font-medium cursor-pointer">
                    {objective.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{objective.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
          {errors.main_objective && (
            <p className="text-sm text-red-500">{errors.main_objective}</p>
          )}
        </div>

        {/* Resultado esperado */}
        <div className="space-y-2">
          <Label htmlFor="expected_result" className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4" />
            O que você espera alcançar nos próximos 90 dias?
          </Label>
          <Textarea
            id="expected_result"
            placeholder="Descreva brevemente o resultado que você gostaria de ver em 3 meses..."
            value={formData.expected_result_90_days}
            onChange={(e) => handleInputChange('expected_result_90_days', e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground">
            Ex: "Automatizar 50% dos meus processos manuais" ou "Reduzir 2 horas por dia de trabalho repetitivo"
          </p>
        </div>

        {/* Urgência */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Zap className="w-4 h-4" />
            Qual a urgência para implementar? *
          </Label>
          <RadioGroup
            value={formData.urgency_level}
            onValueChange={(value) => handleInputChange('urgency_level', value)}
          >
            {URGENCY_LEVELS.map((urgency) => (
              <div key={urgency.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value={urgency.value} id={urgency.value} className="mt-1" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor={urgency.value} className="font-medium cursor-pointer">
                    {urgency.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{urgency.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
          {errors.urgency_level && (
            <p className="text-sm text-red-500">{errors.urgency_level}</p>
          )}
        </div>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={isLoading}>
          ← Voltar
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            'Continuar →'
          )}
        </Button>
      </div>
    </div>
  );
};