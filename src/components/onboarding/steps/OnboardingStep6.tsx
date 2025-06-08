
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, BookOpen, Video, FileText, Image, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingStepProps } from '../types/onboardingTypes';

export const OnboardingStep6 = ({ 
  data, 
  onUpdateData, 
  onNext, 
  memberType 
}: OnboardingStepProps) => {
  const [communicationStyle, setCommunicationStyle] = useState<'formal' | 'casual' | 'technical' | 'creative'>(data.communicationStyle || 'casual');
  const [learningPreference, setLearningPreference] = useState<'visual' | 'hands-on' | 'reading' | 'video'>(data.learningPreference || 'video');
  const [contentTypes, setContentTypes] = useState<string[]>(data.contentTypes || []);

  const clubContentTypes = [
    'Tutoriais práticos em vídeo',
    'Estudos de caso reais',
    'Templates prontos para usar',
    'Webinars ao vivo',
    'Checklist de implementação',
    'Análises de ferramentas',
    'Estratégias de automação'
  ];

  const formacaoContentTypes = [
    'Vídeo-aulas estruturadas',
    'Exercícios práticos',
    'Projetos hands-on',
    'Materiais de apoio (PDFs)',
    'Quizzes e avaliações',
    'Lives de dúvidas',
    'Certificados de conclusão'
  ];

  const availableContentTypes = memberType === 'club' ? clubContentTypes : formacaoContentTypes;

  // Wrapper functions para resolver incompatibilidade de tipos com Radix UI Select
  const handleCommunicationStyleChange = (value: string) => {
    setCommunicationStyle(value as typeof communicationStyle);
  };

  const handleLearningPreferenceChange = (value: string) => {
    setLearningPreference(value as typeof learningPreference);
  };

  const handleContentTypeChange = (contentType: string, checked: boolean) => {
    if (checked) {
      setContentTypes([...contentTypes, contentType]);
    } else {
      setContentTypes(contentTypes.filter(type => type !== contentType));
    }
  };

  const handleNext = () => {
    onUpdateData({ 
      communicationStyle,
      learningPreference,
      contentTypes,
      completedAt: new Date().toISOString()
    });
    onNext();
  };

  const isClubMember = memberType === 'club';
  const canProceed = communicationStyle && learningPreference && contentTypes.length > 0;

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 p-4 rounded-full">
            <Sparkles className="w-8 h-8 text-viverblue" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Personalize sua experiência! ✨
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {isClubMember 
            ? 'Para finalizar, vamos personalizar como você prefere receber e consumir conteúdo!'
            : 'Últimas configurações para criar a melhor experiência de aprendizado para você!'
          }
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 max-w-md mx-auto"
      >
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Como você prefere se comunicar?
          </Label>
          <Select value={communicationStyle} onValueChange={handleCommunicationStyleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu estilo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">💬 Casual e descontraído</SelectItem>
              <SelectItem value="formal">🎩 Formal e profissional</SelectItem>
              <SelectItem value="technical">🔧 Técnico e detalhado</SelectItem>
              <SelectItem value="creative">🎨 Criativo e inspirador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Como você prefere aprender?
          </Label>
          <Select value={learningPreference} onValueChange={handleLearningPreferenceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua preferência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">🎥 Vídeos e tutoriais visuais</SelectItem>
              <SelectItem value="hands-on">⚡ Prática e experimentação</SelectItem>
              <SelectItem value="reading">📖 Leitura e textos detalhados</SelectItem>
              <SelectItem value="visual">🎨 Infográficos e imagens</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Que tipos de conteúdo mais te interessam? (escolha quantos quiser)
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableContentTypes.map((contentType) => (
              <div key={contentType} className="flex items-center space-x-2">
                <Checkbox
                  id={contentType}
                  checked={contentTypes.includes(contentType)}
                  onCheckedChange={(checked) => handleContentTypeChange(contentType, checked as boolean)}
                />
                <Label 
                  htmlFor={contentType}
                  className="text-sm font-normal cursor-pointer leading-tight"
                >
                  {contentType}
                </Label>
              </div>
            ))}
          </div>
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
            className="w-full bg-viverblue hover:bg-viverblue-dark text-lg py-6"
          >
            Finalizar Onboarding! 🎉
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
