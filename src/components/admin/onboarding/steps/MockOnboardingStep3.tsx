
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Wrench, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingStep3Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const aiTools = [
  'ChatGPT',
  'Claude',
  'Midjourney',
  'DALL-E',
  'Notion AI',
  'Canva AI',
  'Jasper',
  'Copy.ai',
  'Grammarly',
  'Loom AI',
  'Zoom AI',
  'Microsoft Copilot',
  'Google Bard',
  'Zapier AI',
  'HubSpot AI',
  'Salesforce Einstein',
  'Adobe Firefly',
  'Figma AI',
  'GitHub Copilot',
  'Outros'
];

const dailyTools = [
  'Excel/Google Sheets',
  'Word/Google Docs',
  'PowerPoint/Google Slides',
  'Slack',
  'Microsoft Teams',
  'WhatsApp Business',
  'Gmail/Outlook',
  'Trello',
  'Asana',
  'Notion',
  'Monday.com',
  'ClickUp',
  'Zoom',
  'Google Meet',
  'Calendly',
  'Canva',
  'Photoshop',
  'Figma',
  'WordPress',
  'Shopify',
  'Instagram',
  'Facebook',
  'LinkedIn',
  'YouTube',
  'TikTok',
  'Google Analytics',
  'Facebook Ads',
  'Google Ads',
  'Mailchimp',
  'HubSpot',
  'Salesforce',
  'Outros'
];

const aiKnowledgeLevels = [
  'Iniciante - Pouco ou nenhum conhecimento',
  'Básico - Uso ocasional, ferramentas simples',
  'Intermediário - Uso regular, várias ferramentas',
  'Avançado - Implementações complexas',
  'Especialista - Desenvolvo soluções próprias'
];

const whoWillImplementOptions = [
  'Eu mesmo(a)',
  'Minha equipe interna',
  'Contratar freelancer/consultoria',
  'Ainda não sei, preciso de orientação'
];

const MockOnboardingStep3: React.FC<MockOnboardingStep3Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const handleToolsChange = (tool: string, checked: boolean, type: 'aiToolsUsed' | 'dailyTools') => {
    const currentTools = data[type] || [];
    if (checked) {
      onUpdateData({ [type]: [...currentTools, tool] });
    } else {
      onUpdateData({ [type]: currentTools.filter(t => t !== tool) });
    }
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
          Maturidade em IA
        </h2>
        <p className="text-slate-400">
          Vamos entender sua experiência com inteligência artificial
        </p>
      </div>

      <div className="space-y-6">
        {/* Experiência com IA */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div>
              <Label className="text-slate-200 text-base font-medium">
                Você já implementou IA na sua empresa? *
              </Label>
              <Select 
                value={data.hasImplementedAI || ''} 
                onValueChange={(value) => onUpdateData({ hasImplementedAI: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione sua experiência" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  <SelectItem value="yes" className="text-white hover:bg-white/10">
                    Sim, já implementei com sucesso
                  </SelectItem>
                  <SelectItem value="tried-failed" className="text-white hover:bg-white/10">
                    Tentei, mas não obtive sucesso
                  </SelectItem>
                  <SelectItem value="no" className="text-white hover:bg-white/10">
                    Nunca implementei
                  </SelectItem>
                </SelectContent>
              </Select>
              {getFieldError?.('hasImplementedAI') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('hasImplementedAI')}</p>
              )}
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Quais ferramentas de IA você já usou? (opcional)
              </Label>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                {aiTools.map((tool) => (
                  <div key={tool} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ai-tool-${tool}`}
                      checked={(data.aiToolsUsed || []).includes(tool)}
                      onCheckedChange={(checked) => 
                        handleToolsChange(tool, checked as boolean, 'aiToolsUsed')
                      }
                      className="border-white/20"
                    />
                    <Label 
                      htmlFor={`ai-tool-${tool}`}
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      {tool}
                    </Label>
                  </div>
                ))}
              </div>
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

        {/* Ferramentas Diárias */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Ferramentas do Dia a Dia</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Quais ferramentas você usa regularmente? (opcional)
              </Label>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                {dailyTools.map((tool) => (
                  <div key={tool} className="flex items-center space-x-2">
                    <Checkbox
                      id={`daily-tool-${tool}`}
                      checked={(data.dailyTools || []).includes(tool)}
                      onCheckedChange={(checked) => 
                        handleToolsChange(tool, checked as boolean, 'dailyTools')
                      }
                      className="border-white/20"
                    />
                    <Label 
                      htmlFor={`daily-tool-${tool}`}
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      {tool}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Implementação */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Implementação</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Quem vai implementar as soluções de IA? *
              </Label>
              <Select 
                value={data.whoWillImplement || ''} 
                onValueChange={(value) => onUpdateData({ whoWillImplement: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione quem irá implementar" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {whoWillImplementOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-white hover:bg-white/10">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('whoWillImplement') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('whoWillImplement')}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default MockOnboardingStep3;
