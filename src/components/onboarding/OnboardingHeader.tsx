
import React from "react";
import { MilagrinhoMessage } from "./MilagrinhoMessage";

interface OnboardingHeaderProps {
  firstName?: string;
  isOnboardingCompleted: boolean;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  firstName,
  isOnboardingCompleted,
}) => {
  return (
    <MilagrinhoMessage
      message={
        !isOnboardingCompleted
          ? `Eu sou o Milagrinho, seu assistente de IA do VIVER DE IA Club. ${firstName ? 'Olá, ' + firstName + '! ' : ''}Vamos começar conhecendo um pouco sobre você. Estas informações vão me ajudar a personalizar sua experiência, onde você vai encontrar uma comunidade incrível transformando negócios com IA.`
          : `${firstName ? 'Olá, ' + firstName + '! ' : ''}Parabéns! Você concluiu o onboarding. Aqui você pode editar suas informações e acessar sua trilha personalizada sempre que quiser!`
      }
    />
  );
};
