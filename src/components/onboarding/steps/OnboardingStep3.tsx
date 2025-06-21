
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Zap, Users, Target } from 'lucide-react';
import { OnboardingData } from '../types/onboardingTypes';

interface OnboardingStep3Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  onNext: () => Promise<void>;
  onPrev: () => void;
  memberType: 'club' | 'formacao';
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
}

const aiTools = [
  { id: 'chatgpt', label: 'ChatGPT', icon: '🤖' },
  { id: 'copilot', label: 'GitHub Copilot', icon: '👨‍💻' },
  { id: 'claude', label: 'Claude', icon: '🧠' },
  { id: 'midjourney', label: 'Midjourney', icon: '🎨' },
  { id: 'gemini', label: 'Google Gemini', icon: '💎' },
  { id: 'notion-ai', label: 'Notion AI', icon: '📝' },
  { id: 'canva-ai', label: 'Canva AI', icon: '🎨' },
  { id: 'jasper', label: 'Jasper', icon: '✍️' },
  { id: 'outro', label: 'Outras ferramentas', icon: '🔧' },
  { id: 'nenhuma', label: 'Não uso IA ainda', icon: '❌' }
];

export const OnboardingStep3: React.FC<OnboardingStep3Props> = ({
  data,
  onUpdateData,
  onNext,
  onPrev,
  validationErrors,
  getFieldError
}) => {
  const handleAiImplementationChange = (value: string) => {
    console.log('[STEP3] Mudando hasImplementedAI para:', value);
    onUpdateData({ hasImplementedAI: value });
  };

  const handleKnowledgeLevelChange = (value: string) => {
    console.log('[STEP3] Mudando aiKnowledgeLevel para:', value);
    onUpdateData({ aiKnowledgeLevel: value });
  };

  const handleToolChange = (toolId: string, checked: boolean) => {
    const currentTools = data.aiToolsUsed || [];
    let newTools;
    
    if (checked) {
      newTools = [...currentTools, toolId];
    } else {
      newTools = currentTools.filter(tool => tool !== toolId);
    }
    
    console.log('[STEP3] Mudando aiToolsUsed para:', newTools);
    onUpdateData({ aiToolsUsed: newTools });
  };

  const isToolSelected = (toolId: string) => {
    return data.aiToolsUsed?.includes(toolId) || false;
  };

  console.log('[STEP3] Dados atuais:', {
    hasImplementedAI: data.hasImplementedAI,
    aiKnowledgeLevel: data.aiKnowledgeLevel,
    aiToolsUsed: data.aiToolsUsed
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-viverblue to-purple-600 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Maturidade em IA
          </h2>
          <p className="text-slate-300">
            Vamos entender seu nível atual de conhecimento e experiência com Inteligência Artificial
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Implementação de IA */}
        <Card className="bg-[#1A1E2E]/50 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-viverblue" />
                <Label className="text-lg font-medium text-white">
                  Sua empresa já implementou alguma solução de IA? *
                </Label>
              </div>
              
              <RadioGroup
                value={data.hasImplementedAI || ''}
                onValueChange={handleAiImplementationChange}
                className="grid grid-cols-1 gap-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <RadioGroupItem value="sim" id="impl-sim" />
                  <Label htmlFor="impl-sim" className="text-white cursor-pointer flex-1">
                    Sim, já temos soluções de IA implementadas
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <RadioGroupItem value="nao" id="impl-nao" />
                  <Label htmlFor="impl-nao" className="text-white cursor-pointer flex-1">
                    Não, ainda não implementamos
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <RadioGroupItem value="planejando" id="impl-planejando" />
                  <Label htmlFor="impl-planejando" className="text-white cursor-pointer flex-1">
                    Estamos planejando implementar
                  </Label>
                </div>
              </RadioGroup>
              
              {getFieldError('hasImplementedAI') && (
                <p className="text-red-400 text-sm">{getFieldError('hasImplementedAI')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Nível de Conhecimento */}
        <Card className="bg-[#1A1E2E]/50 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-viverblue" />
                <Label className="text-lg font-medium text-white">
                  Como você avalia seu nível de conhecimento em IA? *
                </Label>
              </div>
              
              <RadioGroup
                value={data.aiKnowledgeLevel || ''}
                onValueChange={handleKnowledgeLevelChange}
                className="grid grid-cols-1 gap-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <RadioGroupItem value="iniciante" id="level-iniciante" />
                  <Label htmlFor="level-iniciante" className="text-white cursor-pointer flex-1">
                    <div>
                      <div className="font-medium">Iniciante</div>
                      <div className="text-sm text-slate-300">Tenho pouco ou nenhum conhecimento</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <RadioGroupItem value="intermediario" id="level-intermediario" />
                  <Label htmlFor="level-intermediario" className="text-white cursor-pointer flex-1">
                    <div>
                      <div className="font-medium">Intermediário</div>
                      <div className="text-sm text-slate-300">Uso algumas ferramentas e entendo conceitos básicos</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <RadioGroupItem value="avancado" id="level-avancado" />
                  <Label htmlFor="level-avancado" className="text-white cursor-pointer flex-1">
                    <div>
                      <div className="font-medium">Avançado</div>
                      <div className="text-sm text-slate-300">Tenho conhecimento técnico e experiência prática</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              
              {getFieldError('aiKnowledgeLevel') && (
                <p className="text-red-400 text-sm">{getFieldError('aiKnowledgeLevel')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ferramentas de IA */}
        <Card className="bg-[#1A1E2E]/50 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-viverblue" />
                <Label className="text-lg font-medium text-white">
                  Quais ferramentas de IA você já usa ou conhece? *
                </Label>
              </div>
              <p className="text-sm text-slate-300">Selecione todas que se aplicam</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Checkbox
                      id={tool.id}
                      checked={isToolSelected(tool.id)}
                      onCheckedChange={(checked) => handleToolChange(tool.id, checked as boolean)}
                    />
                    <Label htmlFor={tool.id} className="text-white cursor-pointer flex-1 flex items-center gap-2">
                      <span className="text-lg">{tool.icon}</span>
                      {tool.label}
                    </Label>
                  </div>
                ))}
              </div>
              
              {getFieldError('aiToolsUsed') && (
                <p className="text-red-400 text-sm">{getFieldError('aiToolsUsed')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrev}
          variant="outline"
          className="bg-transparent border-white/20 text-white hover:bg-white/5"
        >
          Voltar
        </Button>
        <Button
          onClick={onNext}
          className="bg-viverblue hover:bg-viverblue-dark text-white px-8"
        >
          Próxima Etapa
        </Button>
      </div>
    </motion.div>
  );
};

export default OnboardingStep3;
