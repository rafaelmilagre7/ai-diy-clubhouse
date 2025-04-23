
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
    <div className="flex items-center min-h-screen bg-gradient-to-b from-white via-viverblue-lighter/10 to-viverblue/10 py-0 md:py-16">
      <div className="container w-full max-w-3xl mx-auto px-2 md:px-4">
        <div className="rounded-3xl bg-white/85 dark:bg-gray-900/80 shadow-xl border border-gray-200 dark:border-gray-800 glass-effect 
          px-0 md:px-0 py-0 md:py-0 md:overflow-hidden 
          flex flex-col"
        >
          <div className="flex flex-col gap-0 items-center justify-center py-6 bg-gradient-to-b from-viverblue to-viverblue-dark">
            <div className="flex justify-center">
              <img 
                src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
                alt="VIVER DE IA Club" 
                className="h-20 md:h-24 object-contain rounded-lg bg-white p-2 shadow-md"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center font-heading drop-shadow-lg mt-4">
              Bem-vindo ao VIVER DE IA Club
            </h1>
            <p className="text-lg md:text-xl text-white/90 mt-2 font-medium text-center">
              Vamos personalizar sua experiência no Club
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-6 md:p-10 bg-gradient-to-br from-white/80 to-viverblue/5">
            {/* Bloco 1 */}
            <div className="flex-1 bg-white/95 shadow-sm rounded-2xl border border-gray-200 px-4 py-5 flex flex-col 
                             transition-all hover:scale-[1.015] hover:shadow-lg hover:border-viverblue/40 duration-200">
              <h2 className="text-lg font-semibold text-viverblue-dark mb-2 flex items-center">
                <span className="bg-viverblue h-7 w-7 rounded-full flex items-center justify-center text-white font-bold mr-3 shadow-sm text-base">1</span>
                Por que preencher este onboarding?
              </h2>
              <p className="ml-10 text-gray-600 leading-relaxed text-base">
                Com suas informações, podemos criar uma trilha personalizada de implementação 
                de IA para o seu negócio, com soluções que fazem sentido para o seu contexto específico.
              </p>
            </div>
            {/* Bloco 2 */}
            <div className="flex-1 bg-white/95 shadow-sm rounded-2xl border border-gray-200 px-4 py-5 flex flex-col 
                             transition-all hover:scale-[1.015] hover:shadow-lg hover:border-viverblue/40 duration-200">
              <h2 className="text-lg font-semibold text-viverblue-dark mb-2 flex items-center">
                <span className="bg-viverblue h-7 w-7 rounded-full flex items-center justify-center text-white font-bold mr-3 shadow-sm text-base">2</span>
                O que esperar
              </h2>
              <ul className="ml-10 list-disc text-gray-600 text-base space-y-1">
                <li>7 etapas rápidas para conhecer seu negócio e objetivos</li>
                <li>Suas informações são mantidas com total segurança</li>
                <li>Ao final, você receberá sua trilha personalizada de implementação</li>
                <li>Quanto mais detalhes fornecer, melhor será sua experiência</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center w-full bg-white/90 dark:bg-gray-900/70 px-4 py-8 rounded-b-3xl border-t border-gray-100 dark:border-gray-800">
            <Button 
              onClick={handleStartOnboarding}
              className="px-8 py-6 text-lg font-bold rounded-xl bg-viverblue shadow-md hover:bg-viverblue-dark hover:scale-105 hover:shadow-lg transition-transform duration-200"
            >
              <span className="flex items-center gap-2">
                Iniciar Onboarding
                <ArrowRight className="h-5 w-5" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return <MemberLayout>{content}</MemberLayout>;
};

export default OnboardingIntro;
