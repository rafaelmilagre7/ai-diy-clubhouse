
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CertificateViewerProps {
  certificate: {
    id: string;
    validation_code: string;
    implementation_date: string;
    solutions: {
      title: string;
      category: string;
    };
  };
  userProfile: {
    name: string;
    email: string;
  };
  onDownload: () => void;
  onShare: () => void;
  onValidate: () => void;
}

export const CertificateViewer = ({
  certificate,
  userProfile,
  onDownload,
  onShare,
  onValidate,
}: CertificateViewerProps) => {
  const formattedDate = format(new Date(certificate.implementation_date), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR
  });

  return (
    <div className="space-y-6">
      {/* Certificado Visual */}
      <Card className="bg-gradient-to-br from-viverblue/20 via-viverblue-light/20 to-viverblue-lighter/20 border-viverblue/30 overflow-hidden">
        <CardContent className="p-8 relative">
          {/* Padrão decorativo de fundo */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}></div>
          </div>
          
          <div className="relative z-10 text-center space-y-6">
            {/* Logo no topo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/332ff44b-8628-4122-b080-843e65b0882f.png" 
                  alt="Viver de IA" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-sm">CERTIFICADO</h1>
              <p className="text-xl text-white/90 font-semibold">de Implementação de Solução</p>
            </div>

            {/* Conteúdo principal */}
            <div className="space-y-4">
              <p className="text-lg text-white/90">
                Certificamos que
              </p>
              
              <div className="py-4 px-6 bg-white/15 rounded-lg backdrop-blur-sm border border-white/20">
                <h2 className="text-2xl font-bold text-white">{userProfile.name}</h2>
              </div>
              
              <p className="text-lg text-white/90">
                concluiu com sucesso a implementação da solução
              </p>
              
              <div className="py-4 px-6 bg-white/10 rounded-lg border border-white/20">
                <h3 className="text-xl font-semibold text-white">{certificate.solutions.title}</h3>
                <p className="text-white/80 text-sm mt-1">Categoria: {certificate.solutions.category}</p>
              </div>
              
              <p className="text-white/90">
                em <span className="font-semibold text-white">{formattedDate}</span>
              </p>
            </div>

            {/* Footer com código de validação e assinatura */}
            <div className="pt-6 border-t border-white/20 space-y-4">
              <div className="flex justify-between items-end">
                {/* Código de validação */}
                <div className="text-left">
                  <p className="text-xs text-white/70 mb-1">Código de Validação:</p>
                  <p className="font-mono text-white text-sm font-semibold">{certificate.validation_code}</p>
                </div>
                
                {/* Assinatura */}
                <div className="text-right">
                  <div className="relative" style={{ width: '240px' }}>
                    <div className="border-b border-white/30 h-8 flex items-end">
                      <p 
                        className="text-white mb-1" 
                        style={{ 
                          fontFamily: "'Great Vibes', 'Allura', 'Dancing Script', cursive",
                          fontSize: '32px',
                          transform: 'rotate(-2deg)',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                          letterSpacing: '2px',
                          fontWeight: '400'
                        }}
                      >
                        Rafael G Milagre
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-white/70 mt-2">Founder do Viver de IA</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-white/60">
                  Emitido por <span style={{ color: 'white', fontWeight: '600' }}>Viver de IA</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onDownload}
          className="bg-viverblue hover:bg-viverblue/90 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar PDF
        </Button>
        
        <Button
          onClick={onShare}
          variant="outline"
          className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
        
        <Button
          onClick={onValidate}
          variant="outline"
          className="border-neutral-600 text-gray-300 hover:bg-neutral-700"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Validar Certificado
        </Button>
      </div>
    </div>
  );
};
