
import { cn } from "@/lib/utils";

/**
 * Banner moderno para o dashboard do membro, agora usando o avatar Milagrinho como destaque visual.
 * O ícone foi ajustado para ser um quadrado dentro de um círculo conforme solicitado.
 */
export function ModernDashboardHeader({ userName }: { userName: string }) {
  return (
    <div
      className={cn(
        "relative md:mb-10 mb-6 overflow-visible rounded-2xl md:rounded-3xl shadow-xl",
        "bg-gradient-to-br from-viverblue via-viverblue-light to-viverblue-dark animate-gradient-shift bg-size-200"
      )}
    >
      {/* Fundo decorativo com dots e elipses */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 dot-bg"></div>
        <svg className="w-full h-full" viewBox="0 0 800 280" fill="none">
          <ellipse cx="440" cy="120" rx="260" ry="100" fill="#fff" fillOpacity="0.12" />
          <ellipse cx="260" cy="170" rx="120" ry="38" fill="#fff" fillOpacity="0.17" />
        </svg>
      </div>
      {/* Conteúdo banner */}
      <div className="relative z-10 flex flex-row items-center gap-6 px-6 md:px-12 py-8 md:py-12">
        {/* Avatar Milagrinho - Ajustado para quadrado dentro de círculo */}
        <div className="flex-shrink-0 flex items-center justify-center h-24 w-24 md:h-32 md:w-32 rounded-full glassmorphism shadow-2xl border-4 border-viverblue/30 bg-white/80 overflow-hidden">
          <div className="h-16 w-16 md:h-20 md:w-20 bg-viverblue-dark/80 rounded-md flex items-center justify-center">
            <img
              src="/lovable-uploads/6bdb44c0-b115-45bc-977d-4284836453c2.png"
              alt="Avatar Milagrinho"
              className="h-12 w-12 md:h-16 md:w-16 object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
        </div>
        {/* Texto à direita do avatar */}
        <div>
          <span className="font-heading font-semibold text-white/80 text-base tracking-wide block mb-1">VIVER DE IA Hub</span>
          <h1 className="text-2xl md:text-4xl font-black leading-tight text-white drop-shadow-xl font-heading">
            Bem-vindo, {userName || "Membro"}!
          </h1>
          <div className="mt-2 md:mt-4 text-white/90 text-lg font-medium max-w-xl">
            Pronto para acelerar sua transformação com IA? Sua jornada personalizada começa aqui.
          </div>
        </div>
      </div>
    </div>
  );
}
