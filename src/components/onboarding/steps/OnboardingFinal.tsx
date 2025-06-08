
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingData } from '../types/onboardingTypes';

interface OnboardingFinalProps {
  data: OnboardingData;
  onComplete: () => void;
  isCompleting: boolean;
  memberType: 'club' | 'formacao';
}

export const OnboardingFinal = ({ 
  data, 
  onComplete, 
  isCompleting, 
  memberType 
}: OnboardingFinalProps) => {
  const isClubMember = memberType === 'club';

  const handleComplete = async () => {
    onComplete();
  };

  return (
    <div className="space-y-8 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Parabéns! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {isClubMember 
            ? 'Você completou seu onboarding e está pronto para descobrir soluções de IA personalizadas para seu negócio!'
            : 'Você completou seu onboarding e está pronto para começar sua jornada de aprendizado em IA!'
          }
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 rounded-2xl p-8 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-viverblue" />
          O que vem a seguir?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 text-left">
          {isClubMember ? (
            <>
              <div className="flex gap-4">
                <div className="bg-viverblue/10 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-viverblue" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Dashboard Personalizado</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Acesse soluções de IA curadas especialmente para seu negócio
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-viverblue/10 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-viverblue" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Implementações Guiadas</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Siga nossos tutoriais passo a passo para implementar IA
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-4">
                <div className="bg-viverblue/10 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-viverblue" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Cursos Personalizados</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Acesse conteúdo de formação adaptado ao seu nível
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-viverblue/10 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-viverblue" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Certificações</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Obtenha certificados reconhecidos no mercado
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-6"
      >
        <Button 
          onClick={handleComplete}
          disabled={isCompleting}
          className="bg-viverblue hover:bg-viverblue-dark text-white text-lg py-6 px-12 rounded-xl"
          size="lg"
        >
          {isCompleting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Finalizando...
            </>
          ) : (
            <>
              {isClubMember ? 'Ir para o Dashboard!' : 'Começar Formação!'} ✨
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};
