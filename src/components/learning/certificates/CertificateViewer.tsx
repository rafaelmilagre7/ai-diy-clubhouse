
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, ExternalLinkIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CERTIFICATE_LOGO_URL } from "@/lib/supabase/uploadCertificateLogo";
import { toast } from "sonner";
import { convertImageToBase64, generateCertificateHTML } from "@/utils/certificateUtils";

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
}

export const CertificateViewer = ({
  certificate,
  userProfile,
  onDownload,
  onShare,
}: CertificateViewerProps) => {
  const issuedDate = certificate.issued_at || certificate.implementation_date;
  const formattedDate = format(new Date(issuedDate), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR
  });

  const handleOpenPDFInNewTab = async () => {
    try {
      toast.loading('Preparando certificado...', { id: 'pdf-loading' });
      
      console.log('Iniciando geração do PDF...');
      
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas').then(module => module.default),
        import('jspdf').then(module => module.default)
      ]);

      console.log('Bibliotecas carregadas');

      const logoBase64 = await convertImageToBase64(CERTIFICATE_LOGO_URL);
      console.log('Logo convertida com sucesso');

      const htmlContent = generateCertificateHTML(certificate, userProfile, formattedDate, logoBase64);

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.innerHTML = htmlContent;
      
      document.body.appendChild(tempDiv);

      console.log('Elemento temporário criado, aguardando fontes...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('Capturando elemento como imagem...');
      
      const canvas = await html2canvas(tempDiv.querySelector('.certificate-container') as HTMLElement, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        logging: false,
        width: 1123,
        height: 794
      });

      console.log('Canvas gerado:', canvas.width, 'x', canvas.height);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const newWindow = window.open(pdfUrl, '_blank');
      if (!newWindow) {
        throw new Error('Pop-ups bloqueados. Permita pop-ups para abrir o certificado.');
      }

      toast.success('Certificado aberto em nova guia!', { id: 'pdf-loading' });

      document.body.removeChild(tempDiv);
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
      
    } catch (error) {
      console.error('Erro ao abrir certificado em nova guia:', error);
      toast.error(`Erro ao abrir certificado: ${error.message}`, { id: 'pdf-loading' });
    }
  };

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
                  className="h-16 w-auto object-contain brightness-110"
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
          onClick={handleOpenPDFInNewTab}
          variant="outline"
          className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
        >
          <ExternalLinkIcon className="h-4 w-4 mr-2" />
          Abrir PDF em Nova Guia
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
