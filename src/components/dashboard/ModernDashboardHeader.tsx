
import { cn } from "@/lib/utils";

/**
 * Cabeçalho moderno para o dashboard do membro com design glassmorphism e branding Viver de IA.
 */
export function ModernDashboardHeader({ userName }: { userName: string }) {
  return (
    <div
      className={cn(
        "relative mb-6 md:mb-8 overflow-hidden rounded-xl shadow-lg animate-fade-in",
        "bg-gradient-to-br from-[#0F111A] via-[#151823] to-[#1A1E2E] backdrop-blur-sm border border-viverblue/20"
      )}
    >
      {/* Elementos decorativos com cores do Viver de IA */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-viverblue/10 rounded-full filter blur-3xl"></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-operational/8 rounded-full filter blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-strategy/5 rounded-full filter blur-3xl"></div>
      
      {/* Pattern decorativo sutil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-8 w-2 h-2 bg-viverblue rounded-full"></div>
        <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-operational rounded-full"></div>
        <div className="absolute bottom-6 left-12 w-1 h-1 bg-strategy rounded-full"></div>
      </div>
      
      {/* Conteúdo do banner */}
      <div className="relative z-10 flex flex-row items-center gap-6 px-6 md:px-8 py-6 md:py-8">
        {/* Logo do Viver de IA */}
        <div className="flex-shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-xl shadow-lg border border-viverblue/20 bg-gradient-to-br from-viverblue/20 to-viverblue/5 overflow-hidden group transition-all duration-300 hover:scale-105 hover:border-viverblue/40">
          <img 
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
            alt="VIVER DE IA Club"
            className="w-full h-full object-contain p-2"
          />
        </div>

        {/* Texto à direita do logo */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-viverblue/90 text-sm tracking-wide animate-slide-in">
              VIVER DE IA
            </span>
            <div className="h-1 w-1 bg-viverblue/60 rounded-full"></div>
            <span className="font-medium text-white/60 text-sm tracking-wide animate-slide-in">
              Member Hub
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold leading-tight text-white font-heading animate-slide-in" style={{ animationDelay: '0.1s' }}>
            Olá, {userName || "Membro"}! 👋
          </h1>
          <div className="mt-2 text-white/70 text-sm md:text-base animate-slide-in" style={{ animationDelay: '0.2s' }}>
            Acesse suas ferramentas e recursos de IA para transformar seu negócio
          </div>
        </div>

        {/* Badge de status (opcional) */}
        <div className="hidden md:flex flex-col items-end gap-2">
          <div className="px-3 py-1.5 bg-viverblue/10 border border-viverblue/30 rounded-full">
            <span className="text-xs font-medium text-viverblue">✨ Membro Ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
