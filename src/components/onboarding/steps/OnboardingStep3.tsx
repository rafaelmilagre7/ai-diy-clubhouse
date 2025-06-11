
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingStepProps } from '../types/onboardingTypes';

const aiKnowledgeLevels = [
  'Iniciante - Pouco ou nenhum conhecimento',
  'Básico - Conheço alguns conceitos',
  'Intermediário - Uso algumas ferramentas',
  'Avançado - Implemento soluções regularmente',
  'Especialista - Desenvolvo e treino modelos'
];

const aiTools = [
  'ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Midjourney', 'DALL-E',
  'Stable Diffusion', 'Notion AI', 'Jasper', 'Copy.ai', 'Grammarly',
  'Canva AI', 'Zapier', 'Make (Integromat)', 'Bubble', 'Airtable AI',
  'Monday.com AI', 'Salesforce Einstein', 'HubSpot AI', 'Intercom Resolution Bot',
  'Calendly AI', 'Loom AI', 'Otter.ai', 'Descript', 'RunwayML', 'Synthesia',
  'Murf', 'ElevenLabs', 'Pictory', 'InVideo', 'Brandmark', 'Looka',
  'GitHub Copilot', 'Tabnine', 'Replit AI', 'Cursor', 'v0.dev', 'Bolt.new',
  'Perplexity', 'You.com', 'Phind', 'Sourcegraph Cody', 'Amazon CodeWhisperer',
  'Google Bard', 'Microsoft Bing Chat', 'Character.ai', 'Poe', 'Anthropic Claude',
  'Cohere', 'Hugging Face', 'OpenAI Playground', 'Replicate', 'Scale AI',
  'Labelbox', 'DataRobot', 'H2O.ai', 'Databricks', 'Weights & Biases'
];

const OnboardingStep3: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const selectedTools = data.aiToolsUsed || [];

  const handleToolToggle = (tool: string, checked: boolean) => {
    const currentTools = selectedTools;
    let newTools;
    
    if (checked) {
      newTools = [...currentTools, tool];
    } else {
      newTools = currentTools.filter(t => t !== tool);
    }
    
    onUpdateData({ aiToolsUsed: newTools });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Brain className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Sua Maturidade em IA
        </h2>
        <p className="text-slate-400">
          Vamos entender seu nível atual de conhecimento e experiência com inteligência artificial
        </p>
      </div>

      <div className="space-y-6">
        {/* Experiência com IA */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div>
              <Label className="text-slate-200 text-base font-medium">
                Você já implementou alguma solução de IA no seu negócio? *
              </Label>
              <Select 
                value={data.hasImplementedAI || ''} 
                onValueChange={(value) => onUpdateData({ hasImplementedAI: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione sua experiência" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  <SelectItem value="never" className="text-white hover:bg-white/10">
                    Nunca implementei IA
                  </SelectItem>
                  <SelectItem value="planning" className="text-white hover:bg-white/10">
                    Estou planejando implementar
                  </SelectItem>
                  <SelectItem value="testing" className="text-white hover:bg-white/10">
                    Estou testando algumas ferramentas
                  </SelectItem>
                  <SelectItem value="implemented" className="text-white hover:bg-white/10">
                    Já implementei algumas soluções
                  </SelectItem>
                  <SelectItem value="advanced" className="text-white hover:bg-white/10">
                    Uso IA extensivamente no meu negócio
                  </SelectItem>
                </SelectContent>
              </Select>
              {getFieldError?.('hasImplementedAI') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('hasImplementedAI')}</p>
              )}
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Qual seu nível de conhecimento em IA? *
              </Label>
              <Select 
                value={data.aiKnowledgeLevel || ''} 
                onValueChange={(value) => onUpdateData({ aiKnowledgeLevel: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione seu nível" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {aiKnowledgeLevels.map((level) => (
                    <SelectItem key={level} value={level} className="text-white hover:bg-white/10">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('aiKnowledgeLevel') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('aiKnowledgeLevel')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Ferramentas de IA */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-viverblue" />
              <Label className="text-slate-200 text-base font-medium">
                Quais ferramentas de IA você já usou ou conhece?
              </Label>
            </div>
            <p className="text-sm text-slate-400">
              Selecione todas as ferramentas que você já experimentou ou usa regularmente
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {aiTools.map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={tool}
                    checked={selectedTools.includes(tool)}
                    onCheckedChange={(checked) => handleToolToggle(tool, checked as boolean)}
                    className="border-white/30 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                  />
                  <Label 
                    htmlFor={tool} 
                    className="text-sm text-slate-300 cursor-pointer"
                  >
                    {tool}
                  </Label>
                </div>
              ))}
            </div>
            
            {selectedTools.length > 0 && (
              <div className="mt-4 p-3 bg-viverblue/10 border border-viverblue/30 rounded-lg">
                <p className="text-sm text-viverblue font-medium">
                  {selectedTools.length} ferramenta(s) selecionada(s): {selectedTools.slice(0, 3).join(', ')}
                  {selectedTools.length > 3 && ` e mais ${selectedTools.length - 3}...`}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default OnboardingStep3;
