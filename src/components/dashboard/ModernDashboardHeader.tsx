
import { cn } from "@/lib/utils";

/**
 * Banner moderno para o dashboard do membro com design aprimorado.
 * Utiliza gradientes dinâmicos, padrões decorativos e melhor organização dos elementos.
 */
export function ModernDashboardHeader({ userName }: { userName: string }) {
  return (
    <div
      className={cn(
        "relative mb-8 md:mb-12 overflow-visible rounded-2xl md:rounded-3xl shadow-xl",
        "bg-gradient-to-br from-viverblue via-indigo-500/80 to-viverblue-dark animate-gradient-shift bg-size-300"
      )}
    >
      {/* Elementos decorativos do fundo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 dot-bg"></div>
        <svg className="w-full h-full opacity-30" viewBox="0 0 800 280" fill="none">
          <circle cx="650" cy="80" r="120" fill="white" fillOpacity="0.05" />
          <circle cx="200" cy="200" r="80" fill="white" fillOpacity="0.05" />
          <ellipse cx="440" cy="120" rx="260" ry="100" fill="white" fillOpacity="0.12" />
          <ellipse cx="260" cy="170" rx="120" ry="38" fill="white" fillOpacity="0.17" />
          <path d="M-10,100 Q200,150 400,100 T800,120" stroke="white" strokeOpacity="0.1" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Conteúdo do banner */}
      <div className="relative z-10 flex flex-row items-center gap-6 px-6 md:px-12 py-8 md:py-12">
        {/* Avatar Milagrinho - Com design de quadrado dentro de círculo */}
        <div className="flex-shrink-0 flex items-center justify-center h-24 w-24 md:h-32 md:w-32 rounded-full glassmorphism shadow-2xl border-4 border-white/20 bg-white/90 overflow-hidden animate-fade-in">
          <div className="h-16 w-16 md:h-20 md:w-20 bg-viverblue-dark rounded-md flex items-center justify-center">
            <img
              src="/lovable-uploads/6bdb44c0-b115-45bc-977d-4284836453c2.png"
              alt="Avatar Milagrinho"
              className="h-12 w-12 md:h-16 md:w-16 object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
        </div>

        {/* Texto à direita do avatar com melhorias visuais */}
        <div className="animate-slide-in">
          <span className="font-heading font-semibold text-white/90 text-base tracking-wide block mb-1 uppercase bg-white/10 px-3 py-0.5 rounded-full inline-block">VIVER DE IA Hub</span>
          <h1 className="text-2xl md:text-4xl font-black leading-tight text-white drop-shadow-xl font-heading">
            Bem-vindo, {userName || "Membro"}!
          </h1>
          <div className="mt-2 md:mt-4 text-white/90 text-lg font-medium max-w-xl">
            Pronto para acelerar sua transformação com IA? Sua jornada personalizada começa aqui.
          </div>
        </div>
      </div>
      
      {/* Elemento decorativo na parte inferior */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-white/10 via-white/30 to-white/5"></div>
    </div>
  );
}
