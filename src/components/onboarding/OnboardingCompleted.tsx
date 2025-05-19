
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Edit, Map, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { showOnboardingSuccessToast } from "./OnboardingSuccessToast";

export const OnboardingCompleted = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Disparar efeito de confete quando o componente montar
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#0ABAB5', '#6de2de', '#9EECEA', '#ffffff']
    });
    
    // Mostrar toast de sucesso
    setTimeout(() => {
      showOnboardingSuccessToast({
        title: "Onboarding concluído!",
        message: "Sua jornada no VIVER DE IA acaba de começar."
      });
    }, 500);
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#151823] to-[#1A1E2E] border border-neutral-700/50 rounded-lg shadow-lg p-8 text-center space-y-8 animate-fade-in">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-[#0ABAB5]/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-12 w-12 text-[#0ABAB5]" />
        </div>
        <div className="absolute -top-4 -right-4 w-10 h-10 text-yellow-400 animate-bounce">
          <Sparkles className="h-full w-full" />
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Onboarding Concluído!</h3>
        
        <p className="text-neutral-200 max-w-md mx-auto">
          Obrigado por compartilhar suas informações. Agora você pode acessar sua trilha personalizada de implementação ou revisar suas respostas.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto pt-4">
        <div className="p-6 bg-[#1E2235] rounded-xl border border-neutral-700/50 transition-all hover:border-neutral-600 hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 rounded-full bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
            <Edit className="h-6 w-6 text-indigo-400" />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">Revisar Respostas</h4>
          <p className="text-sm text-neutral-400 mb-4">
            Verifique e ajuste as informações fornecidas durante o onboarding.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/onboarding/review")}
            className="w-full border-neutral-600 text-neutral-200 hover:bg-neutral-800 hover:text-white group"
          >
            <Edit className="h-4 w-4 mr-2 group-hover:text-indigo-400" />
            Revisar Informações
          </Button>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-[#0ABAB5]/20 to-[#0ABAB5]/5 rounded-xl border border-[#0ABAB5]/30 transition-all hover:border-[#0ABAB5]/50 hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 rounded-full bg-[#0ABAB5]/20 flex items-center justify-center mx-auto mb-4">
            <Map className="h-6 w-6 text-[#0ABAB5]" />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">Trilha Personalizada</h4>
          <p className="text-sm text-neutral-400 mb-4">
            Acesse soluções personalizadas com base no seu perfil e objetivos.
          </p>
          <Button
            onClick={() => navigate("/implementation-trail")}
            className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-black font-medium group"
          >
            <Map className="h-4 w-4 mr-2 group-hover:text-white" />
            Acessar Minha Trilha
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-neutral-500 pt-6">
        Você pode editar suas informações a qualquer momento através do seu perfil
      </div>
    </div>
  );
};
