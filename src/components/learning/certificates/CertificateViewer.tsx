
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, ExternalLinkIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CERTIFICATE_LOGO_URL } from "@/lib/supabase/uploadCertificateLogo";
import { toast } from "sonner";

interface CertificateViewerProps {
  certificate: {
    id: string;
    validation_code: string;
    implementation_date: string;
    issued_at: string;
    certificate_url?: string;
    certificate_filename?: string;
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
  onOpenInNewTab: () => void;
}

export const CertificateViewer = ({
  certificate,
  userProfile,
  onDownload,
  onShare,
  onOpenInNewTab,
}: CertificateViewerProps) => {
  const issuedDate = certificate.issued_at || certificate.implementation_date;
  const formattedDate = format(new Date(issuedDate), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR
  });

  const handleShare = () => {
    const shareText = `🎉 Acabei de receber meu certificado de implementação da solução "${certificate.solutions.title}" no Viver de IA!\n\nCódigo de validação: ${certificate.validation_code}\n\n#ViverDeIA #Certificado #IA`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Meu Certificado de Implementação',
        text: shareText,
        url: window.location.href
      }).then(() => {
        toast.success('Conteúdo compartilhado com sucesso!');
      }).catch(() => {
        navigator.clipboard.writeText(shareText).then(() => {
          toast.success('Texto copiado para a área de transferência!');
        });
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Texto do certificado copiado para a área de transferência!');
      }).catch(() => {
        toast.error('Erro ao copiar texto. Tente novamente.');
      });
    }
  };

  const hasCachedPDF = certificate.certificate_url && certificate.certificate_filename;

  return (
    <div className="space-y-6">
      <link 
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" 
        rel="stylesheet"
      />
      
      {/* Container responsivo para o certificado */}
      <div className="w-full max-w-6xl mx-auto">
        <Card className="bg-black border-neutral-700 overflow-hidden">
          <CardContent className="p-4">
            <div 
              className="certificate-container bg-black text-white border-2 border-gray-700 mx-auto"
              style={{
                aspectRatio: '1123/794',
                maxWidth: '100%',
                width: '100%',
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <img 
                  src={CERTIFICATE_LOGO_URL}
                  alt="Viver de IA" 
                  className="h-28 w-auto object-contain brightness-110"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Conteúdo principal */}
              <div className="flex-1 flex flex-col justify-center space-y-4 text-center">
                <h1 className="text-4xl font-bold mb-2 tracking-wider">CERTIFICADO</h1>
                <p className="text-lg text-gray-300 font-semibold">de Implementação de Solução</p>
                
                <p className="text-base text-gray-300 font-medium">Certificamos que</p>
                
                <div className="py-4 px-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <h2 className="text-2xl font-bold tracking-wide">{userProfile.name}</h2>
                </div>
                
                <p className="text-base text-gray-300 font-medium">concluiu com sucesso a implementação da solução</p>
                
                <div className="py-4 px-6 bg-white/8 rounded-xl border border-white/15">
                  <h3 className="text-xl font-semibold mb-1">{certificate.solutions.title}</h3>
                  <p className="text-gray-400 text-sm">Categoria: {certificate.solutions.category}</p>
                </div>
                
                <p className="text-base text-gray-300 font-medium">
                  em <span className="font-bold text-lg">{formattedDate}</span>
                </p>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-white/20 pt-4 mt-4">
                <div className="flex justify-between items-end mb-3">
                  <div className="text-left">
                    <p className="text-xs text-gray-400 mb-1 font-medium">Código de Validação:</p>
                    <p className="font-mono text-sm font-bold tracking-wider bg-white/10 px-2 py-1 rounded">
                      {certificate.validation_code}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div 
                      className="text-2xl mb-2"
                      style={{ 
                        fontFamily: "'Dancing Script', cursive",
                        transform: 'rotate(-1deg)',
                        textShadow: '2px 2px 4px rgba(255,255,255,0.2)',
                        fontWeight: '700'
                      }}
                    >
                      Rafael G Milagre
                    </div>
                    <div className="w-32 h-0.5 bg-white/30 mb-2 ml-auto"></div>
                    <p className="text-xs text-gray-400 font-medium">Founder do Viver de IA</p>
                  </div>
                </div>
                
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    Emitido por <span className="text-white font-bold">Viver de IA</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status do Cache */}
      {hasCachedPDF && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
            <Clock className="h-4 w-4" />
            Certificado pronto para download instantâneo
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onDownload}
          className="bg-viverblue hover:bg-viverblue/90 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          {hasCachedPDF ? 'Download Instantâneo' : 'Baixar PDF'}
        </Button>
        
        <Button
          onClick={onOpenInNewTab}
          variant="outline"
          className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
        >
          <ExternalLinkIcon className="h-4 w-4 mr-2" />
          {hasCachedPDF ? 'Abrir (Instantâneo)' : 'Abrir PDF em Nova Guia'}
        </Button>
        
        <Button
          onClick={onShare}
          variant="outline"
          className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </div>
    </div>
  );
};
