
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import MemberLayout from '@/components/layout/MemberLayout';
import { toast } from 'sonner';

const OnboardingIntro = () => {
  const navigate = useNavigate();

  const handleStartOnboarding = () => {
    try {
      console.log("Iniciando navegação para /onboarding/personal-info");
      navigate('/onboarding/personal-info');
    } catch (error) {
      console.error("Erro ao navegar:", error);
      toast.error("Erro ao iniciar onboarding. Tente novamente.");
    }
  };

  const content = (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-8 shadow-xl border border-gray-700">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img 
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
              alt="VIVER DE IA Club" 
              className="h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">Bem-vindo ao VIVER DE IA Club</h1>
          <p className="text-xl text-viverblue-lighter">
            Vamos personalizar sua experiência no Club
          </p>
        </div>

        <div className="space-y-8 mb-12">
          <div className="bg-gray-800/80 rounded-lg p-6 border border-gray-700 hover:border-viverblue/40 transition-all">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
              <span className="bg-viverblue h-6 w-6 rounded-full flex items-center justify-center text-white text-sm mr-2">1</span>
              Por que preencher este onboarding?
            </h2>
            <p className="text-gray-300 ml-8">
              Com suas informações, podemos criar uma trilha personalizada de implementação 
              de IA para o seu negócio, com soluções que fazem sentido para o seu contexto específico.
            </p>
          </div>

          <div className="bg-gray-800/80 rounded-lg p-6 border border-gray-700 hover:border-viverblue/40 transition-all">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
              <span className="bg-viverblue h-6 w-6 rounded-full flex items-center justify-center text-white text-sm mr-2">2</span>
              O que esperar
            </h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-8">
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
            className="px-8 py-6 text-lg bg-viverblue hover:bg-viverblue/90 transition-all transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              Iniciar Onboarding
              <ArrowRight className="h-5 w-5" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );

  return <MemberLayout>{content}</MemberLayout>;
};

export default OnboardingIntro;
