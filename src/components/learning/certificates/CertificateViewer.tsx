
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

  return (
    <div className="space-y-6">
      {/* Carregar fonte Google Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes:wght@400&display=swap" 
        rel="stylesheet"
      />
      
      {/* Certificado Visual */}
      <Card className="bg-gradient-to-br from-viverblue/20 via-viverblue-light/20 to-viverblue-lighter/20 border-viverblue/30 overflow-hidden">
        <CardContent className="p-10 relative">
          {/* Padrão decorativo de fundo */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}></div>
          </div>
          
          <div className="relative z-10 text-center space-y-8">
            {/* Logo no topo - tamanho aumentado */}
            <div className="flex justify-center mb-8">
              <div className="w-48 h-24 bg-white/15 rounded-2xl flex items-center justify-center p-3 backdrop-blur-sm border border-white/20 shadow-lg">
                <img 
                  src={CERTIFICATE_LOGO_URL}
                  alt="Viver de IA" 
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                  onLoad={() => console.log('Logo carregada com sucesso')}
                  onError={(e) => {
                    console.error('Erro ao carregar logo do Supabase, usando fallback');
                    e.currentTarget.src = '/lovable-uploads/a408c993-07fa-49f2-bee6-c66d0614298b.png';
                  }}
                />
              </div>
            </div>

            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg tracking-wide">CERTIFICADO</h1>
              <p className="text-2xl text-white/95 font-semibold">de Implementação de Solução</p>
            </div>

            {/* Conteúdo principal */}
            <div className="space-y-6 py-6">
              <p className="text-xl text-white/90 font-medium">
                Certificamos que
              </p>
              
              <div className="py-6 px-8 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <h2 className="text-3xl font-bold text-white tracking-wide">{userProfile.name}</h2>
              </div>
              
              <p className="text-xl text-white/90 font-medium">
                concluiu com sucesso a implementação da solução
              </p>
              
              <div className="py-6 px-8 bg-white/15 rounded-xl border border-white/25 shadow-lg">
                <h3 className="text-2xl font-semibold text-white mb-2">{certificate.solutions.title}</h3>
                <p className="text-white/85 text-lg">Categoria: {certificate.solutions.category}</p>
              </div>
              
              <p className="text-xl text-white/90 font-medium">
                em <span className="font-bold text-white text-2xl">{formattedDate}</span>
              </p>
            </div>

            {/* Footer com código de validação e assinatura */}
            <div className="pt-8 border-t-2 border-white/30 space-y-6 mt-8">
              <div className="flex justify-between items-end">
                {/* Código de validação */}
                <div className="text-left">
                  <p className="text-sm text-white/80 mb-2 font-medium">Código de Validação:</p>
                  <p className="font-mono text-white text-lg font-bold tracking-wider bg-white/10 px-3 py-1 rounded">{certificate.validation_code}</p>
                </div>
                
                {/* Assinatura */}
                <div className="text-right">
                  <div className="relative flex flex-col items-end">
                    <div className="relative mb-3">
                      <p 
                        className="text-white text-4xl leading-none"
                        style={{ 
                          fontFamily: "'Dancing Script', cursive",
                          transform: 'rotate(-1deg)',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                          fontWeight: '700'
                        }}
                      >
                        Rafael G Milagre
                      </p>
                    </div>
                    <div className="w-52 h-0.5 bg-white/40 mb-3"></div>
                    <p className="text-sm text-white/80 font-medium">Founder do Viver de IA</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <p className="text-sm text-white/70">
                  Emitido por <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>Viver de IA</span>
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
