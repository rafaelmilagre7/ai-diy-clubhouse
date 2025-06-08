
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Brain, Wrench, Users, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';

const aiTools = [
  'ChatGPT',
  'Claude',
  'Gemini (Google)',
  'Copilot (Microsoft)',
  'Midjourney',
  'DALL-E',
  'Canva AI',
  'Notion AI',
  'Jasper',
  'Copy.ai',
  'Loom AI',
  'Otter.ai',
  'Runway ML',
  'Stable Diffusion',
  'Make.com',
  'Zapier AI',
  'Outros'
];

const dailyToolsList = [
  'Excel/Google Sheets',
  'Word/Google Docs',
  'PowerPoint/Google Slides',
  'WhatsApp Business',
  'Instagram',
  'Facebook',
  'LinkedIn',
  'Canva',
  'Photoshop',
  'Figma',
  'Trello/Asana',
  'Slack',
  'Teams',
  'Zoom',
  'CRM (HubSpot, Pipedrive, etc)',
  'ERP',
  'E-mail Marketing',
  'Google Analytics',
  'WordPress',
  'Shopify',
  'Outros'
];

export const OnboardingStep3 = ({ 
  data, 
  onUpdateData, 
  onNext,
  onPrev,
  memberType,
  getFieldError
}: OnboardingStepProps) => {
  const [hasImplementedAI, setHasImplementedAI] = useState<'yes' | 'no' | 'tried-failed' | ''>(data.hasImplementedAI || '');
  const [aiToolsUsed, setAiToolsUsed] = useState<string[]>(data.aiToolsUsed || []);
  const [aiKnowledgeLevel, setAiKnowledgeLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert' | ''>(data.aiKnowledgeLevel || '');
  const [dailyTools, setDailyTools] = useState<string[]>(data.dailyTools || []);
  const [whoWillImplement, setWhoWillImplement] = useState<'myself' | 'team' | 'hire' | ''>(data.whoWillImplement || '');

  // Atualizar dados globais sempre que o estado local mudar
  useEffect(() => {
    onUpdateData({ 
      hasImplementedAI,
      aiToolsUsed,
      aiKnowledgeLevel,
      dailyTools,
      whoWillImplement
    });
  }, [hasImplementedAI, aiToolsUsed, aiKnowledgeLevel, dailyTools, whoWillImplement, onUpdateData]);

  const handleAiToolChange = (tool: string, checked: boolean) => {
    if (checked) {
      setAiToolsUsed([...aiToolsUsed, tool]);
    } else {
      setAiToolsUsed(aiToolsUsed.filter(t => t !== tool));
    }
  };

  const handleDailyToolChange = (tool: string, checked: boolean) => {
    if (checked) {
      setDailyTools([...dailyTools, tool]);
    } else {
      setDailyTools(dailyTools.filter(t => t !== tool));
    }
  };

  const handleNext = () => {
    // Verificar se todos os campos obrigatórios estão preenchidos
    const currentData = {
      hasImplementedAI,
      aiKnowledgeLevel,
      whoWillImplement
    };

    if (!currentData.hasImplementedAI || !currentData.aiKnowledgeLevel || !currentData.whoWillImplement) {
      console.log('[OnboardingStep3] Campos obrigatórios faltando:', currentData);
      return;
    }

    // Gerar mensagem personalizada da IA baseada nas respostas
    const firstName = data.name?.split(' ')[0] || 'Amigo';
    let experienceComment = '';
    
    if (hasImplementedAI === 'yes') {
      experienceComment = `Que ótimo que você já implementou IA! ${aiToolsUsed.length > 3 ? 'E usa várias ferramentas - você está bem avançado! ' : ''}`;
    } else if (hasImplementedAI === 'tried-failed') {
      experienceComment = 'Entendo que já tentou mas não deu certo - isso é super normal! Vamos garantir que dessa vez seja um sucesso total! ';
    } else {
      experienceComment = 'Perfeito momento para começar com IA! ';
    }

    const implementationComment = whoWillImplement === 'myself' ? 
      'Adoro ver que você quer colocar a mão na massa! ' : 
      whoWillImplement === 'team' ? 
      'Excelente ter uma equipe para implementar! ' : 
      'Smart! Contratar especialistas pode acelerar muito os resultados! ';

    const aiMessage = `${firstName}, ${experienceComment}${implementationComment}Com seu nível ${aiKnowledgeLevel} e conhecendo as ferramentas que você usa, já consigo visualizar algumas oportunidades incríveis de IA para sua empresa! Agora vamos definir seus objetivos específicos! 🎯`;

    // Atualizar dados finais e prosseguir
    onUpdateData({ 
      hasImplementedAI,
      aiToolsUsed,
      aiKnowledgeLevel,
      dailyTools,
      whoWillImplement,
      aiMessage3: aiMessage
    });
    
    onNext();
  };

  const handlePrev = () => {
    onPrev();
  };

  const hasImplementedError = getFieldError?.('hasImplementedAI');
  const aiKnowledgeError = getFieldError?.('aiKnowledgeLevel');
  const whoWillImplementError = getFieldError?.('whoWillImplement');

  const canProceed = hasImplementedAI && aiKnowledgeLevel && whoWillImplement;

  return (
    <div className="space-y-8">
      {/* Mensagem da IA da etapa anterior */}
      {data.aiMessage2 && (
        <AIMessageDisplay message={data.aiMessage2} />
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 flex items-center justify-center"
          >
            <Bot className="w-10 h-10 text-viverblue" />
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-heading font-bold text-white"
          >
            Sua maturidade em{' '}
            <span className="bg-gradient-to-r from-viverblue to-viverblue-light bg-clip-text text-transparent">
              IA! 🤖
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed"
          >
            Vamos entender seu nível atual com Inteligência Artificial para criar 
            um plano totalmente personalizado!
          </motion.p>
        </div>
      </motion.div>

      {/* Formulário */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-[#151823] border border-white/10 rounded-2xl p-8">
          <div className="space-y-8">
            {/* Seção de experiência */}
            <div className="space-y-6">
              <h3 className="text-xl font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-viverblue" />
                </div>
                Experiência com IA
              </h3>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Já implementou alguma solução de IA? *
                </Label>
                <Select value={hasImplementedAI} onValueChange={(value: 'yes' | 'no' | 'tried-failed') => setHasImplementedAI(value)}>
                  <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${hasImplementedError ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione sua experiência" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151823] border-white/10">
                    <SelectItem value="yes">✅ Sim, já implementei</SelectItem>
                    <SelectItem value="no">❌ Não, nunca implementei</SelectItem>
                    <SelectItem value="tried-failed">🔄 Tentei mas não deu certo</SelectItem>
                  </SelectContent>
                </Select>
                {hasImplementedError && (
                  <p className="text-sm text-red-400">{hasImplementedError}</p>
                )}
              </div>

              {hasImplementedAI === 'yes' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Quais ferramentas/soluções já usou? (pode marcar várias)
                  </Label>
                  <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-4 border border-white/10 rounded-lg bg-[#181A2A]">
                    {aiTools.map((tool) => (
                      <div key={tool} className="flex items-center space-x-2">
                        <Checkbox
                          id={tool}
                          checked={aiToolsUsed.includes(tool)}
                          onCheckedChange={(checked) => handleAiToolChange(tool, checked as boolean)}
                          className="border-white/20"
                        />
                        <Label htmlFor={tool} className="text-sm text-white cursor-pointer">
                          {tool}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Qual seu nível de conhecimento em IA? *
                </Label>
                <Select value={aiKnowledgeLevel} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced' | 'expert') => setAiKnowledgeLevel(value)}>
                  <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${aiKnowledgeError ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151823] border-white/10">
                    <SelectItem value="beginner">🌱 Iniciante - Pouco ou nenhum conhecimento</SelectItem>
                    <SelectItem value="intermediate">📚 Intermediário - Já usei algumas ferramentas</SelectItem>
                    <SelectItem value="advanced">⚡ Avançado - Uso frequentemente</SelectItem>
                    <SelectItem value="expert">🚀 Especialista - Domino bem o assunto</SelectItem>
                  </SelectContent>
                </Select>
                {aiKnowledgeError && (
                  <p className="text-sm text-red-400">{aiKnowledgeError}</p>
                )}
              </div>
            </div>

            {/* Seção de ferramentas atuais */}
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-viverblue" />
                </div>
                Ferramentas Atuais
              </h3>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Quais ferramentas você usa no dia a dia? (pode marcar várias)
                </Label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-4 border border-white/10 rounded-lg bg-[#181A2A]">
                  {dailyToolsList.map((tool) => (
                    <div key={tool} className="flex items-center space-x-2">
                      <Checkbox
                        id={tool}
                        checked={dailyTools.includes(tool)}
                        onCheckedChange={(checked) => handleDailyToolChange(tool, checked as boolean)}
                        className="border-white/20"
                      />
                      <Label htmlFor={tool} className="text-sm text-white cursor-pointer">
                        {tool}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Seção de implementação */}
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-viverblue/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-viverblue" />
                </div>
                Implementação
              </h3>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Quem vai implementar as soluções na sua empresa? *
                </Label>
                <Select value={whoWillImplement} onValueChange={(value: 'myself' | 'team' | 'hire') => setWhoWillImplement(value)}>
                  <SelectTrigger className={`h-12 bg-[#181A2A] border-white/10 text-white ${whoWillImplementError ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione quem vai implementar" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151823] border-white/10">
                    <SelectItem value="myself">👤 Eu mesmo vou implementar</SelectItem>
                    <SelectItem value="team">👥 Minha equipe vai implementar</SelectItem>
                    <SelectItem value="hire">💼 Quero contratar alguém especializado</SelectItem>
                  </SelectContent>
                </Select>
                {whoWillImplementError && (
                  <p className="text-sm text-red-400">{whoWillImplementError}</p>
                )}
              </div>
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex items-center gap-2 h-12 px-6 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/30"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>

              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                size="lg"
                className="h-12 px-8 bg-viverblue hover:bg-viverblue-dark text-[#0F111A] text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Definir objetivos! 🎯
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dica */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="bg-viverblue/5 border border-viverblue/20 rounded-xl p-4 text-center max-w-2xl mx-auto"
      >
        <p className="text-sm text-neutral-300">
          💡 <strong className="text-white">Etapa 3 de 5:</strong> Perfeito! Agora já entendemos seu nível em IA! 🚀
        </p>
      </motion.div>
    </div>
  );
};
