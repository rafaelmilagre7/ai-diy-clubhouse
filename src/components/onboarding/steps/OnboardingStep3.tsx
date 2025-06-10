
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { motion } from 'framer-motion';
import { Brain, Zap, Users, Target } from 'lucide-react';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import { EnhancedFieldIndicator } from '../components/EnhancedFieldIndicator';

const OnboardingStep3 = ({ data, onUpdateData, validationErrors = [], getFieldError }: OnboardingStepProps) => {
  const [localData, setLocalData] = useState({
    hasImplementedAI: data.hasImplementedAI || '',
    aiToolsUsed: data.aiToolsUsed || [],
    aiKnowledgeLevel: data.aiKnowledgeLevel || '',
    dailyTools: data.dailyTools || [],
    whoWillImplement: data.whoWillImplement || ''
  });

  const handleFieldChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onUpdateData(newData);
  };

  const handleToolToggle = (toolName: string, isChecked: boolean) => {
    const currentTools = localData.aiToolsUsed || [];
    const updatedTools = isChecked 
      ? [...currentTools, toolName]
      : currentTools.filter(tool => tool !== toolName);
    
    handleFieldChange('aiToolsUsed', updatedTools);
  };

  const handleDailyToolToggle = (toolName: string, isChecked: boolean) => {
    const currentTools = localData.dailyTools || [];
    const updatedTools = isChecked 
      ? [...currentTools, toolName]
      : currentTools.filter(tool => tool !== toolName);
    
    handleFieldChange('dailyTools', updatedTools);
  };

  const aiTools = [
    'ChatGPT',
    'Claude',
    'Gemini (Google)',
    'Copilot (Microsoft)',
    'Lovable',
    'Grok',
    'Perplexity',
    'Midjourney',
    'DALL-E',
    'Stable Diffusion',
    'Runway',
    'Notion AI',
    'Jasper',
    'Copy.ai',
    'Grammarly',
    'GitHub Copilot',
    'Cursor',
    'Canva AI',
    'Adobe Firefly',
    'ChatSonic',
    'Character.AI',
    'Poe',
    'Bard (descontinuado)',
    'Bing Chat',
    'YouChat',
    'Replika',
    'DeepL Write',
    'Murf AI',
    'Synthesia',
    'Luma AI',
    'RunwayML',
    'Pictory',
    'Descript',
    'Otter.ai',
    'Fireflies.ai',
    'MonkeyLearn',
    'Zapier AI',
    'Make (Integromat)',
    'Automation Anywhere',
    'UiPath',
    'Robotic Process Automation (RPA)',
    'Power Platform AI',
    'Salesforce Einstein',
    'HubSpot AI',
    'Intercom Resolution Bot',
    'Zendesk Answer Bot',
    'Drift Conversational AI',
    'Freshworks Freddy AI',
    'IBM Watson',
    'Amazon Alexa for Business',
    'Google Assistant',
    'Microsoft Cortana',
    'Siri Shortcuts',
    'IFTTT',
    'Outro'
  ];

  const dailyTools = [
    'Microsoft Office',
    'Google Workspace',
    'Slack',
    'Teams',
    'Zoom',
    'Notion',
    'Trello',
    'Asana',
    'Monday.com',
    'ClickUp',
    'Jira',
    'Confluence',
    'Figma',
    'Adobe Creative Suite',
    'Canva',
    'Mailchimp',
    'HubSpot',
    'Salesforce',
    'Zapier',
    'Outro'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <AIMessageDisplay 
        message={data.aiMessage3} 
        isLoading={false}
      />

      <Card className="bg-[#151823] border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5 text-viverblue" />
            Maturidade em IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pergunta sobre implementação de IA */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Sua empresa já implementou alguma solução de IA?
              <EnhancedFieldIndicator isRequired />
            </Label>
            <RadioGroup 
              value={localData.hasImplementedAI} 
              onValueChange={(value) => handleFieldChange('hasImplementedAI', value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="ai-yes" className="border-white/20 text-viverblue" />
                <Label htmlFor="ai-yes" className="text-white cursor-pointer">
                  Sim, já implementamos e está funcionando bem
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tried-failed" id="ai-tried" className="border-white/20 text-viverblue" />
                <Label htmlFor="ai-tried" className="text-white cursor-pointer">
                  Tentamos implementar, mas não deu certo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="ai-no" className="border-white/20 text-viverblue" />
                <Label htmlFor="ai-no" className="text-white cursor-pointer">
                  Não, ainda não implementamos nada
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('hasImplementedAI') && (
              <p className="text-red-400 text-sm">{getFieldError('hasImplementedAI')}</p>
            )}
          </div>

          {/* Pergunta sobre ferramentas - SEMPRE EXIBIDA */}
          <div className="space-y-3">
            <Label className="text-white">
              Quais ferramentas/soluções de IA já usou? (pode marcar várias)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 border border-white/10 rounded-lg bg-white/5">
              {aiTools.map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tool-${tool}`}
                    checked={localData.aiToolsUsed?.includes(tool)}
                    onCheckedChange={(checked) => handleToolToggle(tool, checked as boolean)}
                    className="border-white/20 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                  />
                  <Label 
                    htmlFor={`tool-${tool}`} 
                    className="text-white text-sm cursor-pointer hover:text-viverblue transition-colors"
                  >
                    {tool}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Nível de conhecimento */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              Como você avalia seu nível de conhecimento em IA?
              <EnhancedFieldIndicator isRequired />
            </Label>
            <RadioGroup 
              value={localData.aiKnowledgeLevel} 
              onValueChange={(value) => handleFieldChange('aiKnowledgeLevel', value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="level-beginner" className="border-white/20 text-viverblue" />
                <Label htmlFor="level-beginner" className="text-white cursor-pointer">
                  Iniciante - Pouco ou nenhum conhecimento
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="level-intermediate" className="border-white/20 text-viverblue" />
                <Label htmlFor="level-intermediate" className="text-white cursor-pointer">
                  Intermediário - Já uso algumas ferramentas básicas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="level-advanced" className="border-white/20 text-viverblue" />
                <Label htmlFor="level-advanced" className="text-white cursor-pointer">
                  Avançado - Implemento soluções complexas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expert" id="level-expert" className="border-white/20 text-viverblue" />
                <Label htmlFor="level-expert" className="text-white cursor-pointer">
                  Expert - Desenvolvo e treino modelos próprios
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('aiKnowledgeLevel') && (
              <p className="text-red-400 text-sm">{getFieldError('aiKnowledgeLevel')}</p>
            )}
          </div>

          {/* Ferramentas do dia a dia */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <Target className="w-4 h-4" />
              Quais ferramentas usa no dia a dia? (pode marcar várias)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2 border border-white/10 rounded-lg bg-white/5">
              {dailyTools.map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={`daily-${tool}`}
                    checked={localData.dailyTools?.includes(tool)}
                    onCheckedChange={(checked) => handleDailyToolToggle(tool, checked as boolean)}
                    className="border-white/20 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                  />
                  <Label 
                    htmlFor={`daily-${tool}`} 
                    className="text-white text-sm cursor-pointer hover:text-viverblue transition-colors"
                  >
                    {tool}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Quem vai implementar */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Quem será responsável por implementar as soluções de IA?
              <EnhancedFieldIndicator isRequired />
            </Label>
            <RadioGroup 
              value={localData.whoWillImplement} 
              onValueChange={(value) => handleFieldChange('whoWillImplement', value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="myself" id="impl-myself" className="border-white/20 text-viverblue" />
                <Label htmlFor="impl-myself" className="text-white cursor-pointer">
                  Eu mesmo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="impl-team" className="border-white/20 text-viverblue" />
                <Label htmlFor="impl-team" className="text-white cursor-pointer">
                  Minha equipe interna
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hire" id="impl-hire" className="border-white/20 text-viverblue" />
                <Label htmlFor="impl-hire" className="text-white cursor-pointer">
                  Vamos contratar especialistas
                </Label>
              </div>
            </RadioGroup>
            {getFieldError?.('whoWillImplement') && (
              <p className="text-red-400 text-sm">{getFieldError('whoWillImplement')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OnboardingStep3;
