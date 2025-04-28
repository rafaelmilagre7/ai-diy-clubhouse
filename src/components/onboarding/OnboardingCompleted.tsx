
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OnboardingCompleted = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Card Principal com fundo escuro */}
      <div className="bg-gray-800 rounded-lg p-8 shadow-lg text-center space-y-6">
        <h2 className="text-3xl font-bold text-white">Gerenciar Perfil</h2>
        <p className="text-gray-300 text-lg">
          Atualize suas informações ou acesse sua trilha personalizada
        </p>

        {/* Botões com espaçamento corrigido */}
        <div className="flex justify-center gap-4 pt-4">
          <Button
            variant="secondary"
            onClick={() => navigate("/profile/edit")}
            className="px-6 py-2 text-base flex items-center gap-2"
          >
            <Edit className="h-5 w-5" />
            Editar Informações
          </Button>

          <Button
            onClick={() => navigate("/implementation-trail")}
            className="px-6 py-2 text-base bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 flex items-center gap-2"
          >
            <Map className="h-5 w-5" />
            Acessar Trilha
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCompleted;
