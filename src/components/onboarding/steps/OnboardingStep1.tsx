
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { OnboardingStepProps } from '../types/onboardingTypes';

export const OnboardingStep1 = ({ 
  data, 
  onUpdateData, 
  onNext, 
  memberType,
  userProfile,
  getFieldError
}: OnboardingStepProps) => {
  const [name, setName] = useState(data.name || userProfile?.full_name || '');
  const [nickname, setNickname] = useState(data.nickname || '');

  const handleNext = () => {
    onUpdateData({ 
      name, 
      nickname,
      memberType,
      startedAt: data.startedAt || new Date().toISOString()
    });
    onNext();
  };

  const isClubMember = memberType === 'club';
  const nameError = getFieldError?.('name');

  return (
    <div className="space-y-8">
      {/* Header com animação */}
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
          {isClubMember ? 'Bem-vindo ao VIVER DE IA Club! 🚀' : 'Bem-vindo à Formação VIVER DE IA! 🎓'}
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {isClubMember 
            ? 'Vamos personalizar sua jornada para transformar seu negócio com IA. Cada pergunta nos ajuda a criar uma experiência única para você!'
            : 'Vamos personalizar sua jornada de aprendizado em IA. Queremos entender seu perfil para oferecer o melhor conteúdo educacional!'
          }
        </p>
      </motion.div>

      {/* Formulário */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 max-w-md mx-auto"
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Como você gostaria de ser chamado? *
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            className={`text-center ${nameError ? 'border-red-500' : ''}`}
          />
          {nameError && (
            <p className="text-sm text-red-500">{nameError}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Este será seu nome oficial na plataforma
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nickname" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            E como prefere ser chamado no dia a dia?
          </Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Apelido ou como os amigos te chamam"
            className="text-center"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Usaremos este nome para tornar nossa conversa mais pessoal ✨
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-6"
        >
          <Button 
            onClick={handleNext}
            disabled={!name.trim()}
            className="w-full bg-viverblue hover:bg-viverblue-dark text-lg py-6 disabled:opacity-50"
          >
            {isClubMember ? 'Vamos falar de negócios! 💼' : 'Vamos começar a aprender! 📚'}
          </Button>
        </motion.div>
      </motion.div>

      {/* Dica com IA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/20 rounded-lg p-4 text-center"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          💡 <strong>Dica da IA:</strong> {nickname || 'Amigo'}, quanto mais você nos contar sobre si, 
          melhor poderemos personalizar sua experiência. Vamos juntos nessa jornada! 
          {isClubMember ? '🚀' : '🎯'}
        </p>
      </motion.div>
    </div>
  );
};
