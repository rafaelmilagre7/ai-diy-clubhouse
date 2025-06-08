
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Brain, Wrench, Users } from 'lucide-react';
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
  memberType 
}: OnboardingStepProps) => {
  const [hasImplementedAI, setHasImplementedAI] = useState<'yes' | 'no' | 'tried-failed' | ''>(data.hasImplementedAI || '');
  const [aiToolsUsed, setAiToolsUsed] = useState<string[]>(data.aiToolsUsed || []);
  const [aiKnowledgeLevel, setAiKnowledgeLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert' | ''>(data.aiKnowledgeLevel || '');
  const [dailyTools, setDailyTools] = useState<string[]>(data.dailyTools || []);
  const [whoWillImplement, setWhoWillImplement] = useState<'myself' | 'team' | 'hire' | ''>(data.whoWillImplement || '');

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

  const canProceed = hasImplementedAI && aiKnowledgeLevel && whoWillImplement;

  return (
    <div className="space-y-8">
      {/* Mensagem da IA da etapa anterior */}
      {data.aiMessage2 && (
        <AIMessageDisplay message={data.aiMessage2} />
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 p-4 rounded-full">
            <Bot className="w-8 h-8 text-viverblue" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sua maturidade em IA 🤖
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Vamos entender seu nível atual com Inteligência Artificial para criar 
          um plano totalmente personalizado!
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Já implementou alguma solução de IA? *
          </Label>
          <Select value={hasImplementedAI} onValueChange={(value: 'yes' | 'no' | 'tried-failed') => setHasImplementedAI(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua experiência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">✅ Sim, já implementei</SelectItem>
              <SelectItem value="no">❌ Não, nunca implementei</SelectItem>
              <SelectItem value="tried-failed">🔄 Tentei mas não deu certo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasImplementedAI === 'yes' && (
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Quais ferramentas/soluções já usou? (pode marcar várias)
            </Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
              {aiTools.map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={tool}
                    checked={aiToolsUsed.includes(tool)}
                    onCheckedChange={(checked) => handleAiToolChange(tool, checked as boolean)}
                  />
                  <Label htmlFor={tool} className="text-sm cursor-pointer">
                    {tool}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Qual seu nível de conhecimento em IA? *
          </Label>
          <Select value={aiKnowledgeLevel} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced' | 'expert') => setAiKnowledgeLevel(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">🌱 Iniciante - Pouco ou nenhum conhecimento</SelectItem>
              <SelectItem value="intermediate">📚 Intermediário - Já usei algumas ferramentas</SelectItem>
              <SelectItem value="advanced">⚡ Avançado - Uso frequentemente</SelectItem>
              <SelectItem value="expert">🚀 Especialista - Domino bem o assunto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Quais ferramentas você usa no dia a dia? (pode marcar várias)
          </Label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
            {dailyToolsList.map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={tool}
                  checked={dailyTools.includes(tool)}
                  onCheckedChange={(checked) => handleDailyToolChange(tool, checked as boolean)}
                />
                <Label htmlFor={tool} className="text-sm cursor-pointer">
                  {tool}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Quem vai implementar as soluções na sua empresa? *
          </Label>
          <Select value={whoWillImplement} onValueChange={(value: 'myself' | 'team' | 'hire') => setWhoWillImplement(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione quem vai implementar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="myself">👤 Eu mesmo vou implementar</SelectItem>
              <SelectItem value="team">👥 Minha equipe vai implementar</SelectItem>
              <SelectItem value="hire">💼 Quero contratar alguém especializado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-6"
        >
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full bg-viverblue hover:bg-viverblue-dark text-lg py-6 disabled:opacity-50"
          >
            Definir objetivos! 🎯
          </Button>
        </motion.div>
      </motion.div>

      {/* Dica com progresso */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/20 rounded-lg p-4 text-center"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          💡 <strong>Etapa 3 de 5:</strong> Perfeito! Agora já entendemos seu nível em IA! 🚀
        </p>
      </motion.div>
    </div>
  );
};
