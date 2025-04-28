
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Edit, Map } from 'lucide-react';
import MemberLayout from '@/components/layout/MemberLayout';
import { useProgress } from '@/hooks/onboarding/useProgress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

const OnboardingIntro = () => {
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();
  const isCompleted = progress?.is_completed || false;

  const handleStartOnboarding = () => {
    if (isCompleted) {
      navigate('/onboarding/review');
    } else {
      navigate('/onboarding/steps');
    }
  };

  const handleGoToTrail = () => {
    navigate('/implementation-trail');
  };

  return (
    <MemberLayout>
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          {isCompleted ? (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-white mb-4">
                  Gerenciar Perfil
                </h1>
                <p className="text-xl text-gray-300">
                  Atualize suas informações ou acesse sua trilha personalizada
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={handleStartOnboarding}
                  variant="secondary"
                  className="px-8 py-6 text-lg"
                >
                  <span className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Editar Informações
                  </span>
                </Button>

                <Button 
                  onClick={handleGoToTrail}
                  className="px-8 py-6 text-lg bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
                >
                  <span className="flex items-center gap-2">
                    Acessar Trilha
                    <Map className="h-5 w-5" />
                  </span>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-white mb-4">
                  Bem-vindo ao VIVER DE IA Club
                </h1>
                <p className="text-xl text-gray-300">
                  Vamos personalizar sua experiência no Club
                </p>
              </div>

              <div className="space-y-8 mb-12">
                <div className="bg-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Por que preencher este onboarding?
                  </h2>
                  <p className="text-gray-300">
                    Com suas informações, podemos criar uma trilha personalizada de implementação 
                    de IA para o seu negócio, com soluções que fazem sentido para o seu contexto específico.
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-3">
                    O que esperar
                  </h2>
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
            </>
          )}
        </div>
      </div>
    </MemberLayout>
  );
};

export default OnboardingIntro;
