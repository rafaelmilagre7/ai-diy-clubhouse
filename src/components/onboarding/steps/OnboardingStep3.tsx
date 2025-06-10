
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';

interface OnboardingStep3Props {
  data: OnboardingData;
  onDataChange: (data: Partial<OnboardingData>) => void;
  errors?: Record<string, string>;
}

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ data, onDataChange, errors }) => {
  const { aiMessage, isGenerating } = useAIMessageGeneration(data, 3);

  const handleFieldChange = (field: keyof OnboardingData, value: any) => {
    // Garantir tipagem correta para hasImplementedAI
    if (field === 'hasImplementedAI') {
      const validValues: Array<"" | "no" | "yes" | "tried-failed"> = ["", "no", "yes", "tried-failed"];
      const typedValue = validValues.includes(value as any) ? value as "" | "no" | "yes" | "tried-failed" : "";
      onDataChange({
        [field]: typedValue,
        // Limpar ferramentas se mudou para "não"
        ...(typedValue === 'no' ? { aiToolsUsed: [] } : {})
      });
    } else {
      onDataChange({ [field]: value });
    }
  };

  const handleToolSelection = (tool: string, checked: boolean) => {
    const currentTools = data.aiToolsUsed || [];
    const updatedTools = checked 
      ? [...currentTools, tool]
      : currentTools.filter(t => t !== tool);
    
    handleFieldChange('aiToolsUsed', updatedTools);
  };

  // Lista expandida de ferramentas de IA
  const aiTools = [
    // Assistentes Conversacionais
    'ChatGPT',
    'Claude (Anthropic)',
    'Gemini (Google)',
    'Grok (X/Twitter)',
    'Perplexity',
    
    // Ferramentas de Desenvolvimento
    'GitHub Copilot',
    'Cursor',
    'Lovable',
    'Replit Ghostwriter',
    'Tabnine',
    
    // Ferramentas de Design
    'Midjourney',
    'DALL-E',
    'Stable Diffusion',
    'Figma AI',
    'Canva AI',
    
    // Ferramentas de Produtividade
    'Notion AI',
    'Jasper',
    'Copy.ai',
    'Grammarly',
    'Otter.ai',
    
    // Análise e Dados
    'DataRobot',
    'H2O.ai',
    'IBM Watson',
    'Microsoft Copilot',
    
    // Outras
    'Runway ML',
    'Synthesia',
    'Loom AI',
    'Zapier AI'
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sua Experiência com IA
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Conte-nos sobre sua jornada com inteligência artificial
        </p>
      </div>

      <AIMessageDisplay message={aiMessage} isGenerating={isGenerating} />

      <div className="grid gap-8">
        {/* Experiência com IA - Sempre exibida */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Você já implementou ou tentou implementar IA na sua empresa/trabalho?</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.hasImplementedAI || ''}
              onValueChange={(value: "" | "no" | "yes" | "tried-failed") => handleFieldChange('hasImplementedAI', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="implemented-yes" />
                <Label htmlFor="implemented-yes">Sim, já implementei com sucesso</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tried-failed" id="implemented-tried" />
                <Label htmlFor="implemented-tried">Tentei, mas não consegui implementar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="implemented-no" />
                <Label htmlFor="implemented-no">Não, ainda não tentei</Label>
              </div>
            </RadioGroup>
            {errors?.hasImplementedAI && (
              <p className="text-red-500 text-sm mt-2">{errors.hasImplementedAI}</p>
            )}
          </CardContent>
        </Card>

        {/* Ferramentas Utilizadas - Sempre exibida */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quais ferramentas/soluções de IA já usou? (pode marcar várias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {aiTools.map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tool-${tool}`}
                    checked={data.aiToolsUsed?.includes(tool) || false}
                    onCheckedChange={(checked) => handleToolSelection(tool, checked as boolean)}
                  />
                  <Label 
                    htmlFor={`tool-${tool}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {tool}
                  </Label>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Selecionou {data.aiToolsUsed?.length || 0} ferramenta(s)
            </div>
          </CardContent>
        </Card>

        {/* Nível de Conhecimento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como você classificaria seu nível de conhecimento sobre IA?</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.aiKnowledgeLevel || ''}
              onValueChange={(value) => handleFieldChange('aiKnowledgeLevel', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="knowledge-beginner" />
                <Label htmlFor="knowledge-beginner">Iniciante - Sei pouco sobre IA</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="knowledge-intermediate" />
                <Label htmlFor="knowledge-intermediate">Intermediário - Tenho conhecimento básico</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="knowledge-advanced" />
                <Label htmlFor="knowledge-advanced">Avançado - Tenho bastante experiência</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expert" id="knowledge-expert" />
                <Label htmlFor="knowledge-expert">Especialista - Sou profundo conhecedor</Label>
              </div>
            </RadioGroup>
            {errors?.aiKnowledgeLevel && (
              <p className="text-red-500 text-sm mt-2">{errors.aiKnowledgeLevel}</p>
            )}
          </CardContent>
        </Card>

        {/* Ferramentas do Dia a Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quais ferramentas você usa no dia a dia de trabalho?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Microsoft Office', 'Google Workspace', 'Slack', 'Discord', 'Zoom', 'Teams',
                'Trello', 'Asana', 'Monday.com', 'Notion', 'Evernote', 'Dropbox',
                'Photoshop', 'Canva', 'Figma', 'WordPress', 'Shopify', 'HubSpot',
                'Salesforce', 'Zendesk', 'Mailchimp', 'WhatsApp Business', 'Instagram', 'LinkedIn'
              ].map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={`daily-${tool}`}
                    checked={data.dailyTools?.includes(tool) || false}
                    onCheckedChange={(checked) => {
                      const currentTools = data.dailyTools || [];
                      const updatedTools = checked 
                        ? [...currentTools, tool]
                        : currentTools.filter(t => t !== tool);
                      handleFieldChange('dailyTools', updatedTools);
                    }}
                  />
                  <Label htmlFor={`daily-${tool}`} className="text-sm font-normal cursor-pointer">
                    {tool}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quem Implementará */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quem será responsável por implementar as soluções de IA?</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.whoWillImplement || ''}
              onValueChange={(value) => handleFieldChange('whoWillImplement', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="myself" id="implement-myself" />
                <Label htmlFor="implement-myself">Eu mesmo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="implement-team" />
                <Label htmlFor="implement-team">Minha equipe interna</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="consultant" id="implement-consultant" />
                <Label htmlFor="implement-consultant">Consultor/Freelancer externo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="agency" id="implement-agency" />
                <Label htmlFor="implement-agency">Agência especializada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="undecided" id="implement-undecided" />
                <Label htmlFor="implement-undecided">Ainda não decidi</Label>
              </div>
            </RadioGroup>
            {errors?.whoWillImplement && (
              <p className="text-red-500 text-sm mt-2">{errors.whoWillImplement}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingStep3;
