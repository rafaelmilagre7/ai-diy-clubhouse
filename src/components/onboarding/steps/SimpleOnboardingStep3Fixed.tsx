import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Brain } from 'lucide-react';

interface SimpleOnboardingStep3Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
  getFieldError?: (field: string) => string | undefined;
  onDataChange?: (data: any) => void;
}

export const SimpleOnboardingStep3Fixed = React.memo(forwardRef<{ getData: () => any; isValid: () => boolean }, SimpleOnboardingStep3Props>(({
  data,
  onNext,
  isLoading = false,
  getFieldError,
  onDataChange
}, ref) => {
  const [formData, setFormData] = useState({
    hasImplementedAI: data.ai_experience?.hasImplementedAI || '',
    aiKnowledgeLevel: data.ai_experience?.aiKnowledgeLevel || '',
    whoWillImplement: data.ai_experience?.whoWillImplement || '',
    aiImplementationObjective: data.ai_experience?.aiImplementationObjective || '',
    aiImplementationUrgency: data.ai_experience?.aiImplementationUrgency || '',
    aiMainChallenge: data.ai_experience?.aiMainChallenge || ''
  });

  const updateStepData = useCallback((field: string, value: any) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
    
    if (onDataChange) {
      onDataChange({ ai_experience: newFormData });
    }
  }, [formData, onDataChange]);

  // CORREÇÃO CRÍTICA: Validação muito mais tolerante
  const validateForm = useCallback(() => {
    // Permitir prosseguir com apenas 2 campos obrigatórios
    const hasBasicInfo = formData.hasImplementedAI && formData.aiKnowledgeLevel;
    return hasBasicInfo;
  }, [formData.hasImplementedAI, formData.aiKnowledgeLevel]);

  const handleNext = () => {
    if (!validateForm()) {
      console.warn('Campos básicos não preenchidos');
      return;
    }
    
    // Enviar dados estruturados para o wizard
    onNext({ ai_experience: formData });
  };

  // Expor funções através da ref com memoização
  useImperativeHandle(ref, () => ({
    getData: () => ({ ai_experience: formData }),
    isValid: validateForm
  }), [formData, validateForm]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Experiência com IA
        </h2>
        <p className="text-muted-foreground text-lg">
          Vamos entender seu nível atual com Inteligência Artificial
        </p>
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          💡 Apenas 2 campos obrigatórios - o resto é opcional
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-xl font-bold flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            Experiência com Inteligência Artificial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Já implementou IA? - OBRIGATÓRIO */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium text-base">
              Você já implementou alguma solução de IA? *
            </Label>
            <Select 
              value={formData.hasImplementedAI} 
              onValueChange={(value) => updateStepData('hasImplementedAI', value)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione uma opção..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim-sucesso">Sim, com sucesso</SelectItem>
                <SelectItem value="sim-dificuldades">Sim, mas com dificuldades</SelectItem>
                <SelectItem value="tentando">Estou tentando implementar</SelectItem>
                <SelectItem value="nao-ainda">Não, mas pretendo</SelectItem>
                <SelectItem value="nao-interesse">Não tenho interesse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nível de Conhecimento - OBRIGATÓRIO */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium text-base">
              Como você avalia seu conhecimento sobre IA? *
            </Label>
            <Select 
              value={formData.aiKnowledgeLevel} 
              onValueChange={(value) => updateStepData('aiKnowledgeLevel', value)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione seu nível..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iniciante">Iniciante - Conheço pouco sobre IA</SelectItem>
                <SelectItem value="basico">Básico - Entendo conceitos gerais</SelectItem>
                <SelectItem value="intermediario">Intermediário - Já usei algumas ferramentas</SelectItem>
                <SelectItem value="avancado">Avançado - Implementei soluções de IA</SelectItem>
                <SelectItem value="especialista">Especialista - Desenvolvo soluções de IA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quem vai implementar - OPCIONAL */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium text-base">
              Quem implementará as soluções de IA? <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Select 
              value={formData.whoWillImplement} 
              onValueChange={(value) => updateStepData('whoWillImplement', value)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione uma opção..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eu-mesmo">Eu mesmo</SelectItem>
                <SelectItem value="equipe-interna">Equipe interna</SelectItem>
                <SelectItem value="consultoria-externa">Consultoria externa</SelectItem>
                <SelectItem value="ainda-decidindo">Ainda estou decidindo</SelectItem>
                <SelectItem value="nao-sei">Não sei ainda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Principal Desafio - OPCIONAL */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium text-base">
              Qual seu principal desafio com IA? <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              value={formData.aiMainChallenge}
              onChange={(e) => updateStepData('aiMainChallenge', e.target.value)}
              placeholder="Descreva brevemente seu principal desafio..."
              className="bg-background border-border text-foreground min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}));

SimpleOnboardingStep3Fixed.displayName = 'SimpleOnboardingStep3Fixed';