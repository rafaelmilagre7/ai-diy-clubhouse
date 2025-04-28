
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Edit, Map } from 'lucide-react';
import { theme } from '@/lib/theme';
import MemberLayout from '@/components/layout/MemberLayout';
import { useProgress } from '@/hooks/onboarding/useProgress';
import { Alert } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

const OnboardingIntro = () => {
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();
  const isCompleted = progress?.is_completed || false;

  const handleStartOnboarding = () => {
    if (isCompleted) {
      navigate('/onboarding/review');
    } else {
      navigate('/onboarding/personal-info');
    }
  };

  const handleGoToTrail = () => {
    navigate('/implementation-trail');
  };

  return (
    <MemberLayout>
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          {isCompleted && (
            <Alert className="mb-6 bg-green-100 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-green-800 ml-2">
                Seu onboarding está concluído! Você pode editar suas informações ou acessar sua trilha personalizada.
              </span>
            </Alert>
          )}

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-4">
              {isCompleted ? 'Gerenciar Perfil' : 'Bem-vindo ao VIVER DE IA Club'}
            </h1>
            <p className="text-xl text-gray-300">
              {isCompleted 
                ? 'Atualize suas informações ou acesse sua trilha personalizada'
                : 'Vamos personalizar sua experiência no Club'}
            </p>
          </div>

          {!isCompleted && (
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
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={handleStartOnboarding}
              className={`px-8 py-6 text-lg ${isCompleted ? 'bg-gray-600 hover:bg-gray-700' : 'bg-[#0ABAB5] hover:bg-[#0ABAB5]/90'}`}
            >
              <span className="flex items-center gap-2">
                {isCompleted ? (
                  <>
                    Editar Informações
                    <Edit className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    Iniciar Onboarding
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </span>
            </Button>

            {isCompleted && (
              <Button 
                onClick={handleGoToTrail}
                className="px-8 py-6 text-lg bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
              >
                <span className="flex items-center gap-2">
                  Acessar Trilha
                  <Map className="h-5 w-5" />
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default OnboardingIntro;
