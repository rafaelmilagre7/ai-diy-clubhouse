
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Lightbulb, Settings, Users, Sparkles } from 'lucide-react';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';

const OnboardingStep3: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  memberType,
  getFieldError
}) => {
  const { generateMessage, isGenerating, generatedMessage } = useAIMessageGeneration();
  const [shouldGenerateMessage, setShouldGenerateMessage] = useState(false);

  const ferramentasIA = [
    'ChatGPT',
    'Claude',
    'Gemini',
    'Midjourney',
    'DALL-E',
    'GitHub Copilot',
    'Notion AI',
    'Jasper',
    'Copy.ai',
    'Canva AI',
    'Loom AI',
    'Zoom AI',
    'Outras'
  ];

  const ferramentasDiarias = [
    'Microsoft Office',
    'Google Workspace',
    'Slack',
    'Trello/Asana',
    'Zoom/Teams',
    'WhatsApp Business',
    'Canva',
    'Adobe Creative',
    'Notion',
    'Excel avançado',
    'CRM/ERP',
    'Outras'
  ];

  const niveisConhecimento = [
    'Iniciante - Nunca usei IA',
    'Básico - Já testei algumas ferramentas',
    'Intermediário - Uso regularmente algumas IAs',
    'Avançado - Integro IA no meu trabalho',
    'Especialista - Implemento soluções complexas'
  ];

  // Gerar mensagem quando maturidade em IA estiver preenchida
  useEffect(() => {
    const hasMaturityData = data.hasImplementedAI && data.aiKnowledgeLevel;
    const hasImplementedAIBool = data.hasImplementedAI === 'sim' || data.hasImplementedAI === true;
    
    if (hasMaturityData && !generatedMessage && !isGenerating && !shouldGenerateMessage) {
      setShouldGenerateMessage(true);
      generateMessage(data, memberType);
    }
  }, [data.hasImplementedAI, data.aiKnowledgeLevel, generatedMessage, isGenerating, shouldGenerateMessage, generateMessage, data, memberType]);

  const handleInputChange = (field: string, value: string | string[]) => {
    onUpdateData({ [field]: value });
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const currentValues = (data[field as keyof typeof data] as string[]) || [];
    if (checked) {
      handleInputChange(field, [...currentValues, value]);
    } else {
      handleInputChange(field, currentValues.filter(item => item !== value));
    }
  };

  // Converter string para boolean de forma segura
  const hasImplementedAI = data.hasImplementedAI === 'sim' || data.hasImplementedAI === true;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-viverblue/20 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-viverblue" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Maturidade em IA
        </h2>
        <p className="text-slate-300">
          Conte-nos sobre sua experiência atual com inteligência artificial
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Experiência */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Experiência com IA */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Experiência com IA</h3>
              </div>

              <div>
                <Label htmlFor="hasImplementedAI" className="text-slate-200">
                  Sua empresa já implementou alguma solução de IA? *
                </Label>
                <RadioGroup 
                  value={data.hasImplementedAI || ''} 
                  onValueChange={(value) => handleInputChange('hasImplementedAI', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim" id="implemented-sim" className="border-white/20 text-viverblue" />
                    <Label htmlFor="implemented-sim" className="text-slate-200">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="implemented-nao" className="border-white/20 text-viverblue" />
                    <Label htmlFor="implemented-nao" className="text-slate-200">Não</Label>
                  </div>
                </RadioGroup>
                {getFieldError?.('hasImplementedAI') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('hasImplementedAI')}</p>
                )}
              </div>

              {hasImplementedAI && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="aiToolsUsed" className="text-slate-200">
                      Quais ferramentas de IA vocês já usaram?
                    </Label>
                    <div className="mt-2 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-[#151823] rounded-lg border border-white/20">
                      {ferramentasIA.map((ferramenta) => (
                        <div key={ferramenta} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ai-tool-${ferramenta}`}
                            checked={(data.aiToolsUsed || []).includes(ferramenta)}
                            onCheckedChange={(checked) => handleCheckboxChange('aiToolsUsed', ferramenta, checked as boolean)}
                            className="border-white/20"
                          />
                          <Label htmlFor={`ai-tool-${ferramenta}`} className="text-slate-200 text-sm">
                            {ferramenta}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <Label htmlFor="aiKnowledgeLevel" className="text-slate-200">
                  Como você avalia seu conhecimento em IA? *
                </Label>
                <Select value={data.aiKnowledgeLevel || ''} onValueChange={(value) => handleInputChange('aiKnowledgeLevel', value)}>
                  <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveisConhecimento.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>{nivel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError?.('aiKnowledgeLevel') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('aiKnowledgeLevel')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Ferramentas Atuais */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Ferramentas Atuais</h3>
              </div>

              <div>
                <Label htmlFor="dailyTools" className="text-slate-200">
                  Quais ferramentas você usa diariamente no trabalho? *
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-[#151823] rounded-lg border border-white/20">
                  {ferramentasDiarias.map((ferramenta) => (
                    <div key={ferramenta} className="flex items-center space-x-2">
                      <Checkbox
                        id={`daily-tool-${ferramenta}`}
                        checked={(data.dailyTools || []).includes(ferramenta)}
                        onCheckedChange={(checked) => handleCheckboxChange('dailyTools', ferramenta, checked as boolean)}
                        className="border-white/20"
                      />
                      <Label htmlFor={`daily-tool-${ferramenta}`} className="text-slate-200 text-sm">
                        {ferramenta}
                      </Label>
                    </div>
                  ))}
                </div>
                {getFieldError?.('dailyTools') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('dailyTools')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="whoWillImplement" className="text-slate-200">
                  Quem será responsável por implementar IA na sua empresa? *
                </Label>
                <RadioGroup 
                  value={data.whoWillImplement || ''} 
                  onValueChange={(value) => handleInputChange('whoWillImplement', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="eu-mesmo" id="implement-myself" className="border-white/20 text-viverblue" />
                    <Label htmlFor="implement-myself" className="text-slate-200">Eu mesmo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="equipe-interna" id="implement-team" className="border-white/20 text-viverblue" />
                    <Label htmlFor="implement-team" className="text-slate-200">Equipe interna</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="consultoria-externa" id="implement-external" className="border-white/20 text-viverblue" />
                    <Label htmlFor="implement-external" className="text-slate-200">Consultoria externa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ainda-nao-sei" id="implement-unknown" className="border-white/20 text-viverblue" />
                    <Label htmlFor="implement-unknown" className="text-slate-200">Ainda não sei</Label>
                  </div>
                </RadioGroup>
                {getFieldError?.('whoWillImplement') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('whoWillImplement')}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Coluna Direita - Insights da IA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Mensagem da IA */}
          {(generatedMessage || isGenerating) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Recomendações Personalizadas</h3>
              </div>
              <AIMessageDisplay 
                message={generatedMessage || ''} 
                isLoading={isGenerating}
              />
            </motion.div>
          )}

          {/* Dicas adicionais */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Dicas Importantes</h3>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-viverblue rounded-full mt-2 flex-shrink-0"></div>
                  <p>Seja honesto sobre seu nível atual - isso nos ajuda a personalizar melhor o conteúdo</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-viverblue rounded-full mt-2 flex-shrink-0"></div>
                  <p>Não há problema em ser iniciante - todos começaram do zero em IA</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-viverblue rounded-full mt-2 flex-shrink-0"></div>
                  <p>As ferramentas que você já usa podem ser potencializadas com IA</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingStep3;
