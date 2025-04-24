
import React from "react";
import { PersonalInfoFormFull } from "./steps/PersonalInfoFormFull";
import { useLocation } from "react-router-dom";

export const OnboardingForm: React.FC = () => {
  const location = useLocation();
  
  // Verificação explícita de qual rota estamos para garantir o componente correto
  console.log("OnboardingForm renderizando na rota:", location.pathname);
  
  // Se não estivermos na rota principal de onboarding, mostrar aviso
  if (location.pathname !== "/onboarding") {
    console.warn(`OnboardingForm sendo renderizado na rota incorreta: ${location.pathname}`);
    return (
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
        <p className="text-yellow-700">
          Este componente deveria ser renderizado apenas na rota /onboarding (dados pessoais).
          Você será redirecionado para a página correta em instantes.
        </p>
      </div>
    );
  }
  
  // Na rota correta, renderizar o formulário de dados pessoais
  return (
    <div className="mt-8">
      <PersonalInfoFormFull />
    </div>
  );
};
