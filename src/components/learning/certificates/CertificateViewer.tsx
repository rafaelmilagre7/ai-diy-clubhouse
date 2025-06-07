
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
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes:wght@400&family=Playfair+Display:wght@400;600;700&display=swap" 
        rel="stylesheet"
      />
      
      {/* Certificado Visual com Design Melhorado */}
      <Card className="overflow-hidden border-none shadow-2xl relative">
        <CardContent className="p-0 relative">
          {/* Background Principal com Múltiplas Camadas */}
          <div className="relative w-full h-[700px] bg-gradient-to-br from-viverblue via-viverblue-light to-viverblue-lighter overflow-hidden">
            
            {/* Camada de Gradiente Adicional para Profundidade */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20"></div>
            
            {/* Elementos Decorativos de Fundo */}
            <div className="absolute inset-0">
              {/* Círculos Decorativos */}
              <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/10 rounded-full"></div>
              <div className="absolute top-20 right-16 w-24 h-24 border border-white/15 rounded-full"></div>
              <div className="absolute bottom-16 left-20 w-40 h-40 border border-white/8 rounded-full"></div>
              <div className="absolute bottom-32 right-32 w-20 h-20 border-2 border-white/12 rounded-full"></div>
              
              {/* Linhas Decorativas */}
              <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
              <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/8 to-transparent"></div>
              
              {/* Padrão Geométrico */}
              <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="geometric" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <polygon points="10,2 18,8 10,14 2,8" fill="white" fillOpacity="0.1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#geometric)" />
              </svg>
            </div>

            {/* Ornamentos dos Cantos */}
            <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-white/20"></div>
            <div className="absolute top-8 right-8 w-20 h-20 border-r-2 border-t-2 border-white/20"></div>
            <div className="absolute bottom-8 left-8 w-20 h-20 border-l-2 border-b-2 border-white/20"></div>
            <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-white/20"></div>

            <div className="relative z-10 p-12 h-full flex flex-col">
              {/* Logo Grande - Removida a Borda */}
              <div className="flex justify-center mb-8">
                <img 
                  src={CERTIFICATE_LOGO_URL}
                  alt="Viver de IA" 
                  className="w-80 h-40 object-contain filter drop-shadow-2xl"
                  crossOrigin="anonymous"
                  onLoad={() => console.log('Logo carregada com sucesso')}
                  onError={(e) => {
                    console.error('Erro ao carregar logo do Supabase, usando fallback');
                    e.currentTarget.src = '/lovable-uploads/a408c993-07fa-49f2-bee6-c66d0614298b.png';
                  }}
                />
              </div>

              {/* Header com Ornamentos */}
              <div className="text-center mb-8 relative">
                {/* Ornamento Superior */}
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                </div>
                
                <h1 className="text-6xl font-bold text-white mb-3 drop-shadow-2xl tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
                  CERTIFICADO
                </h1>
                <p className="text-2xl text-white/95 font-semibold tracking-wide">de Implementação de Solução</p>
                
                {/* Ornamento Inferior */}
                <div className="flex justify-center mt-4">
                  <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                </div>
              </div>

              {/* Conteúdo principal */}
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <p className="text-xl text-white/90 font-medium text-center">
                  Certificamos que
                </p>
                
                <div className="py-8 px-10 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 shadow-2xl relative overflow-hidden text-center">
                  {/* Brilho de Fundo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  <h2 className="relative text-4xl font-bold text-white tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {userProfile.name}
                  </h2>
                </div>
                
                <p className="text-xl text-white/90 font-medium text-center">
                  concluiu com sucesso a implementação da solução
                </p>
                
                <div className="py-8 px-10 bg-white/15 rounded-2xl border border-white/25 shadow-xl text-center relative overflow-hidden">
                  {/* Efeito de Brilho */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                  <h3 className="text-3xl font-semibold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {certificate.solutions.title}
                  </h3>
                  <p className="text-white/85 text-lg">Categoria: {certificate.solutions.category}</p>
                </div>
                
                <p className="text-xl text-white/90 font-medium text-center">
                  em <span className="font-bold text-white text-2xl tracking-wide">{formattedDate}</span>
                </p>
              </div>

              {/* Footer Elegante */}
              <div className="pt-8 mt-8 relative">
                {/* Linha Decorativa Superior */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                
                <div className="flex justify-between items-end">
                  {/* Código de validação */}
                  <div className="text-left">
                    <p className="text-sm text-white/80 mb-3 font-medium">Código de Validação:</p>
                    <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                      <p className="font-mono text-white text-lg font-bold tracking-wider">{certificate.validation_code}</p>
                    </div>
                  </div>
                  
                  {/* Assinatura Elegante */}
                  <div className="text-right">
                    <div className="relative flex flex-col items-end">
                      <div className="relative mb-4">
                        <p 
                          className="text-white text-5xl leading-none filter drop-shadow-lg"
                          style={{ 
                            fontFamily: "'Dancing Script', cursive",
                            transform: 'rotate(-1deg)',
                            fontWeight: '700'
                          }}
                        >
                          Rafael G Milagre
                        </p>
                      </div>
                      <div className="w-56 h-0.5 bg-gradient-to-r from-white/20 via-white/60 to-white/20 mb-3"></div>
                      <p className="text-sm text-white/80 font-medium">Founder do Viver de IA</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-6 mt-6">
                  {/* Linha Decorativa */}
                  <div className="flex justify-center mb-3">
                    <div className="w-48 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                  <p className="text-sm text-white/70">
                    Emitido por <span className="text-white font-bold text-base tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>Viver de IA</span>
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
