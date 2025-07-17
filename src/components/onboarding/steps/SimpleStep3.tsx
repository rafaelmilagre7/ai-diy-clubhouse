import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Brain, Zap, Settings } from 'lucide-react';
import { SimpleOnboardingData } from '@/hooks/useSimpleOnboarding';

interface SimpleStep3Props {
  data: SimpleOnboardingData;
  onNext: (stepData: Partial<SimpleOnboardingData>) => Promise<boolean>;
  onPrevious: () => void;
  isLoading: boolean;
}

const AI_KNOWLEDGE_LEVELS = [
  { value: 'beginner', label: 'Iniciante', description: 'Pouco ou nenhum conhecimento sobre IA' },
  { value: 'intermediate', label: 'Intermediário', description: 'Algum conhecimento, já usei algumas ferramentas' },
  { value: 'advanced', label: 'Avançado', description: 'Bom conhecimento, já implementei soluções de IA' }
];

const AI_TOOLS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Copilot',
  'Midjourney',
  'Stable Diffusion',
  'Make.com',
  'Zapier',
  'Notion AI',
  'Ainda não usei nenhuma'
];

export const SimpleStep3: React.FC<SimpleStep3Props> = ({ data, onNext, onPrevious, isLoading }) => {
  const [formData, setFormData] = useState({
    ai_knowledge_level: data.ai_experience.ai_knowledge_level || '',
    has_implemented_ai: data.ai_experience.has_implemented_ai || '',
    ai_tools_used: data.ai_experience.ai_tools_used || [],
  });

  // Atualizar formData quando data mudar
  useEffect(() => {
    setFormData({
      ai_knowledge_level: data.ai_experience.ai_knowledge_level || '',
      has_implemented_ai: data.ai_experience.has_implemented_ai || '',
      ai_tools_used: data.ai_experience.ai_tools_used || [],
    });
  }, [data.ai_experience]);

  const handleSubmit = async () => {
    const stepData: Partial<SimpleOnboardingData> = {
      ai_experience: {
        ai_knowledge_level: formData.ai_knowledge_level,
        has_implemented_ai: formData.has_implemented_ai,
        ai_tools_used: formData.ai_tools_used,
      }
    };

    await onNext(stepData);
  };

  const handleToolToggle = (tool: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      ai_tools_used: checked 
        ? [...prev.ai_tools_used, tool]
        : prev.ai_tools_used.filter(t => t !== tool)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Experiência com IA</h1>
        <p className="text-muted-foreground">
          Queremos entender seu nível atual para personalizar o conteúdo.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Nível de conhecimento */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Brain className="w-4 h-4" />
            Qual seu nível de conhecimento em IA?
          </Label>
          <RadioGroup
            value={formData.ai_knowledge_level}
            onValueChange={(value) => setFormData(prev => ({ ...prev, ai_knowledge_level: value }))}
          >
            {AI_KNOWLEDGE_LEVELS.map((level) => (
              <div key={level.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value={level.value} id={level.value} className="mt-1" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor={level.value} className="font-medium cursor-pointer">
                    {level.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Já implementou IA */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Settings className="w-4 h-4" />
            Já implementou alguma solução de IA no trabalho?
          </Label>
          <RadioGroup
            value={formData.has_implemented_ai}
            onValueChange={(value) => setFormData(prev => ({ ...prev, has_implemented_ai: value }))}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="yes" id="implemented_yes" />
              <Label htmlFor="implemented_yes" className="cursor-pointer">
                Sim, já implementei
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="no" id="implemented_no" />
              <Label htmlFor="implemented_no" className="cursor-pointer">
                Não, ainda não
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="planning" id="implemented_planning" />
              <Label htmlFor="implemented_planning" className="cursor-pointer">
                Estou planejando implementar
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Ferramentas utilizadas */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Zap className="w-4 h-4" />
            Quais ferramentas de IA você já utilizou? (selecione todas que se aplicam)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {AI_TOOLS.map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={tool}
                  checked={formData.ai_tools_used.includes(tool)}
                  onCheckedChange={(checked) => handleToolToggle(tool, checked as boolean)}
                />
                <Label htmlFor={tool} className="text-sm cursor-pointer">
                  {tool}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={isLoading}>
          ← Voltar
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !formData.ai_knowledge_level}
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