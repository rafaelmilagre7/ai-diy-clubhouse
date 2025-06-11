
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Zap, Target, Sparkles } from 'lucide-react';
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

  const aiTools = [
    'ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Midjourney', 'DALL-E', 
    'Notion AI', 'Jasper', 'Copy.ai', 'Canva AI', 'Loom AI', 'Outras'
  ];

  const dailyToolsOptions = [
    'Microsoft Office', 'Google Workspace', 'Slack', 'Trello/Asana', 
    'CRM (Salesforce, HubSpot)', 'Adobe Creative Suite', 'Figma', 'Outras'
  ];

  // Gerar mensagem quando dados de maturidade estiverem preenchidos
  useEffect(() => {
    const hasMaturityInfo = data.hasImplementedAI && data.aiKnowledgeLevel && data.whoWillImplement;
    if (hasMaturityInfo && !generatedMessage && !isGenerating && !shouldGenerateMessage) {
      setShouldGenerateMessage(true);
      generateMessage(data, memberType);
    }
  }, [data.hasImplementedAI, data.aiKnowledgeLevel, data.whoWillImplement, generatedMessage, isGenerating, shouldGenerateMessage, generateMessage, data, memberType]);

  const handleRadioChange = (field: string, value: string) => {
    onUpdateData({ [field]: value });
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const currentValues = data[field] || [];
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
          Vamos entender seu nível atual de conhecimento e experiência com Inteligência Artificial
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
                <Zap className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Experiência Prévia</h3>
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Você já implementou alguma solução de IA no seu negócio? *
                </Label>
                <RadioGroup 
                  value={data.hasImplementedAI || ''}
                  onValueChange={(value) => handleRadioChange('hasImplementedAI', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim_sucesso" id="sim_sucesso" className="border-viverblue text-viverblue" />
                    <Label htmlFor="sim_sucesso" className="text-slate-200">Sim, com sucesso</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim_dificuldades" id="sim_dificuldades" className="border-viverblue text-viverblue" />
                    <Label htmlFor="sim_dificuldades" className="text-slate-200">Sim, mas com dificuldades</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tentei_nao_funcionou" id="tentei_nao_funcionou" className="border-viverblue text-viverblue" />
                    <Label htmlFor="tentei_nao_funcionou" className="text-slate-200">Tentei, mas não funcionou</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao_implementei" id="nao_implementei" className="border-viverblue text-viverblue" />
                    <Label htmlFor="nao_implementei" className="text-slate-200">Não, ainda não implementei</Label>
                  </div>
                </RadioGroup>
                {getFieldError?.('hasImplementedAI') && (
                  <p className="text-red-400 text-sm mt-2">{getFieldError('hasImplementedAI')}</p>
                )}
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Qual seu nível de conhecimento em IA? *
                </Label>
                <RadioGroup 
                  value={data.aiKnowledgeLevel || ''}
                  onValueChange={(value) => handleRadioChange('aiKnowledgeLevel', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="iniciante" id="iniciante" className="border-viverblue text-viverblue" />
                    <Label htmlFor="iniciante" className="text-slate-200">Iniciante (pouco ou nenhum conhecimento)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basico" id="basico" className="border-viverblue text-viverblue" />
                    <Label htmlFor="basico" className="text-slate-200">Básico (uso ferramentas simples)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediario" id="intermediario" className="border-viverblue text-viverblue" />
                    <Label htmlFor="intermediario" className="text-slate-200">Intermediário (implemento soluções)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="avancado" id="avancado" className="border-viverblue text-viverblue" />
                    <Label htmlFor="avancado" className="text-slate-200">Avançado (desenvolvo estratégias)</Label>
                  </div>
                </RadioGroup>
                {getFieldError?.('aiKnowledgeLevel') && (
                  <p className="text-red-400 text-sm mt-2">{getFieldError('aiKnowledgeLevel')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Implementação */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Implementação</h3>
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Quem será responsável pela implementação das soluções de IA? *
                </Label>
                <RadioGroup 
                  value={data.whoWillImplement || ''}
                  onValueChange={(value) => handleRadioChange('whoWillImplement', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="eu_mesmo" id="eu_mesmo" className="border-viverblue text-viverblue" />
                    <Label htmlFor="eu_mesmo" className="text-slate-200">Eu mesmo(a)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="equipe_interna" id="equipe_interna" className="border-viverblue text-viverblue" />
                    <Label htmlFor="equipe_interna" className="text-slate-200">Equipe interna</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="consultoria_externa" id="consultoria_externa" className="border-viverblue text-viverblue" />
                    <Label htmlFor="consultoria_externa" className="text-slate-200">Consultoria externa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ainda_nao_sei" id="ainda_nao_sei" className="border-viverblue text-viverblue" />
                    <Label htmlFor="ainda_nao_sei" className="text-slate-200">Ainda não sei</Label>
                  </div>
                </RadioGroup>
                {getFieldError?.('whoWillImplement') && (
                  <p className="text-red-400 text-sm mt-2">{getFieldError('whoWillImplement')}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Coluna Direita - Ferramentas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Ferramentas de IA */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Ferramentas de IA</h3>
                <span className="text-xs text-slate-400">(opcional)</span>
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Quais ferramentas de IA você já usou?
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {aiTools.map((tool) => (
                    <div key={tool} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ai_tool_${tool}`}
                        checked={(data.aiToolsUsed || []).includes(tool)}
                        onCheckedChange={(checked) => handleCheckboxChange('aiToolsUsed', tool, checked)}
                        className="border-viverblue data-[state=checked]:bg-viverblue"
                      />
                      <Label htmlFor={`ai_tool_${tool}`} className="text-slate-200 text-sm">{tool}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Ferramentas Diárias */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Ferramentas do Dia a Dia</h3>
              </div>

              <div>
                <Label className="text-slate-200 mb-3 block">
                  Quais ferramentas você usa no trabalho diariamente? *
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {dailyToolsOptions.map((tool) => (
                    <div key={tool} className="flex items-center space-x-2">
                      <Checkbox
                        id={`daily_tool_${tool}`}
                        checked={(data.dailyTools || []).includes(tool)}
                        onCheckedChange={(checked) => handleCheckboxChange('dailyTools', tool, checked)}
                        className="border-viverblue data-[state=checked]:bg-viverblue"
                      />
                      <Label htmlFor={`daily_tool_${tool}`} className="text-slate-200 text-sm">{tool}</Label>
                    </div>
                  ))}
                </div>
                {getFieldError?.('dailyTools') && (
                  <p className="text-red-400 text-sm mt-2">{getFieldError('dailyTools')}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Mensagem da IA */}
      {(generatedMessage || isGenerating) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-viverblue" />
            <h3 className="text-lg font-semibold text-white">Análise do seu Perfil de IA</h3>
          </div>
          <AIMessageDisplay 
            message={generatedMessage || ''} 
            isLoading={isGenerating}
          />
        </motion.div>
      )}
    </div>
  );
};

export default OnboardingStep3;
