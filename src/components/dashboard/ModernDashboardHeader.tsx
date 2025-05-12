
import { cn } from "@/lib/utils";

/**
 * Cabeçalho minimalista para o dashboard do membro com design sóbrio.
 * Removidos gradientes excessivos e elementos decorativos para uma aparência mais profissional.
 */
export function ModernDashboardHeader({ userName }: { userName: string }) {
  return (
    <div
      className={cn(
        "relative mb-6 md:mb-8 overflow-hidden rounded-xl shadow-md",
        "bg-[#151823] border-b border-white/5"
      )}
    >
      {/* Conteúdo do banner */}
      <div className="relative z-10 flex flex-row items-center gap-6 px-6 md:px-8 py-6 md:py-8">
        {/* Avatar Milagrinho */}
        <div className="flex-shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-full shadow-md border border-white/10 bg-white/5 overflow-hidden">
          <img
            src="/lovable-uploads/6bdb44c0-b115-45bc-977d-4284836453c2.png"
            alt="Avatar Milagrinho"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Texto à direita do avatar */}
        <div>
          <span className="font-medium text-white/70 text-sm tracking-wide block mb-1">Bem-vindo ao VIVER DE IA Hub</span>
          <h1 className="text-xl md:text-2xl font-bold leading-tight text-white font-heading">
            Olá, {userName || "Membro"}
          </h1>
          <div className="mt-1 text-white/60 text-sm md:text-base">
            Acesse suas ferramentas e recursos de IA
          </div>
        </div>
      </div>
    </div>
  );
}
