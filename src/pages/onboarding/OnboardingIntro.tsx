
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { theme } from '@/lib/theme';
import MemberLayout from '@/components/layout/MemberLayout';
import { useOnboarding } from '@/hooks/onboarding/useOnboarding';
import { OnboardingCompleted } from '@/components/onboarding/OnboardingCompleted';
import { motion } from 'framer-motion';

const OnboardingIntro = () => {
  const navigate = useNavigate();
  const { progress, isLoading, refreshProgress } = useOnboarding();
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);

  // Efeito para detectar se o onboarding está completo
  useEffect(() => {
    if (!isLoading && progress) {
      setIsCompleted(progress.is_completed || false);
    }
  }, [progress, isLoading]);

  const handleStartOnboarding = () => {
    navigate('/onboarding/personal-info');
  };

  const handleReviewOnboarding = () => {
    navigate('/onboarding/review');
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="container flex items-center justify-center h-[70vh]">
          <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin" />
        </div>
      </MemberLayout>
    );
  }

  // Se o onboarding já foi concluído, mostrar a tela de onboarding concluído
  if (isCompleted) {
    return (
      <MemberLayout>
        <OnboardingCompleted onReview={handleReviewOnboarding} />
      </MemberLayout>
    );
  }

  // Tela para iniciar o onboarding (primeiro acesso)
  return (
    <MemberLayout>
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <motion.div 
          className="bg-gray-800 rounded-lg p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-4">Bem-vindo ao VIVER DE IA Club</h1>
            <p className="text-xl text-gray-300">
              Vamos personalizar sua experiência no Club
            </p>
          </div>

          <div className="space-y-8 mb-12">
            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-3">Por que preencher este onboarding?</h2>
              <p className="text-gray-300">
                Com suas informações, podemos criar uma trilha personalizada de implementação 
                de IA para o seu negócio, com soluções que fazem sentido para o seu contexto específico.
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-3">O que esperar</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>7 etapas rápidas para conhecer seu negócio e objetivos</li>
                <li>Suas informações são mantidas com total segurança</li>
                <li>Ao final, você receberá sua trilha personalizada de implementação</li>
                <li>Quanto mais detalhes fornecer, melhor será sua experiência</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={handleStartOnboarding}
              className="px-8 py-6 text-lg bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            >
              <span className="flex items-center gap-2">
                Iniciar Onboarding
                <ArrowRight className="h-5 w-5" />
              </span>
            </Button>
          </div>
        </motion.div>
      </div>
    </MemberLayout>
  );
};

export default OnboardingIntro;
