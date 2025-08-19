
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
}

export const ShareCertificateDropdown = ({ 
  certificate, 
  userProfile 
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
      // Usar o novo sistema de PDF
      const { pdfGenerator } = await import('@/utils/certificates/pdfGenerator');
      const { templateEngine } = await import('@/utils/certificates/templateEngine');
      
      const template = templateEngine.generateDefaultTemplate();
      const certificateData = {
        userName: userProfile.name,
        solutionTitle: certificate.solutions.title,
        solutionCategory: 'Solução de IA',
        implementationDate: new Date().toLocaleDateString('pt-BR'),
        certificateId: certificate.id,
        validationCode: certificate.validation_code
      };

      // Processar template
      const html = templateEngine.processTemplate(template, certificateData);
      const css = templateEngine.optimizeCSS(template.css_styles);

      // Criar elemento temporário
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `<style>${css}</style>${html}`;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 500));

      const certificateElement = tempDiv.querySelector('.certificate-container') as HTMLElement;
      if (certificateElement) {
        const blob = await pdfGenerator.generateFromElement(certificateElement, certificateData);
        
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
      }

      document.body.removeChild(tempDiv);
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
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
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
