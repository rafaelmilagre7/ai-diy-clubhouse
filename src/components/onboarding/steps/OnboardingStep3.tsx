
import React, { useEffect } from 'react';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import { EnhancedFieldIndicator } from '../components/EnhancedFieldIndicator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Lightbulb, Target, Clock } from 'lucide-react';

const OnboardingStep3: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  memberType = 'club',
  getFieldError
}) => {
  const { generatedMessage, isGenerating, generateMessage } = useAIMessageGeneration();

  // Gerar mensagem personalizada quando os dados mudarem
  useEffect(() => {
    if (data.hasImplementedAI && data.aiKnowledgeLevel) {
      generateMessage(data, memberType);
    }
  }, [data.hasImplementedAI, data.aiKnowledgeLevel, memberType, generateMessage]);

  const handleFieldChange = (field: string, value: any) => {
    onUpdateData({ [field]: value });
  };

  const aiTools = [
    'ChatGPT', 'Claude AI', 'Gemini (Bard)', 'Microsoft Copilot', 'Jasper AI',
    'Copy.ai', 'Writesonic', 'Grammarly AI', 'Notion AI', 'Canva AI',
    'Midjourney', 'DALL-E', 'Stable Diffusion', 'RunwayML', 'Luma AI',
    'Zapier AI', 'Make (Integromat)', 'Power Automate', 'n8n', 'GitHub Copilot',
    'Cursor AI', 'Replit AI', 'Tabnine', 'MoneyGPT', 'Perplexity AI',
    'Character.AI', 'Replika', 'Pi AI', 'You.com', 'Poe by Quora',
    'Otter.ai', 'Rev AI', 'Descript', 'Murf AI', 'ElevenLabs',
    'Synthesia', 'D-ID', 'HeyGen', 'Pictory', 'InVideo AI',
    'Salesforce Einstein', 'HubSpot AI', 'Intercom Resolution Bot', 'Drift AI', 'Zendesk AI',
    'Tableau AI', 'Power BI AI', 'Looker AI', 'DataRobot', 'H2O.ai',
    'Calendly AI', 'Motion', 'Reclaim AI', 'Clockify AI', 'RescueTime AI',
    'Adobe Sensei', 'Figma AI', 'Sketch2React', 'Framer AI', 'Webflow AI',
    'Krisp', 'Zoom AI Companion', 'Teams Premium AI', 'Slack AI', 'Discord Carl-bot',
    'Luma Calendar', 'Cal.com AI', 'Scheduler AI', 'Acuity AI', 'Calendso',
    'Notion AI', 'Obsidian AI', 'Roam Research AI', 'Logseq', 'RemNote AI'
  ];

  const dailyTools = [
    'Microsoft Office 365', 'Google Workspace', 'Slack', 'Discord', 'Zoom',
    'Teams', 'Notion', 'Trello', 'Asana', 'Monday.com', 'Jira', 'GitHub',
    'GitLab', 'Figma', 'Canva', 'Adobe Creative Suite', 'Salesforce',
    'HubSpot', 'Mailchimp', 'ConvertKit', 'Shopify', 'WooCommerce',
    'WordPress', 'Webflow', 'Squarespace', 'Tableau', 'Power BI',
    'Excel', 'Google Sheets', 'Calendly', 'Loom', 'OBS Studio'
  ];

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-viverblue" />
          <h2 className="text-2xl font-heading font-bold text-white">
            Maturidade em IA
          </h2>
        </div>
        <p className="text-neutral-400 text-sm max-w-2xl mx-auto">
          Queremos entender seu nível atual de conhecimento e experiência com Inteligência Artificial 
          para personalizar sua jornada de aprendizado.
        </p>
      </div>

      {/* Mensagem IA Personalizada */}
      <AIMessageDisplay 
        message={generatedMessage}
        isLoading={isGenerating}
      />

      <div className="grid gap-8">
        {/* Experiência com IA */}
        <Card className="p-6 bg-[#151823] border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-viverblue" />
              <Label className="text-white font-semibold">
                Você já implementou IA na sua empresa ou projetos?
                <EnhancedFieldIndicator 
                  isRequired={true}
                  hasError={!!getFieldError?.('hasImplementedAI')}
                />
              </Label>
            </div>
            
            <RadioGroup 
              value={data.hasImplementedAI || ''} 
              onValueChange={(value) => handleFieldChange('hasImplementedAI', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                <RadioGroupItem value="yes" className="border-white/30" />
                <Label className="text-neutral-200 cursor-pointer flex-1">
                  Sim, já implementei e está funcionando bem
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                <RadioGroupItem value="tried-failed" className="border-white/30" />
                <Label className="text-neutral-200 cursor-pointer flex-1">
                  Tentei implementar, mas não deu certo
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                <RadioGroupItem value="no" className="border-white/30" />
                <Label className="text-neutral-200 cursor-pointer flex-1">
                  Não, ainda não implementei
                </Label>
              </div>
            </RadioGroup>
            
            {getFieldError?.('hasImplementedAI') && (
              <p className="text-red-400 text-sm">{getFieldError('hasImplementedAI')}</p>
            )}
          </div>
        </Card>

        {/* Ferramentas de IA */}
        <Card className="p-6 bg-[#151823] border-white/10">
          <div className="space-y-4">
            <Label className="text-white font-semibold">
              Quais ferramentas de IA você já usa ou conhece? (Selecione todas que se aplicam)
            </Label>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {aiTools.map((tool) => (
                <div key={tool} className="flex items-center space-x-2 p-2 rounded border border-white/10">
                  <Checkbox
                    id={tool}
                    checked={data.aiToolsUsed?.includes(tool) || false}
                    onCheckedChange={(checked) => {
                      const currentTools = data.aiToolsUsed || [];
                      if (checked) {
                        handleFieldChange('aiToolsUsed', [...currentTools, tool]);
                      } else {
                        handleFieldChange('aiToolsUsed', currentTools.filter(t => t !== tool));
                      }
                    }}
                  />
                  <Label htmlFor={tool} className="text-neutral-200 text-sm cursor-pointer">
                    {tool}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Nível de Conhecimento */}
        <Card className="p-6 bg-[#151823] border-white/10">
          <div className="space-y-4">
            <Label className="text-white font-semibold">
              Como você avalia seu nível de conhecimento em IA?
              <EnhancedFieldIndicator 
                isRequired={true}
                hasError={!!getFieldError?.('aiKnowledgeLevel')}
              />
            </Label>
            
            <Select value={data.aiKnowledgeLevel || ''} onValueChange={(value) => handleFieldChange('aiKnowledgeLevel', value)}>
              <SelectTrigger className="bg-[#1A1D2E] border-white/20 text-white">
                <SelectValue placeholder="Selecione seu nível" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1D2E] border-white/20">
                <SelectItem value="beginner" className="text-white hover:bg-white/10">
                  Iniciante - Pouco ou nenhum conhecimento
                </SelectItem>
                <SelectItem value="intermediate" className="text-white hover:bg-white/10">
                  Intermediário - Conhecimento básico e alguma experiência
                </SelectItem>
                <SelectItem value="advanced" className="text-white hover:bg-white/10">
                  Avançado - Bom conhecimento e experiência prática
                </SelectItem>
                <SelectItem value="expert" className="text-white hover:bg-white/10">
                  Especialista - Conhecimento profundo e vasta experiência
                </SelectItem>
              </SelectContent>
            </Select>
            
            {getFieldError?.('aiKnowledgeLevel') && (
              <p className="text-red-400 text-sm">{getFieldError('aiKnowledgeLevel')}</p>
            )}
          </div>
        </Card>

        {/* Ferramentas do Dia a Dia */}
        <Card className="p-6 bg-[#151823] border-white/10">
          <div className="space-y-4">
            <Label className="text-white font-semibold">
              Quais ferramentas você usa no seu dia a dia de trabalho?
            </Label>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {dailyTools.map((tool) => (
                <div key={tool} className="flex items-center space-x-2 p-2 rounded border border-white/10">
                  <Checkbox
                    id={`daily-${tool}`}
                    checked={data.dailyTools?.includes(tool) || false}
                    onCheckedChange={(checked) => {
                      const currentTools = data.dailyTools || [];
                      if (checked) {
                        handleFieldChange('dailyTools', [...currentTools, tool]);
                      } else {
                        handleFieldChange('dailyTools', currentTools.filter(t => t !== tool));
                      }
                    }}
                  />
                  <Label htmlFor={`daily-${tool}`} className="text-neutral-200 text-sm cursor-pointer">
                    {tool}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Implementação */}
        <Card className="p-6 bg-[#151823] border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-viverblue" />
              <Label className="text-white font-semibold">
                Quem será responsável por implementar as soluções de IA?
                <EnhancedFieldIndicator 
                  isRequired={true}
                  hasError={!!getFieldError?.('whoWillImplement')}
                />
              </Label>
            </div>
            
            <RadioGroup 
              value={data.whoWillImplement || ''} 
              onValueChange={(value) => handleFieldChange('whoWillImplement', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                <RadioGroupItem value="myself" className="border-white/30" />
                <Label className="text-neutral-200 cursor-pointer flex-1">
                  Eu mesmo vou implementar
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                <RadioGroupItem value="team" className="border-white/30" />
                <Label className="text-neutral-200 cursor-pointer flex-1">
                  Minha equipe atual
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                <RadioGroupItem value="hire" className="border-white/30" />
                <Label className="text-neutral-200 cursor-pointer flex-1">
                  Vou contratar especialistas
                </Label>
              </div>
            </RadioGroup>
            
            {getFieldError?.('whoWillImplement') && (
              <p className="text-red-400 text-sm">{getFieldError('whoWillImplement')}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingStep3;
