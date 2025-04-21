
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const OnboardingCompleted: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-[#0ABAB5]/10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[#0ABAB5] mb-1">
            Onboarding Completo!
          </h3>
          <p className="text-gray-600 text-sm">
            Edite suas respostas sempre que precisar. Para acessar sua trilha personalizada, clique no botão abaixo!
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/onboarding/review")}>
            Revisar/Editar Respostas
          </Button>
          <Button
            className="bg-[#0ABAB5] text-white hover:bg-[#09a19c]"
            onClick={() => navigate("/onboarding/trail-generation")}
          >
            Acessar Minha Trilha
          </Button>
        </div>
      </div>
    </div>
  );
};
