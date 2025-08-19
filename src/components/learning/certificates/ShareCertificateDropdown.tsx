
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
import { useAuth } from "@/contexts/auth";

interface ShareCertificateDropdownProps {
  certificate: {
    id: string;
    validation_code: string;
    solutions: {
      title: string;
    };
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
  const { user } = useAuth();
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  
  const certificateUrl = `${window.location.origin}/certificado/validar/${certificate.validation_code}`;
  const shareText = `🎉 Acabei de conquistar um novo certificado no Viver de IA! 

🚀 Completei com sucesso a implementação da solução "${certificate.solutions.title}"

💡 Este certificado comprova minha capacidade de implementar soluções práticas de IA e aplicar conhecimentos avançados em projetos reais.

🔗 Confira meu certificado oficial:`;

  const handleShareLinkedIn = () => {
    const linkedInText = encodeURIComponent(shareText);
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&summary=${linkedInText}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(certificateUrl);
      toast.success("Link copiado para a área de transferência!");
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  const handleGeneratePublicPDF = async () => {
    setIsGeneratingLink(true);
    try {
      // Criar elemento temporário com o novo template estático
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
        solutionTitle: certificate.solutions.title,
        solutionCategory: 'Solução de IA',
        implementationDate: new Date().toLocaleDateString('pt-BR'),
        certificateId: certificate.id,
        validationCode: certificate.validation_code
      };

      const root = createRoot(tempDiv);
      
      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(StaticCertificateTemplate, {
            data: certificateData,
            onReady: async (element: HTMLElement) => {
              try {
                // Aguardar um pouco mais para garantir renderização completa
                await new Promise(r => setTimeout(r, 1000));
                
                const { pdfGenerator } = await import('@/utils/certificates/pdfGenerator');
                const blob = await pdfGenerator.generateFromElement(element, certificateData);
                
                // Upload para storage público
                const fileName = `certificado-publico-${certificate.validation_code}.pdf`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from('certificates')
                  .upload(`public/${fileName}`, blob, {
                    contentType: 'application/pdf',
                    upsert: true
                  });
                
                if (uploadError) throw uploadError;

                // Obter URL pública
                const { data: { publicUrl } } = supabase.storage
                  .from('certificates')
                  .getPublicUrl(`public/${fileName}`);
                
                // Copiar link
                await navigator.clipboard.writeText(publicUrl);
                toast.success("Link público do PDF gerado e copiado!");
                
                resolve();
              } catch (error) {
                console.error('Erro ao gerar PDF:', error);
                toast.error('Erro ao gerar link público do PDF');
                resolve();
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
      toast.error('Erro ao gerar link público do PDF');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={compact ? "ghost" : "outline"}
          size={compact ? "icon" : undefined}
          className={compact ? "text-muted-foreground hover:bg-accent/20" : "border-primary/50 text-primary hover:bg-primary/10"}
        >
          <Share2 className={compact ? "h-4 w-4" : "h-4 w-4 mr-2"} />
          {!compact && "Compartilhar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={handleShareLinkedIn}>
          <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
          Compartilhar no LinkedIn
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copiar link do certificado
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleGeneratePublicPDF} disabled={isGeneratingLink}>
          <Link className="h-4 w-4 mr-2" />
          {isGeneratingLink ? "Gerando..." : "Gerar link público do PDF"}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => window.open(certificateUrl, '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir página de validação
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
