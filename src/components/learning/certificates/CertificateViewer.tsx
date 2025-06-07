
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, ExternalLinkIcon } from "lucide-react";
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

  // Função para gerar PDF e abrir em nova guia
  const handleOpenPDFInNewTab = async () => {
    try {
      toast.loading('Preparando certificado...');
      
      // Importar bibliotecas dinamicamente
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      // Criar elemento temporário com o certificado
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '900px';
      tempDiv.style.height = '650px';
      tempDiv.style.background = 'linear-gradient(135deg, #0ABAB5 0%, #00EAD9 50%, #6DF2E9 100%)';
      tempDiv.style.color = 'white';
      tempDiv.style.padding = '50px';
      tempDiv.style.textAlign = 'center';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.position = 'relative';

      tempDiv.innerHTML = `
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes:wght@400&display=swap" rel="stylesheet">
        <div style="text-align: center; line-height: 1.6; position: relative; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
          <!-- Logo no topo - sem borda -->
          <div style="display: flex; justify-content: center; margin-bottom: 30px;">
            <div style="width: 180px; height: 90px;">
              <img src="${CERTIFICATE_LOGO_URL}" alt="Viver de IA" style="width: 100%; height: 100%; object-fit: contain;" crossorigin="anonymous" />
            </div>
          </div>
          
          <!-- Conteúdo principal -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
            <h1 style="font-size: 56px; margin-bottom: 15px; font-weight: bold; color: white; text-shadow: 0 4px 8px rgba(0,0,0,0.2); letter-spacing: 2px;">CERTIFICADO</h1>
            <p style="font-size: 24px; margin-bottom: 40px; color: rgba(255,255,255,0.95); font-weight: 600;">de Implementação de Solução</p>
            
            <p style="font-size: 20px; margin-bottom: 25px; color: rgba(255,255,255,0.9); font-weight: 500;">Certificamos que</p>
            
            <div style="background: rgba(255,255,255,0.2); padding: 25px; border-radius: 16px; margin: 25px 0; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
              <h2 style="font-size: 32px; font-weight: bold; margin: 0; color: white; letter-spacing: 1px;">${userProfile.name}</h2>
            </div>
            
            <p style="font-size: 20px; margin: 25px 0; color: rgba(255,255,255,0.9); font-weight: 500;">concluiu com sucesso a implementação da solução</p>
            
            <div style="background: rgba(255,255,255,0.15); padding: 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.25); margin: 25px 0; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
              <h3 style="font-size: 26px; margin: 0; margin-bottom: 10px; color: white; font-weight: 600;">${certificate.solutions.title}</h3>
              <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 18px;">Categoria: ${certificate.solutions.category}</p>
            </div>
            
            <p style="font-size: 20px; margin: 25px 0; color: rgba(255,255,255,0.9); font-weight: 500;">em <span style="font-weight: 700; font-size: 24px;">${formattedDate}</span></p>
          </div>
          
          <!-- Footer com código de validação e assinatura -->
          <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 30px; margin-top: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: end; margin-bottom: 20px;">
              <!-- Código de validação -->
              <div style="text-align: left;">
                <p style="font-size: 14px; color: rgba(255,255,255,0.8); margin: 0; margin-bottom: 8px; font-weight: 500;">Código de Validação:</p>
                <p style="font-family: monospace; color: white; margin: 0; font-size: 16px; font-weight: 700; letter-spacing: 2px; background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 6px;">${certificate.validation_code}</p>
              </div>
              
              <!-- Assinatura -->
              <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                <div style="position: relative; margin-bottom: 12px;">
                  <p style="font-family: 'Dancing Script', cursive; font-size: 38px; margin: 0; color: white; transform: rotate(-1deg); text-shadow: 2px 2px 4px rgba(0,0,0,0.4); font-weight: 700; line-height: 1;">Rafael G Milagre</p>
                </div>
                <div style="width: 200px; height: 2px; background: rgba(255,255,255,0.4); margin-bottom: 12px;"></div>
                <p style="font-size: 14px; color: rgba(255,255,255,0.8); margin: 0; font-weight: 500;">Founder do Viver de IA</p>
              </div>
            </div>
            
            <div style="text-align: center; padding-top: 15px;">
              <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin: 0;">
                Emitido por <span style="color: white; font-weight: 700; font-size: 16px;">Viver de IA</span>
              </p>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Aguardar um pouco para garantir que as fontes carregaram
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Capturar como imagem
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true,
        foreignObjectRendering: true
      });

      // Gerar PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Criar blob URL e abrir em nova guia
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const newWindow = window.open(pdfUrl, '_blank');
      if (!newWindow) {
        toast.error('Pop-ups bloqueados. Permita pop-ups para abrir o certificado.');
      } else {
        toast.success('Certificado aberto em nova guia!');
      }

      // Remover elemento temporário
      document.body.removeChild(tempDiv);
      
      // Limpar URL após um tempo
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
      
    } catch (error) {
      console.error('Erro ao abrir certificado em nova guia:', error);
      toast.error('Erro ao abrir certificado. Tente novamente.');
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
        // Fallback para clipboard se o share falhar
        navigator.clipboard.writeText(shareText).then(() => {
          toast.success('Texto copiado para a área de transferência!');
        });
      });
    } else {
      // Fallback para navegadores que não suportam Web Share API
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
      
      {/* Certificado Visual */}
      <Card className="bg-gradient-to-br from-viverblue/20 via-viverblue-light/20 to-viverblue-lighter/20 border-viverblue/30 overflow-hidden">
        <CardContent className="p-10 relative" data-certificate-content>
          {/* Padrão decorativo de fundo */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}></div>
          </div>
          
          <div className="relative z-10 text-center space-y-8">
            {/* Logo no topo - tamanho aumentado e sem borda */}
            <div className="flex justify-center mb-8">
              <div className="w-64 h-32">
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
          onClick={handleOpenPDFInNewTab}
          variant="outline"
          className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
        >
          <ExternalLinkIcon className="h-4 w-4 mr-2" />
          Abrir PDF em Nova Guia
        </Button>
        
        <Button
          onClick={handleShare}
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
