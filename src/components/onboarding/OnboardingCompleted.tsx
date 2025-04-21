
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import { CheckCircle2, Edit, Map } from "lucide-react";

export const OnboardingCompleted = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center space-y-6">
      <Confetti />
      
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      
      <h3 className="text-2xl font-bold">Onboarding Concluído!</h3>
      
      <p className="text-gray-600 max-w-md mx-auto">
        Obrigado por compartilhar suas informações. Agora você pode acessar sua trilha personalizada de implementação ou revisar suas respostas.
      </p>
      
      <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => navigate("/onboarding/review")}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Revisar/Editar Respostas
        </Button>
        
        <Button
          onClick={() => navigate("/implementation-trail")}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 flex items-center gap-2"
        >
          <Map className="h-4 w-4" />
          Acessar Minha Trilha
        </Button>
      </div>
    </div>
  );
};
