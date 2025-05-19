
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Edit, Map } from "lucide-react";
import confetti from "canvas-confetti";

export const OnboardingCompleted = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Disparar efeito de confete quando o componente montar
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0ABAB5', '#6de2de', '#9EECEA']
    });
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto bg-[#151823] border border-neutral-700/50 rounded-lg shadow-lg p-8 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-[#0ABAB5]/20 flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-10 w-10 text-[#0ABAB5]" />
      </div>
      
      <h3 className="text-2xl font-bold text-white">Onboarding Concluído!</h3>
      
      <p className="text-neutral-200 max-w-md mx-auto">
        Obrigado por compartilhar suas informações. Agora você pode acessar sua trilha personalizada de implementação ou revisar suas respostas.
      </p>
      
      <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => navigate("/onboarding/review")}
          className="flex items-center gap-2 bg-transparent border-neutral-600 text-neutral-200 hover:bg-neutral-800 hover:text-white"
        >
          <Edit className="h-4 w-4" />
          Revisar/Editar Respostas
        </Button>
        
        <Button
          onClick={() => navigate("/implementation-trail")}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-black font-medium flex items-center gap-2"
        >
          <Map className="h-4 w-4" />
          Acessar Minha Trilha
        </Button>
      </div>
    </div>
  );
};
