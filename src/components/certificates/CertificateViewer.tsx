import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import viverDeIaClubLogo from '@/assets/viver-de-ia-club-logo.png';

interface CertificateViewerProps {
  userName: string;
  solutionTitle: string;
  completedDate: string;
  certificateId: string;
  onDownload: () => void;
  onOpenInNewTab: () => void;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({
  userName,
  solutionTitle,
  completedDate,
  certificateId,
  onDownload,
  onOpenInNewTab
}) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto aurora-glass rounded-2xl p-8 aurora-glow">
      {/* Aurora particles background */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="aurora-particle absolute top-10 left-10 w-4 h-4 bg-aurora/20 rounded-full"></div>
        <div className="aurora-particle absolute top-20 right-20 w-3 h-3 bg-viverblue/20 rounded-full animation-delay-2000"></div>
        <div className="aurora-particle absolute bottom-20 left-16 w-2 h-2 bg-operational/20 rounded-full animation-delay-4000"></div>
        <div className="aurora-particle absolute bottom-10 right-10 w-3 h-3 bg-aurora/30 rounded-full"></div>
      </div>

      {/* Decorative aurora corners */}
      <div className="absolute top-4 left-4 w-12 h-12 aurora-gradient opacity-20 rounded-tl-2xl blur-sm"></div>
      <div className="absolute top-4 right-4 w-12 h-12 aurora-gradient opacity-20 rounded-tr-2xl blur-sm"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 aurora-gradient opacity-20 rounded-bl-2xl blur-sm"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 aurora-gradient opacity-20 rounded-br-2xl blur-sm"></div>
      
      {/* Header */}
      <div className="relative text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 aurora-gradient rounded-full mb-6 aurora-glow p-1">
          <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
            <img 
              src={viverDeIaClubLogo} 
              alt="VIVER DE IA Club Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold aurora-text-gradient mb-3">Certificado de Conclusão</h1>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-0.5 aurora-gradient rounded-full"></div>
          <p className="text-xl text-muted-foreground font-medium">VIVER DE IA</p>
          <div className="w-8 h-0.5 aurora-gradient rounded-full"></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative text-center mb-10">
        <div className="relative z-10">
          <p className="text-xl text-muted-foreground mb-6 font-light">
            Certificamos que
          </p>
          
          <div className="relative mb-8">
            <h2 className="text-4xl font-bold aurora-text-gradient mb-4 px-6 py-3">
              {userName}
            </h2>
            <div className="h-0.5 w-32 aurora-gradient mx-auto rounded-full"></div>
          </div>
          
          <p className="text-xl text-muted-foreground mb-6 font-light">
            concluiu com sucesso a implementação da solução
          </p>
          
          <div className="relative mb-8 p-6 aurora-glass-hover rounded-xl">
            <h3 className="text-3xl font-semibold text-viverblue mb-2">
              "{solutionTitle}"
            </h3>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            demonstrando dedicação e competência na aplicação de soluções de Inteligência Artificial
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative flex justify-between items-end">
        <div className="text-left">
          <p className="text-sm text-muted-foreground/70 mb-1">Data de Conclusão</p>
          <p className="font-semibold text-foreground text-lg">{completedDate}</p>
        </div>
        
        <div className="text-center">
          <div className="mb-4">
            <p className="text-xl font-signature text-viverblue mb-2" style={{ fontFamily: 'Dancing Script, cursive' }}>
              Rafael G Milagre
            </p>
            <div className="w-32 h-0.5 bg-muted mx-auto"></div>
          </div>
          <div className="w-40 h-20 aurora-glass rounded-xl flex flex-col items-center justify-center mb-3 aurora-pulse">
            <div className="w-8 h-8 aurora-gradient rounded-full mb-2 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span className="text-xs font-bold aurora-text-gradient">ASSINATURA DIGITAL</span>
          </div>
          <p className="text-xs text-muted-foreground/50">ID: {certificateId}</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-muted-foreground/70 mb-1">Emitido por</p>
          <p className="font-semibold text-foreground text-lg">VIVER DE IA</p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
        <Button onClick={onDownload} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Baixar PDF
        </Button>
        
        <Button onClick={onOpenInNewTab} variant="outline" className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Abrir em Nova Guia
        </Button>
      </div>
    </div>
  );
};