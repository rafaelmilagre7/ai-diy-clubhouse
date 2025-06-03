
import React from "react";
import { MilagrinhoMessage } from "./MilagrinhoMessage";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";

interface OnboardingHeaderProps {
  firstName?: string;
  isOnboardingCompleted: boolean;
  title?: string;
  step?: number;
  onBackClick?: () => void;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  firstName,
  isOnboardingCompleted,
  title,
  step,
  onBackClick
}) => {
  return (
    <div className="space-y-4">
      {onBackClick && (
        <Button 
          variant="ghost" 
          onClick={onBackClick} 
          className="flex items-center text-gray-400 hover:text-white -ml-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Voltar</span>
        </Button>
      )}
      
      <MilagrinhoMessage
        message={
          !isOnboardingCompleted
            ? `Eu sou o Milagrinho, seu assistente de IA do VIVER DE IA Club. ${firstName ? 'Olá, ' + firstName + '! ' : ''}Vamos começar conhecendo um pouco sobre você. Estas informações vão me ajudar a personalizar sua experiência, onde você vai encontrar uma comunidade incrível transformando negócios com IA.`
            : `${firstName ? 'Olá, ' + firstName + '! ' : ''}Parabéns! Você concluiu o onboarding. Aqui você pode editar suas informações e acessar sua trilha personalizada sempre que quiser!`
        }
        title={title}
      />
    </div>
  );
};
