
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
      {/* Carregar fonte Google Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes:wght@400&display=swap" 
        rel="stylesheet"
      />
      
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
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center p-4">
                <img 
                  src="/lovable-uploads/b16ca23e-3c90-4de8-82a3-d6d0ad8b74de.png" 
                  alt="Viver de IA" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.log('Erro ao carregar logo');
                    e.currentTarget.style.display = 'none';
                  }}
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
                  <div className="relative flex flex-col items-end">
                    <div className="relative mb-2">
                      <p 
                        className="text-white text-3xl leading-none"
                        style={{ 
                          fontFamily: "'Dancing Script', cursive",
                          transform: 'rotate(-1deg)',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                          fontWeight: '700'
                        }}
                      >
                        Rafael G Milagre
                      </p>
                    </div>
                    <div className="w-48 h-px bg-white/30 mb-2"></div>
                    <p className="text-xs text-white/70">Founder do Viver de IA</p>
                  </div>
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
