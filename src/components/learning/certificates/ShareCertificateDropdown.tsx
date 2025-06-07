import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share2, MessageCircle, Mail, Linkedin, Twitter, Copy, Link } from "lucide-react";
import { toast } from "sonner";
import { useCertificateURL } from "@/hooks/useCertificateURL";

interface ShareCertificateDropdownProps {
  certificate: {
    id: string;
    validation_code: string;
    certificate_url?: string;
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
  userProfile,
}: ShareCertificateDropdownProps) => {
  const { transformCertificateURL } = useCertificateURL();
  
  // URL base para compartilhamento
  const getCurrentUrl = () => window.location.href;
  
  // URL do PDF ou página do certificado - OTIMIZADA
  const getShareableUrl = async (): Promise<string> => {
    if (certificate.certificate_url) {
      try {
        // NOVO: Usar URL otimizada para compartilhamento
        const optimizedUrl = await transformCertificateURL(certificate.certificate_url, {
          enableTracking: true,
          priority: 'normal' // Prioridade normal para compartilhamento
        });
        
        console.log('[ShareCertificate] URL otimizada para compartilhamento:', optimizedUrl);
        return optimizedUrl;
      } catch (error) {
        console.warn('[ShareCertificate] Erro ao otimizar URL, usando original:', error);
        return certificate.certificate_url;
      }
    }
    return getCurrentUrl();
  };

  // Texto padrão para compartilhamento
  const getShareText = async (platform: string = 'default'): Promise<string> => {
    const shareableUrl = await getShareableUrl();
    const baseText = `🎉 Acabei de receber meu certificado de implementação da solução "${certificate.solutions.title}" no Viver de IA!`;
    const validationText = `\n\nCódigo de validação: ${certificate.validation_code}`;
    
    switch (platform) {
      case 'whatsapp':
        return `${baseText}${validationText}\n\n#ViverDeIA #Certificado #IA\n\n${shareableUrl}`;
      
      case 'linkedin':
        return `${baseText}${validationText}\n\nCertificado oficial de implementação de solução de IA.\n\n#ViverDeIA #InteligenciaArtificial #Certificacao #IA #Implementacao\n\n${shareableUrl}`;
      
      case 'twitter':
        return `${baseText}${validationText}\n\n#ViverDeIA #Certificado #IA\n\n${shareableUrl}`;
      
      case 'email':
        return `${baseText}${validationText}\n\nConfira meu certificado oficial: ${shareableUrl}\n\nViver de IA - Implementação de Soluções de Inteligência Artificial`;
      
      default:
        return `${baseText}${validationText}\n\n#ViverDeIA #Certificado #IA\n\n${shareableUrl}`;
    }
  };

  // Compartilhar via WhatsApp - ATUALIZADO
  const shareWhatsApp = async () => {
    try {
      const text = encodeURIComponent(await getShareText('whatsapp'));
      const url = `https://wa.me/?text=${text}`;
      
      window.open(url, '_blank');
      toast.success('Abrindo WhatsApp para compartilhar!');
    } catch (error) {
      console.error('[ShareCertificate] Erro no WhatsApp:', error);
      const fallbackText = await getShareText('whatsapp');
      copyToClipboard(fallbackText);
    }
  };

  // Compartilhar via Email - ATUALIZADO
  const shareEmail = async () => {
    try {
      const subject = encodeURIComponent(`Certificado de Implementação - ${certificate.solutions.title}`);
      const body = encodeURIComponent(await getShareText('email'));
      const url = `mailto:?subject=${subject}&body=${body}`;
      
      window.location.href = url;
      toast.success('Abrindo cliente de email!');
    } catch (error) {
      console.error('[ShareCertificate] Erro no Email:', error);
      const fallbackText = await getShareText('email');
      copyToClipboard(fallbackText);
    }
  };

  // Compartilhar via LinkedIn - ATUALIZADO
  const shareLinkedIn = async () => {
    try {
      const shareableUrl = await getShareableUrl();
      const url = encodeURIComponent(shareableUrl);
      const text = encodeURIComponent(await getShareText('linkedin'));
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`;
      
      window.open(linkedinUrl, '_blank', 'width=600,height=600');
      toast.success('Abrindo LinkedIn para compartilhar!');
    } catch (error) {
      console.error('[ShareCertificate] Erro no LinkedIn:', error);
      const fallbackText = await getShareText('linkedin');
      copyToClipboard(fallbackText);
    }
  };

  // Compartilhar via Twitter/X - ATUALIZADO
  const shareTwitter = async () => {
    try {
      const text = encodeURIComponent(await getShareText('twitter'));
      const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
      
      window.open(twitterUrl, '_blank', 'width=600,height=600');
      toast.success('Abrindo Twitter/X para compartilhar!');
    } catch (error) {
      console.error('[ShareCertificate] Erro no Twitter:', error);
      const fallbackText = await getShareText('twitter');
      copyToClipboard(fallbackText);
    }
  };

  // Copiar link do certificado - ATUALIZADO
  const copyLink = async () => {
    try {
      const url = await getShareableUrl();
      copyToClipboard(url, 'Link do certificado copiado!');
    } catch (error) {
      console.error('[ShareCertificate] Erro ao copiar link:', error);
      copyToClipboard(getCurrentUrl(), 'Link da página copiado!');
    }
  };

  // Copiar texto completo - ATUALIZADO
  const copyText = async () => {
    try {
      const text = await getShareText();
      copyToClipboard(text, 'Texto do certificado copiado!');
    } catch (error) {
      console.error('[ShareCertificate] Erro ao copiar texto:', error);
      toast.error('Erro ao gerar texto para compartilhamento');
    }
  };

  // Função auxiliar para copiar para clipboard
  const copyToClipboard = (text: string, successMessage?: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast.success(successMessage || 'Texto copiado para a área de transferência!');
      }).catch(() => {
        // Fallback para navegadores mais antigos
        fallbackCopyToClipboard(text, successMessage);
      });
    } else {
      fallbackCopyToClipboard(text, successMessage);
    }
  };

  // Fallback para copiar texto em navegadores mais antigos
  const fallbackCopyToClipboard = (text: string, successMessage?: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      toast.success(successMessage || 'Texto copiado para a área de transferência!');
    } catch (err) {
      toast.error('Erro ao copiar texto. Tente selecionar e copiar manualmente.');
    } finally {
      document.body.removeChild(textArea);
    }
  };

  // Compartilhamento nativo (se disponível) - ATUALIZADO
  const shareNative = async () => {
    if (navigator.share) {
      try {
        const shareableUrl = await getShareableUrl();
        const shareText = await getShareText();
        
        await navigator.share({
          title: 'Meu Certificado de Implementação',
          text: shareText,
          url: shareableUrl
        });
        
        toast.success('Conteúdo compartilhado com sucesso!');
        return true;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('[ShareCertificate] Erro no compartilhamento nativo:', error);
          const fallbackText = await getShareText();
          copyToClipboard(fallbackText);
        }
        return false;
      }
    }
    return false;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
          onClick={(e) => {
            // Tentar compartilhamento nativo primeiro (mobile)
            if (navigator.share && !e.detail) {
              e.preventDefault();
              shareNative().then((success) => {
                if (!success) {
                  // Se falhar, o dropdown será aberto automaticamente
                }
              });
            }
            // Se não funcionar ou for desktop, abrir dropdown
          }}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-[#1A1E2E] border-neutral-600 text-white"
      >
        <DropdownMenuItem 
          onClick={shareWhatsApp}
          className="hover:bg-viverblue/20 focus:bg-viverblue/20 cursor-pointer"
        >
          <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={shareEmail}
          className="hover:bg-viverblue/20 focus:bg-viverblue/20 cursor-pointer"
        >
          <Mail className="h-4 w-4 mr-2 text-blue-500" />
          Email
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={shareLinkedIn}
          className="hover:bg-viverblue/20 focus:bg-viverblue/20 cursor-pointer"
        >
          <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
          LinkedIn
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={shareTwitter}
          className="hover:bg-viverblue/20 focus:bg-viverblue/20 cursor-pointer"
        >
          <Twitter className="h-4 w-4 mr-2 text-sky-500" />
          Twitter/X
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={copyLink}
          className="hover:bg-viverblue/20 focus:bg-viverblue/20 cursor-pointer"
        >
          <Link className="h-4 w-4 mr-2 text-purple-500" />
          Copiar Link
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={copyText}
          className="hover:bg-viverblue/20 focus:bg-viverblue/20 cursor-pointer"
        >
          <Copy className="h-4 w-4 mr-2 text-gray-400" />
          Copiar Texto
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
