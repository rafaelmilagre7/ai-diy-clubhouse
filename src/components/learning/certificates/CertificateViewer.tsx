
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
  // Usar a data de emissão (issued_at) em vez da data de implementação
  const issuedDate = certificate.issued_at || certificate.implementation_date;
  const formattedDate = format(new Date(issuedDate), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR
  });

  // Função para gerar PDF e abrir em nova guia
  const handleOpenPDFInNewTab = async () => {
    try {
      toast.loading('Preparando certificado...', { id: 'pdf-loading' });
      
      console.log('Iniciando geração do PDF...');
      console.log('URL da logo:', CERTIFICATE_LOGO_URL);
      
      // Importar bibliotecas dinamicamente
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas').then(module => module.default),
        import('jspdf').then(module => module.default)
      ]);

      console.log('Bibliotecas carregadas');

      // Converter logo para base64
      console.log('Convertendo logo para base64...');
      const logoBase64 = await convertImageToBase64(CERTIFICATE_LOGO_URL);
      console.log('Logo convertida com sucesso, tamanho:', logoBase64.length);

      // Gerar HTML do certificado
      const htmlContent = generateCertificateHTML(certificate, userProfile, formattedDate, logoBase64);

      // Criar elemento temporário
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.innerHTML = htmlContent;
      
      document.body.appendChild(tempDiv);

      console.log('Elemento temporário criado, aguardando fontes...');
      
      // Aguardar fontes carregarem
      await new Promise(resolve => setTimeout(resolve, 4000));

      console.log('Capturando elemento como imagem...');
      
      // Capturar como imagem com dimensões A4 landscape
      const canvas = await html2canvas(tempDiv.querySelector('.certificate-container') as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        logging: true,
        width: 1123,
        height: 794
      });

      console.log('Canvas gerado:', canvas.width, 'x', canvas.height);

      // Gerar PDF com dimensões corretas
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Usar toda a área do A4 landscape (297x210mm)
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      
      console.log('PDF gerado, criando blob...');
      
      // Criar blob URL e abrir em nova guia
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const newWindow = window.open(pdfUrl, '_blank');
      if (!newWindow) {
        throw new Error('Pop-ups bloqueados. Permita pop-ups para abrir o certificado.');
      }

      toast.success('Certificado aberto em nova guia!', { id: 'pdf-loading' });

      // Remover elemento temporário
      document.body.removeChild(tempDiv);
      
      // Limpar URL após um tempo
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
      
    } catch (error) {
      console.error('Erro ao abrir certificado em nova guia:', error);
      toast.error(`Erro ao abrir certificado: ${error.message}`, { id: 'pdf-loading' });
    }
  };

  // Função para compartilhar
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
        // Se o share falhar, copiar para clipboard
        navigator.clipboard.writeText(shareText).then(() => {
          toast.success('Texto copiado para a área de transferência!');
        });
      });
    } else {
      // Para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Texto do certificado copiado para a área de transferência!');
      }).catch(() => {
        toast.error('Erro ao copiar texto. Tente novamente.');
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Carregar fonte Google Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes:wght@400&display=swap" 
        rel="stylesheet"
      />
      
      {/* Certificado Visual com fundo preto e dimensões A4 */}
      <Card className="bg-black border-neutral-700 overflow-hidden">
        <CardContent className="p-0" data-certificate-content>
          <div 
            className="relative text-center space-y-6 text-white"
            style={{
              width: '1123px',
              height: '794px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '2px solid #333333',
              margin: '0 auto',
              transform: 'scale(0.6)',
              transformOrigin: 'top center'
            }}
          >
            {/* Logo no topo */}
            <div className="flex justify-center mb-5">
              <div className="w-45 h-23">
                <img 
                  src={CERTIFICATE_LOGO_URL}
                  alt="Viver de IA" 
                  className="w-full h-full object-contain brightness-110"
                  crossOrigin="anonymous"
                  onLoad={() => console.log('Logo carregada com sucesso no preview')}
                />
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 flex flex-col justify-center space-y-5 py-5">
              {/* Header */}
              <div className="space-y-3">
                <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg tracking-wide">CERTIFICADO</h1>
                <p className="text-xl text-gray-300 font-semibold">de Implementação de Solução</p>
              </div>

              <p className="text-lg text-gray-300 font-medium">
                Certificamos que
              </p>
              
              <div className="py-5 px-5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                <h2 className="text-3xl font-bold text-white tracking-wide">{userProfile.name}</h2>
              </div>
              
              <p className="text-lg text-gray-300 font-medium">
                concluiu com sucesso a implementação da solução
              </p>
              
              <div className="py-5 px-5 bg-white/8 rounded-xl border border-white/15 shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-2">{certificate.solutions.title}</h3>
                <p className="text-gray-400 text-base">Categoria: {certificate.solutions.category}</p>
              </div>
              
              <p className="text-lg text-gray-300 font-medium">
                em <span className="font-bold text-white text-xl">{formattedDate}</span>
              </p>
            </div>

            {/* Footer com código de validação e assinatura */}
            <div className="pt-6 border-t-2 border-white/20 space-y-4 mt-6">
              <div className="flex justify-between items-end">
                {/* Código de validação */}
                <div className="text-left">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Código de Validação:</p>
                  <p className="font-mono text-white text-sm font-bold tracking-wider bg-white/10 px-3 py-1 rounded">{certificate.validation_code}</p>
                </div>
                
                {/* Assinatura */}
                <div className="text-right">
                  <div className="relative flex flex-col items-end">
                    <div className="relative mb-3">
                      <p 
                        className="text-white text-3xl leading-none"
                        style={{ 
                          fontFamily: "'Dancing Script', cursive",
                          transform: 'rotate(-1deg)',
                          textShadow: '2px 2px 4px rgba(255,255,255,0.2)',
                          fontWeight: '700'
                        }}
                      >
                        Rafael G Milagre
                      </p>
                    </div>
                    <div className="w-45 h-0.5 bg-white/30 mb-3"></div>
                    <p className="text-xs text-gray-400 font-medium">Founder do Viver de IA</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-3">
                <p className="text-xs text-gray-500">
                  Emitido por <span className="text-white font-bold text-sm">Viver de IA</span>
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
