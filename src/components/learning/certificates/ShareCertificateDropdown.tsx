import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Share2, Linkedin, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getCourseCapacitationDescription } from "@/utils/certificates/courseCapacitationUtils";

interface ShareCertificateDropdownProps {
  certificate: {
    id: string;
    validation_code: string;
    solutions?: {
      title: string;
    };
    title?: string;
    type?: 'course' | 'solution';
  };
  userProfile: {
    name: string;
  };
  compact?: boolean;
}

export const ShareCertificateDropdown = ({ 
  certificate, 
  userProfile,
  compact = false
}: ShareCertificateDropdownProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const certificateUrl = `https://app.viverdeia.ai/certificado/validar/${certificate.validation_code}`;
  
  // Detectar tipo e título do certificado
  const isSolution = certificate.type === 'solution' || (!certificate.type && certificate.solutions?.title);
  const certificateTitle = certificate.title || certificate.solutions?.title || 'Certificado';
  
  const shareText = `Estou certificado ${isSolution ? 'na solução' : 'no curso'} "${certificateTitle}" do VIVER DE IA! 🎓

Confira meu certificado:`;

  const generatePublicPDF = async (): Promise<string | null> => {
    try {
      // Criar elemento temporário com o template estático
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      // Usar React para renderizar o componente
      const { createRoot } = await import('react-dom/client');
      const { StaticCertificateTemplate } = await import('@/components/certificates/StaticCertificateTemplate');
      
      const certificateData = {
        userName: userProfile.name,
        solutionTitle: certificateTitle,
        solutionCategory: getCourseCapacitationDescription({
          title: certificateTitle,
          type: certificate.type || (isSolution ? 'solution' : 'course')
        }),
        implementationDate: new Date().toLocaleDateString('pt-BR'),
        certificateId: certificate.id,
        validationCode: certificate.validation_code
      };

      const root = createRoot(tempDiv);
      
      return new Promise<string | null>((resolve) => {
        root.render(
          React.createElement(StaticCertificateTemplate, {
            data: certificateData,
            onReady: async (element: HTMLElement) => {
              try {
                // Aguardar renderização completa
                await new Promise(r => setTimeout(r, 1000));
                
                const { pdfGenerator } = await import('@/utils/certificates/pdfGenerator');
                const blob = await pdfGenerator.generateFromElement(element, certificateData);
                
                // Upload para storage público
                const fileName = `certificado-${certificate.validation_code}.pdf`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from('certificates')
                  .upload(`public/${fileName}`, blob, {
                    contentType: 'application/pdf',
                    upsert: true
                  });
                
                if (uploadError) {
                  console.error('Erro no upload:', uploadError);
                  resolve(null);
                  return;
                }

                // Obter URL pública
                const { data: { publicUrl } } = supabase.storage
                  .from('certificates')
                  .getPublicUrl(`public/${fileName}`);
                
                resolve(publicUrl);
                
              } catch (error) {
                console.error('Erro ao gerar PDF:', error);
                resolve(null);
              } finally {
                // Cleanup
                root.unmount();
                document.body.removeChild(tempDiv);
              }
            }
          })
        );
      });
      
    } catch (error: any) {
      console.error('Erro ao gerar PDF público:', error);
      return null;
    }
  };

  const handleShareLinkedIn = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdfUrl = await generatePublicPDF();
      
      if (pdfUrl) {
        // Converter URL do Supabase para usar o proxy (teste com domínio Supabase primeiro)
        const customDomainUrl = pdfUrl.replace(
          /https:\/\/([^.]+\.supabase\.co)\/storage\/v1\/object\/public\/([^\/]+)\/(.*)/,
          'https://$1/functions/v1/storage-proxy/certificate/$2/$3'
        );
        
        const linkedInText = encodeURIComponent(shareText);
        const linkedInTitle = encodeURIComponent(`Novo Certificado ${isSolution ? 'de Solução' : 'de Curso'} - VIVER DE IA`);
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(customDomainUrl)}&title=${linkedInTitle}&summary=${linkedInText}&source=${encodeURIComponent('VIVER DE IA')}`;
        
        window.open(linkedInUrl, '_blank', 'width=700,height=500');
        toast.success("🚀 Abrindo LinkedIn para compartilhar seu certificado!");
      } else {
        toast.error("Erro ao gerar PDF do certificado");
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error("Erro ao gerar link para compartilhamento");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShareWhatsApp = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdfUrl = await generatePublicPDF();
      
      if (pdfUrl) {
        // Converter URL do Supabase para usar o proxy (teste com domínio Supabase primeiro)
        const customDomainUrl = pdfUrl.replace(
          /https:\/\/([^.]+\.supabase\.co)\/storage\/v1\/object\/public\/([^\/]+)\/(.*)/,
          'https://$1/functions/v1/storage-proxy/certificate/$2/$3'
        );
        
        const whatsappText = `*Novo Certificado VIVER DE IA!*

Acabei de me certificar ${isSolution ? 'na solução' : 'no curso'} *"${certificateTitle}"*!

Confira meu certificado: ${customDomainUrl}`;
        
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        window.open(whatsappUrl, '_blank');
        toast.success("📱 Abrindo WhatsApp para compartilhar seu certificado!");
      } else {
        toast.error("Erro ao gerar PDF do certificado");
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error); 
      toast.error("Erro ao gerar link para compartilhamento");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(certificateUrl);
      toast.success("Link copiado para a área de transferência!");
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={compact ? "ghost" : "outline"}
          size={compact ? "icon" : undefined}
          className={compact ? "text-muted-foreground hover:bg-accent/20 z-20 relative" : "border-primary/50 text-primary hover:bg-primary/10"}
          disabled={isGeneratingPDF}
        >
          <Share2 className={compact ? "h-4 w-4" : "h-4 w-4 mr-2"} />
          {!compact && (isGeneratingPDF ? "Gerando..." : "Compartilhar")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem 
          onClick={handleShareLinkedIn} 
          disabled={isGeneratingPDF}
          className="cursor-pointer bg-operational/10 border-operational/20 text-operational mb-2 hover:bg-operational/20"
        >
          <Linkedin className="h-4 w-4 mr-2 text-operational" />
          <div className="flex flex-col flex-1">
            <span className="font-medium">
              {isGeneratingPDF ? "Gerando PDF..." : "Compartilhar no LinkedIn"}
            </span>
            <span className="text-xs text-operational">
              Com link direto do certificado em PDF
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleShareWhatsApp} 
          disabled={isGeneratingPDF}
          className="cursor-pointer bg-system-healthy/10 border-system-healthy/20 text-system-healthy mb-2 hover:bg-system-healthy/20"
        >
          <MessageCircle className="h-4 w-4 mr-2 text-system-healthy" />
          <div className="flex flex-col flex-1">
            <span className="font-medium">
              {isGeneratingPDF ? "Gerando PDF..." : "Compartilhar no WhatsApp"}
            </span>
            <span className="text-xs text-system-healthy">
              Com link direto do certificado em PDF
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copiar link de validação
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => window.open(certificateUrl, '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir página de validação
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};