
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { OnboardingData } from '../types/onboardingTypes';
import { useTools } from '@/hooks/useTools';

interface OnboardingStep3Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  onNext: () => Promise<void>;
  onPrev: () => void;
  memberType: 'club' | 'formacao';
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
}

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({
  data,
  onUpdateData,
  validationErrors,
  getFieldError
}) => {
  const { tools, isLoading: toolsLoading } = useTools();

  // Opções restauradas para nível de conhecimento
  const aiKnowledgeLevels = [
    { value: 'iniciante', label: 'Iniciante - Pouco ou nenhum conhecimento' },
    { value: 'basico', label: 'Básico - Conheço conceitos fundamentais' },
    { value: 'intermediario', label: 'Intermediário - Já uso algumas ferramentas' },
    { value: 'avancado', label: 'Avançado - Implemento soluções complexas' },
    { value: 'especialista', label: 'Especialista - Desenvolvo e ensino IA' }
  ];

  const implementationOptions = [
    { value: 'nao', label: 'Não, ainda não implementei IA' },
    { value: 'testando', label: 'Estou testando algumas ferramentas' },
    { value: 'parcial', label: 'Implementei em alguns processos' },
    { value: 'completa', label: 'Tenho IA integrada em vários processos' }
  ];

  const handleToolToggle = (toolName: string, checked: boolean) => {
    const currentTools = data.aiToolsUsed || [];
    let updatedTools: string[];
    
    if (checked) {
      updatedTools = [...currentTools, toolName];
    } else {
      updatedTools = currentTools.filter(tool => tool !== toolName);
    }
    
    onUpdateData({ aiToolsUsed: updatedTools });
  };

  const getFieldErrorMessage = (fieldName: string) => {
    const error = getFieldError(fieldName);
    return error ? (
      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    ) : null;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Maturidade em IA</h2>
        <p className="text-slate-300">
          Vamos entender seu nível atual de conhecimento e experiência com Inteligência Artificial
        </p>
      </div>

      <div className="grid gap-8">
        {/* Implementação de IA */}
        <Card className="bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Você já implementou IA na sua empresa/trabalho?
              <span className="text-red-400">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.hasImplementedAI || ''}
              onValueChange={(value) => onUpdateData({ hasImplementedAI: value })}
              className="space-y-3"
            >
              {implementationOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={option.value} 
                    id={`implementation-${option.value}`}
                    className="border-white/30 text-viverblue"
                  />
                  <Label 
                    htmlFor={`implementation-${option.value}`}
                    className="text-slate-200 cursor-pointer flex-1"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {getFieldErrorMessage('hasImplementedAI')}
          </CardContent>
        </Card>

        {/* Nível de conhecimento */}
        <Card className="bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Qual seu nível de conhecimento em IA?
              <span className="text-red-400">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.aiKnowledgeLevel || ''}
              onValueChange={(value) => onUpdateData({ aiKnowledgeLevel: value })}
              className="space-y-3"
            >
              {aiKnowledgeLevels.map((level) => (
                <div key={level.value} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={level.value} 
                    id={`knowledge-${level.value}`}
                    className="border-white/30 text-viverblue"
                  />
                  <Label 
                    htmlFor={`knowledge-${level.value}`}
                    className="text-slate-200 cursor-pointer flex-1"
                  >
                    {level.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {getFieldErrorMessage('aiKnowledgeLevel')}
          </CardContent>
        </Card>

        {/* Ferramentas utilizadas */}
        <Card className="bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Quais ferramentas de IA você já utilizou?
              <span className="text-red-400">*</span>
            </CardTitle>
            <p className="text-slate-400 text-sm mt-1">
              Selecione todas que se aplicam (mínimo 1)
            </p>
          </CardHeader>
          <CardContent>
            {toolsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-viverblue" />
                <span className="ml-2 text-slate-300">Carregando ferramentas...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => (
                  <div key={tool.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`tool-${tool.id}`}
                      checked={(data.aiToolsUsed || []).includes(tool.name)}
                      onCheckedChange={(checked) => handleToolToggle(tool.name, checked as boolean)}
                      className="border-white/30"
                    />
                    <Label 
                      htmlFor={`tool-${tool.id}`}
                      className="text-slate-200 cursor-pointer flex-1 text-sm"
                    >
                      {tool.name}
                    </Label>
                  </div>
                ))}
                
                {/* Opção "Nenhuma" */}
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="tool-none"
                    checked={(data.aiToolsUsed || []).includes('Nenhuma')}
                    onCheckedChange={(checked) => handleToolToggle('Nenhuma', checked as boolean)}
                    className="border-white/30"
                  />
                  <Label 
                    htmlFor="tool-none"
                    className="text-slate-200 cursor-pointer flex-1 text-sm"
                  >
                    Nenhuma das opções acima
                  </Label>
                </div>
              </div>
            )}
            {getFieldErrorMessage('aiToolsUsed')}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingStep3;
