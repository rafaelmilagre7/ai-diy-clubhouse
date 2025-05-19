
import React from "react";
import { SuccessCard } from "../celebration/SuccessCard";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface OnboardingSuccessToastProps {
  title: string;
  message: string;
}

export const showOnboardingSuccessToast = ({ title, message }: OnboardingSuccessToastProps) => {
  // Dispara confete pequeno ao mostrar o toast
  const randomConfetti = () => {
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8, x: Math.random() },
      disableForReducedMotion: true,
      colors: ['#0ABAB5', '#34D399', '#ffffff']
    });
  };
  
  // Executar o confete
  randomConfetti();
  
  toast.custom((t) => (
    <div className="w-full max-w-md" onClick={() => toast.dismiss(t)}>
      <SuccessCard
        title={title}
        message={message}
        type="implementation"
        showConfetti={false} // Já disparamos confete personalizado acima
        className="cursor-pointer hover:opacity-95 transition-opacity shadow-lg border border-[#0ABAB5]/30"
      />
    </div>
  ), {
    duration: 6000,
    position: "top-center"
  });
};
