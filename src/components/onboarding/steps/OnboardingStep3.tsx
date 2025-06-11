
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Code, Zap, Users, Sparkles } from 'lucide-react';
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

  const conhecimentoLevels = [
    'Iniciante - Nunca usei IA',
    'Básico - Já testei algumas ferramentas',
    'Intermediário - Uso regularmente algumas IAs',
    'Avançado - Implemento soluções com IA',
    'Especialista - Desenvolvo/treino modelos'
  ];

  const ferramentasIA = [
    'ChatGPT',
    'Claude',
    'Gemini',
    'Midjourney',
    'DALL-E',
    'Copilot',
    'Notion AI',
    'Jasper',
    'Copy.ai',
    'Runway',
    'Stable Diffusion',
    'Outras'
  ];

  const ferramentasDiarias = [
    'Microsoft Office',
    'Google Workspace',
    'Slack',
    'WhatsApp Business',
    'Zoom',
    'Trello/Asana',
    'Canva',
    'Adobe Creative',
    'Shopify',
    'WordPress',
    'HubSpot',
    'Salesforce'
  ];

  // Gerar mensagem quando maturidade IA estiver preenchida
  useEffect(() => {
    const hasAIMaturity = data.hasImplementedAI === 'sim' && 
                         data.aiKnowledgeLevel && 
                         data.aiToolsUsed && data.aiToolsUsed.length > 0;
    
    if (hasAIMaturity && !generatedMessage && !isGenerating && !shouldGenerateMessage) {
      setShouldGenerateMessage(true);
      generateMessage(data, memberType);
    }
  }, [data.hasImplementedAI, data.aiKnowledgeLevel, data.aiToolsUsed, generatedMessage, isGenerating, shouldGenerateMessage, generateMessage, data, memberType]);

  const handleInputChange = (field: string, value: string | string[]) => {
    onUpdateData({ [field]: value });
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const currentValues = (data[field as keyof typeof data] as string[]) || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(item => item !== value);
    }
    
    onUpdateData({ [field]: newValues });
  };

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
          Entenda seu nível atual com inteligência artificial
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Experiência Atual */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Implementação de IA */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Experiência com IA</h3>
              </div>

              <div>
                <Label htmlFor="hasImplementedAI" className="text-slate-200">
                  Já implementou ou usa IA na sua empresa/trabalho? *
                </Label>
                <RadioGroup 
                  value={data.hasImplementedAI || ''} 
                  onValueChange={(value) => handleInputChange('hasImplementedAI', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim" id="sim" />
                    <Label htmlFor="sim" className="text-slate-200">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="nao" />
                    <Label htmlFor="nao" className="text-slate-200">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="planejando" id="planejando" />
                    <Label htmlFor="planejando" className="text-slate-200">Estou planejando</Label>
                  </div>
                </RadioGroup>
                {getFieldError?.('hasImplementedAI') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('hasImplementedAI')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="aiKnowledgeLevel" className="text-slate-200">
                  Qual seu nível de conhecimento em IA? *
                </Label>
                <Select value={data.aiKnowledgeLevel || ''} onValueChange={(value) => handleInputChange('aiKnowledgeLevel', value)}>
                  <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {conhecimentoLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError?.('aiKnowledgeLevel') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('aiKnowledgeLevel')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Ferramentas Utilizadas */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Ferramentas</h3>
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Quais ferramentas de IA você já usou? (selecione todas) *
                </Label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {ferramentasIA.map((ferramenta) => (
                    <div key={ferramenta} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ai-${ferramenta}`}
                        checked={(data.aiToolsUsed || []).includes(ferramenta)}
                        onCheckedChange={(checked) => handleCheckboxChange('aiToolsUsed', ferramenta, checked === true)}
                      />
                      <Label htmlFor={`ai-${ferramenta}`} className="text-slate-200 text-sm">
                        {ferramenta}
                      </Label>
                    </div>
                  ))}
                </div>
                {getFieldError?.('aiToolsUsed') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('aiToolsUsed')}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Coluna Direita - Ferramentas Diárias + Implementação */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Ferramentas Diárias */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Rotina de Trabalho</h3>
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Quais ferramentas você usa no dia a dia? (selecione todas) *
                </Label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {ferramentasDiarias.map((ferramenta) => (
                    <div key={ferramenta} className="flex items-center space-x-2">
                      <Checkbox
                        id={`daily-${ferramenta}`}
                        checked={(data.dailyTools || []).includes(ferramenta)}
                        onCheckedChange={(checked) => handleCheckboxChange('dailyTools', ferramenta, checked === true)}
                      />
                      <Label htmlFor={`daily-${ferramenta}`} className="text-slate-200 text-sm">
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
                  Quem vai implementar as soluções de IA? *
                </Label>
                <Select value={data.whoWillImplement || ''} onValueChange={(value) => handleInputChange('whoWillImplement', value)}>
                  <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                    <SelectValue placeholder="Selecione quem implementará" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eu-mesmo">Eu mesmo</SelectItem>
                    <SelectItem value="equipe-interna">Equipe interna</SelectItem>
                    <SelectItem value="consultoria-externa">Consultoria externa</SelectItem>
                    <SelectItem value="ainda-nao-sei">Ainda não sei</SelectItem>
                  </SelectContent>
                </Select>
                {getFieldError?.('whoWillImplement') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('whoWillImplement')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Mensagem da IA */}
          {(generatedMessage || isGenerating) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Análise do Seu Perfil</h3>
              </div>
              <AIMessageDisplay 
                message={generatedMessage || ''} 
                isLoading={isGenerating}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingStep3;
