
import { cn } from "@/lib/utils";

export function ModernDashboardHeader({ userName }: { userName: string }) {
  return (
    <div className={cn(
      "relative pb-10 md:pb-16 mb-6 md:mb-10 overflow-visible",
      "rounded-2xl md:rounded-3xl shadow-xl",
      "bg-gradient-to-br from-viverblue via-viverblue-light to-viverblue-dark animate-gradient-shift bg-size-200"
    )}>
      {/* Padrão de fundo decorativo */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 dot-bg"></div>
        <svg className="w-full h-full" viewBox="0 0 800 280" fill="none">
          <ellipse cx="500" cy="120" rx="340" ry="130" fill="#ffffff" fillOpacity="0.15" />
          <ellipse cx="300" cy="160" rx="140" ry="50" fill="#ffffff" fillOpacity="0.18" />
        </svg>
      </div>
      
      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between px-6 md:px-12 py-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <img src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" alt="Logo" className="h-10 w-10 rounded-lg shadow-lg" />
            <span className="font-heading font-semibold text-white text-lg tracking-wide">VIVER DE IA Club</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight text-white drop-shadow-xl font-heading">
            Bem-vindo, {userName || "Membro"}!
          </h1>
          <div className="mt-2 md:mt-4 text-white/90 text-lg font-medium max-w-xl">
            Pronto para acelerar sua transformação com IA? Sua jornada personalizada começa aqui.
          </div>
        </div>
        <div className="hidden md:block mt-6 md:mt-0">
          <img 
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="Dashboard Spotlight"
            className="h-24 w-24 rounded-2xl shadow-lg object-cover bg-white/60 animate-float"
            style={{ border: '4px solid #fff', filter: 'drop-shadow(0 4px 20px #0ABAB522)' }}
          />
        </div>
      </div>
    </div>
  )
}
