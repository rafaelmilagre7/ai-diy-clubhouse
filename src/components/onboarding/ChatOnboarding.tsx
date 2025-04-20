
import { User, ArrowRight } from "lucide-react";

export const ChatOnboarding = () => {
  return (
    <div className="w-full bg-[#C6F6F2] rounded-lg px-5 py-4 flex items-start gap-3 shadow mb-6">
      <div className="flex items-center">
        <User className="h-7 w-7 text-[#0ABAB5]" />
      </div>
      <div>
        <span className="block text-[#0ABAB5] font-semibold">
          Ei! 👋
        </span>
        <span className="block text-gray-700 mt-0.5">
          Vamos começar conhecendo um pouco sobre você. Estas informações vão 
          me ajudar a personalizar sua experiência no <b>VIVER DE IA Club</b>, onde você vai encontrar uma comunidade incrível de pessoas transformando negócios com IA.
        </span>
      </div>
    </div>
  );
};
