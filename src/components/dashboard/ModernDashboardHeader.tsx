
import { User } from "lucide-react";

interface ModernDashboardHeaderProps {
  userName: string;
}

export const ModernDashboardHeader = ({ userName }: ModernDashboardHeaderProps) => {
  return (
    <div className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-viverblue to-viverblue-light p-6 text-white shadow-lg">
      {/* Padrão de pontos para textura de fundo */}
      <div className="absolute inset-0 dot-pattern opacity-10"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white bg-opacity-20">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Olá, {userName}!</h1>
            <p className="mt-1 text-white text-opacity-90">
              Bem-vindo(a) ao seu dashboard do VIVER DE IA Club
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
