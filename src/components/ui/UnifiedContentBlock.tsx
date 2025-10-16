import React from 'react';
import { Lock, Crown } from 'lucide-react';

interface UnifiedContentBlockProps {
  sectionName: string; // 'networking', 'ferramentas', 'esta solução', 'este curso', etc.
  onClick?: () => void;
  children?: React.ReactNode; // Conteúdo que fica por trás do overlay
}

export const UnifiedContentBlock: React.FC<UnifiedContentBlockProps> = ({
  sectionName,
  onClick,
  children
}) => {
  return (
    <div 
      className="relative overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* Conteúdo de fundo (blurred) */}
      {children && (
        <div className="relative">
          {children}
        </div>
      )}
      
      {/* Overlay de bloqueio - design unificado */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 z-30 
                      flex items-center justify-center backdrop-blur-md
                      transition-all duration-500 group-hover:backdrop-blur-lg">
        
        {/* Padrão de pontos sutil */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{
               backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
               backgroundSize: '20px 20px'
             }}></div>
        
        {/* Gradientes animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 
                         opacity-50 blur-xl animate-pulse"></div>
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 
                         bg-gradient-to-br from-primary/30 to-transparent 
                         rounded-full blur-3xl opacity-40 
                         group-hover:opacity-60 transition-opacity duration-700"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 
                         bg-gradient-to-tl from-primary/20 to-transparent 
                         rounded-full blur-3xl opacity-30
                         group-hover:opacity-50 transition-opacity duration-700"></div>
        </div>
        
        {/* Conteúdo centralizado */}
        <div className="relative text-center space-y-6 px-6 max-w-md">
          {/* Ícone principal com animação */}
          <div className="relative mx-auto w-20 h-20">
            {/* Círculo de fundo com gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 
                           rounded-2xl shadow-2xl shadow-primary/40
                           group-hover:shadow-3xl group-hover:shadow-primary/60 
                           transition-all duration-500
                           group-hover:scale-110"></div>
            
            {/* Brilho interno */}
            <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent 
                           rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Ícone */}
            <div className="relative flex items-center justify-center w-full h-full">
              <Lock className="w-8 h-8 text-white" />
              {/* Crown animado */}
              <Crown className="absolute -top-1 -right-1 w-4 h-4 text-white/80 
                                 animate-pulse opacity-0 group-hover:opacity-100 
                                 transition-opacity duration-500 delay-200" />
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/40 rounded-2xl blur-lg scale-150 
                           opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
          </div>
          
          {/* Texto principal */}
          <div className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-white font-bold text-2xl tracking-tight
                           group-hover:text-white/95 transition-colors duration-300">
                Conteúdo Exclusivo
              </h4>
              
              {/* Linha decorativa */}
              <div className="flex items-center justify-center gap-3">
                <div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent w-12
                               group-hover:via-primary/80 transition-colors duration-500"></div>
                <Lock className="h-3 w-3 text-primary/70 group-hover:text-primary transition-colors duration-300" />
                <div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent w-12
                               group-hover:via-primary/80 transition-colors duration-500"></div>
              </div>
            </div>
            
            <p className="text-white/90 text-base leading-relaxed font-medium
                         group-hover:text-white transition-colors duration-300">
              Desbloqueie {sectionName} e acelere com IA
            </p>
          </div>
          
          {/* Indicador de ação */}
          <div className="inline-flex items-center gap-3 px-6 py-3 
                         bg-white/10 backdrop-blur-sm rounded-full border border-white/20
                         group-hover:bg-white/20 group-hover:border-white/30 
                         transition-all duration-300 shadow-lg">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-white/90 font-medium text-sm group-hover:text-white 
                           transition-colors duration-300">
              Toque para upgrade
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};