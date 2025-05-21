
import { cn } from "@/lib/utils";

/**
 * Cabeçalho moderno para o dashboard do membro com design glassmorphism.
 */
export function ModernDashboardHeader({ userName }: { userName: string }) {
  // Função para obter saudação com base na hora do dia
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div
      className={cn(
        "relative mb-6 md:mb-8 overflow-hidden rounded-xl shadow-md animate-fade-in",
        "bg-gradient-to-br from-[#151823] to-[#1A1E2E]/90 backdrop-blur-sm border border-white/5"
      )}
    >
      {/* Elemento decorativo */}
      <div className="absolute inset-0 bg-[url('/lovable-uploads/6bdb44c0-b115-45bc-977d-4284836453c2.png')] opacity-5 bg-right bg-no-repeat bg-contain" />
      
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-viverblue/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-strategy/5 rounded-full filter blur-3xl"></div>
      
      {/* Conteúdo do banner */}
      <div className="relative z-10 flex flex-row items-center gap-6 px-6 md:px-8 py-6 md:py-8">
        {/* Avatar Milagrinho */}
        <div className="flex-shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-full shadow-md border border-white/10 bg-white/5 overflow-hidden group transition-transform duration-300 hover:scale-105">
          <img
            src="/lovable-uploads/6bdb44c0-b115-45bc-977d-4284836453c2.png"
            alt="Avatar Milagrinho"
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Texto à direita do avatar */}
        <div>
          <span className="font-medium text-white/70 text-sm tracking-wide block mb-1 animate-slide-in">
            Bem-vindo ao VIVER DE IA Hub
          </span>
          <h1 className="text-xl md:text-2xl font-bold leading-tight text-white font-heading animate-slide-in" style={{ animationDelay: '0.1s' }}>
            {getGreeting()}, {userName || "Membro"}
          </h1>
          <div className="mt-1 text-white/60 text-sm md:text-base animate-slide-in" style={{ animationDelay: '0.2s' }}>
            Acesse suas ferramentas e recursos de IA
          </div>
        </div>
      </div>
    </div>
  );
}
