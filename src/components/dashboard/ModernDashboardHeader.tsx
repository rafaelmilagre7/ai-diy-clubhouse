
import { cn } from "@/lib/utils";

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
        {/* Logo centralizada verticalmente à esquerda */}
        <div className="flex-shrink-0 flex items-center justify-center h-20 w-20 md:h-24 md:w-24 bg-white/80 rounded-2xl shadow-lg border-2 border-viverblue/15">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="Logo VIVER DE IA Club"
            className="h-12 md:h-20 w-auto object-contain"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        </div>
        {/* Texto à direita da logo */}
        <div>
          <span className="font-heading font-semibold text-white/80 text-base tracking-wide block mb-1">VIVER DE IA Club</span>
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
