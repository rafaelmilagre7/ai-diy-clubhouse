import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Share2, Linkedin, Link, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  
  const certificateUrl = `${window.location.origin}/certificado/validar/${certificate.validation_code}`;
  
  // Detectar tipo e título do certificado
  const isSolution = certificate.type === 'solution' || (!certificate.type && certificate.solutions?.title);
  const certificateTitle = certificate.title || certificate.solutions?.title || 'Certificado';
  
  const shareText = `Estou certificado ${isSolution ? 'na solução' : 'no curso'} "${certificateTitle}" do VIVER DE IA! 🎓

Confira meu certificado:`;

  const handleShareLinkedIn = async () => {
    // Primeiro gerar o PDF público
    setIsGeneratingLink(true);
    try {
      const pdfUrl = await generatePublicPDF();
      
      if (pdfUrl) {
        // Compartilhar no LinkedIn com o link do PDF
        const linkedInText = encodeURIComponent(shareText);
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pdfUrl)}&summary=${linkedInText}`;
        
        window.open(linkedInUrl, '_blank', 'width=700,height=500');
        toast.success("🚀 Abrindo LinkedIn para compartilhar seu certificado!");
      } else {
        toast.error("Erro ao gerar PDF do certificado");
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error("Erro ao gerar link para compartilhamento");
    } finally {
      setIsGeneratingLink(false);
    }
  };

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
        solutionCategory: isSolution ? 'Solução de IA' : 'Curso',
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
          disabled={isGeneratingLink}
        >
          <Share2 className={compact ? "h-4 w-4" : "h-4 w-4 mr-2"} />
          {!compact && (isGeneratingLink ? "Gerando..." : "Compartilhar")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem 
          onClick={handleShareLinkedIn} 
          disabled={isGeneratingLink}
          className="cursor-pointer"
        >
          <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">
              {isGeneratingLink ? "Gerando PDF..." : "Compartilhar no LinkedIn"}
            </span>
            <span className="text-xs text-muted-foreground">
              Com link do certificado em PDF
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