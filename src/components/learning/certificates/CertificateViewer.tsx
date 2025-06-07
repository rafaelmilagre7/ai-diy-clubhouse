
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CERTIFICATE_LOGO_URL } from "@/lib/supabase/uploadCertificateLogo";

interface CertificateViewerProps {
  certificate: {
    id: string;
    validation_code: string;
    implementation_date: string;
    issued_at: string;
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
  // Usar a data de emissão (issued_at) em vez da data de implementação
  const issuedDate = certificate.issued_at || certificate.implementation_date;
  const formattedDate = format(new Date(issuedDate), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR
  });

  const openInNewTab = () => {
    const certificateWindow = window.open('', '_blank');
    if (certificateWindow) {
      certificateWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificado - ${certificate.solutions.title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 20px; background: #f0f0f0; font-family: Arial, sans-serif; }
            .certificate-container { max-width: 1000px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            ${document.querySelector('.certificate-content')?.outerHTML || ''}
          </div>
        </body>
        </html>
      `);
      certificateWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Carregar fonte Google Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Playfair+Display:wght@400;600;700&display=swap" 
        rel="stylesheet"
      />
      
      {/* Certificado Visual com Design Elegante e Limpo */}
      <Card className="overflow-hidden border-none shadow-2xl relative">
        <CardContent className="p-0 relative">
          <div className="certificate-content relative w-full h-[600px] bg-gradient-to-br from-viverblue via-viverblue-light to-viverblue-lighter overflow-hidden">
            
            {/* Elementos Decorativos Sutis */}
            <div className="absolute inset-0">
              {/* Gradiente overlay sutil */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15"></div>
              
              {/* Ornamentos dos cantos */}
              <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-white/20"></div>
              <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-white/20"></div>
              <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-white/20"></div>
              <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-white/20"></div>
              
              {/* Círculos decorativos sutis */}
              <div className="absolute top-8 left-1/4 w-24 h-24 border border-white/10 rounded-full"></div>
              <div className="absolute bottom-12 right-1/4 w-20 h-20 border border-white/8 rounded-full"></div>
            </div>

            <div className="relative z-10 p-8 h-full flex flex-col">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img 
                  src={CERTIFICATE_LOGO_URL}
                  alt="Viver de IA" 
                  className="w-64 h-32 object-contain filter drop-shadow-lg"
                  crossOrigin="anonymous"
                  onLoad={() => console.log('Logo carregada com sucesso')}
                  onError={(e) => {
                    console.error('Erro ao carregar logo do Supabase, usando fallback');
                    e.currentTarget.src = '/lovable-uploads/a408c993-07fa-49f2-bee6-c66d0614298b.png';
                  }}
                />
              </div>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                </div>
                
                <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
                  CERTIFICADO
                </h1>
                <p className="text-xl text-white/95 font-medium">de Implementação de Solução</p>
                
                <div className="flex justify-center mt-3">
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                </div>
              </div>

              {/* Conteúdo principal */}
              <div className="flex-1 flex flex-col justify-center space-y-4">
                <p className="text-lg text-white/90 font-medium text-center">
                  Certificamos que
                </p>
                
                <div className="py-6 px-8 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg text-center">
                  <h2 className="text-3xl font-bold text-white tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {userProfile.name}
                  </h2>
                </div>
                
                <p className="text-lg text-white/90 font-medium text-center">
                  concluiu com sucesso a implementação da solução
                </p>
                
                <div className="py-6 px-8 bg-white/15 rounded-xl border border-white/25 shadow-lg text-center">
                  <h3 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {certificate.solutions.title}
                  </h3>
                  <p className="text-white/85 text-base">Categoria: {certificate.solutions.category}</p>
                </div>
                
                <p className="text-lg text-white/90 font-medium text-center">
                  em <span className="font-bold text-white text-xl tracking-wide">{formattedDate}</span>
                </p>
              </div>

              {/* Footer */}
              <div className="pt-6 mt-6 border-t border-white/20">
                <div className="flex justify-between items-end">
                  {/* Código de validação */}
                  <div className="text-left">
                    <p className="text-sm text-white/80 mb-2 font-medium">Código de Validação:</p>
                    <div className="bg-white/15 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                      <p className="font-mono text-white text-base font-bold tracking-wider">{certificate.validation_code}</p>
                    </div>
                  </div>
                  
                  {/* Assinatura */}
                  <div className="text-right">
                    <div className="flex flex-col items-end">
                      <p 
                        className="text-white text-4xl mb-3 filter drop-shadow-md"
                        style={{ 
                          fontFamily: "'Dancing Script', cursive",
                          transform: 'rotate(-1deg)',
                          fontWeight: '700'
                        }}
                      >
                        Rafael G Milagre
                      </p>
                      <div className="w-48 h-0.5 bg-gradient-to-r from-white/20 via-white/60 to-white/20 mb-2"></div>
                      <p className="text-sm text-white/80 font-medium">Founder do Viver de IA</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-4 mt-4 border-t border-white/10">
                  <p className="text-sm text-white/70">
                    Emitido por <span className="text-white font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Viver de IA</span>
                  </p>
                </div>
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
          onClick={openInNewTab}
          variant="outline"
          className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir em Nova Guia
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
