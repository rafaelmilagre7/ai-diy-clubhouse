
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

  return (
    <MemberLayout>
      <div className="flex items-center min-h-screen bg-gradient-to-b from-white via-viverblue-lighter/10 to-viverblue/10 py-0 md:py-16">
        <div className="container w-full max-w-3xl mx-auto px-2 md:px-4">
          <div className="rounded-2xl bg-white shadow-lg border border-viverblue/15 overflow-hidden">
            {/* Cabeçalho */}
            <div className="flex flex-col gap-4 items-center justify-center py-8 bg-gradient-to-r from-viverblue to-viverblue-dark">
              <div className="flex justify-center">
                <img 
                  src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
                  alt="VIVER DE IA Club" 
                  className="h-20 md:h-24 object-contain rounded-lg bg-white p-2 shadow-md"
                />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white text-center font-heading drop-shadow-sm mt-2">
                Bem-vindo ao VIVER DE IA Club
              </h1>
              <p className="text-lg md:text-xl text-white/90 mt-1 font-medium text-center">
                Vamos personalizar sua experiência no Club
              </p>
            </div>

            {/* Conteúdo principal */}
            <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
              {/* Bloco 1 */}
              <div className="bg-white rounded-xl border border-neutral-200 px-5 py-5 shadow-sm
                             hover:shadow-md hover:border-viverblue/30 transition-all duration-200">
                <h2 className="text-lg font-semibold text-viverblue-dark mb-3 flex items-center">
                  <span className="bg-viverblue h-7 w-7 rounded-full flex items-center justify-center text-white font-bold mr-3 text-sm">1</span>
                  Por que preencher este onboarding?
                </h2>
                <p className="ml-10 text-neutral-600 leading-relaxed">
                  Com suas informações, podemos criar uma trilha personalizada de implementação 
                  de IA para o seu negócio, com soluções que fazem sentido para o seu contexto específico.
                </p>
              </div>
              
              {/* Bloco 2 */}
              <div className="bg-white rounded-xl border border-neutral-200 px-5 py-5 shadow-sm
                             hover:shadow-md hover:border-viverblue/30 transition-all duration-200">
                <h2 className="text-lg font-semibold text-viverblue-dark mb-3 flex items-center">
                  <span className="bg-viverblue h-7 w-7 rounded-full flex items-center justify-center text-white font-bold mr-3 text-sm">2</span>
                  O que esperar
                </h2>
                <ul className="ml-10 list-disc text-neutral-600 space-y-1 pl-4">
                  <li>7 etapas rápidas para conhecer seu negócio e objetivos</li>
                  <li>Suas informações são mantidas com total segurança</li>
                  <li>Ao final, você receberá sua trilha personalizada de implementação</li>
                  <li>Quanto mais detalhes fornecer, melhor será sua experiência</li>
                </ul>
              </div>
            </div>

            {/* Botão de ação */}
            <div className="flex justify-center w-full bg-neutral-50 px-4 py-8 border-t border-neutral-100">
              <Button 
                onClick={handleStartOnboarding}
                className="px-8 py-6 text-lg font-semibold rounded-xl bg-viverblue hover:bg-viverblue-dark hover:scale-[1.02] shadow-sm hover:shadow-md transition-all duration-200"
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
    </MemberLayout>
  );
};

export default OnboardingIntro;
