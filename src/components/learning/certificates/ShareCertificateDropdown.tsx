
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
  
  // URL base para compartilhamento
  const getCurrentUrl = () => window.location.href;
  
  // URL do PDF ou página do certificado
  const getShareableUrl = () => {
    if (certificate.certificate_url) {
      return certificate.certificate_url;
    }
    return getCurrentUrl();
  };

  // Texto padrão para compartilhamento
  const getShareText = (platform: string = 'default') => {
    const baseText = `🎉 Acabei de receber meu certificado de implementação da solução "${certificate.solutions.title}" no Viver de IA!`;
    const validationText = `\n\nCódigo de validação: ${certificate.validation_code}`;
    
    switch (platform) {
      case 'whatsapp':
        return `${baseText}${validationText}\n\n#ViverDeIA #Certificado #IA\n\n${getShareableUrl()}`;
      
      case 'linkedin':
        return `${baseText}${validationText}\n\nCertificado oficial de implementação de solução de IA.\n\n#ViverDeIA #InteligenciaArtificial #Certificacao #IA #Implementacao\n\n${getShareableUrl()}`;
      
      case 'twitter':
        return `${baseText}${validationText}\n\n#ViverDeIA #Certificado #IA\n\n${getShareableUrl()}`;
      
      case 'email':
        return `${baseText}${validationText}\n\nConfira meu certificado oficial: ${getShareableUrl()}\n\nViver de IA - Implementação de Soluções de Inteligência Artificial`;
      
      default:
        return `${baseText}${validationText}\n\n#ViverDeIA #Certificado #IA\n\n${getShareableUrl()}`;
    }
  };

  // Compartilhar via WhatsApp
  const shareWhatsApp = () => {
    const text = encodeURIComponent(getShareText('whatsapp'));
    const url = `https://wa.me/?text=${text}`;
    
    // Tentar abrir WhatsApp Web ou app
    try {
      window.open(url, '_blank');
      toast.success('Abrindo WhatsApp para compartilhar!');
    } catch (error) {
      // Fallback: copiar texto
      copyToClipboard(getShareText('whatsapp'));
    }
  };

  // Compartilhar via Email
  const shareEmail = () => {
    const subject = encodeURIComponent(`Certificado de Implementação - ${certificate.solutions.title}`);
    const body = encodeURIComponent(getShareText('email'));
    const url = `mailto:?subject=${subject}&body=${body}`;
    
    try {
      window.location.href = url;
      toast.success('Abrindo cliente de email!');
    } catch (error) {
      // Fallback: copiar texto
      copyToClipboard(getShareText('email'));
    }
  };

  // Compartilhar via LinkedIn
  const shareLinkedIn = () => {
    const url = encodeURIComponent(getShareableUrl());
    const text = encodeURIComponent(getShareText('linkedin'));
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`;
    
    try {
      window.open(linkedinUrl, '_blank', 'width=600,height=600');
      toast.success('Abrindo LinkedIn para compartilhar!');
    } catch (error) {
      // Fallback: copiar texto
      copyToClipboard(getShareText('linkedin'));
    }
  };

  // Compartilhar via Twitter/X
  const shareTwitter = () => {
    const text = encodeURIComponent(getShareText('twitter'));
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    
    try {
      window.open(twitterUrl, '_blank', 'width=600,height=600');
      toast.success('Abrindo Twitter/X para compartilhar!');
    } catch (error) {
      // Fallback: copiar texto
      copyToClipboard(getShareText('twitter'));
    }
  };

  // Copiar link do certificado
  const copyLink = () => {
    const url = getShareableUrl();
    copyToClipboard(url, 'Link do certificado copiado!');
  };

  // Copiar texto completo
  const copyText = () => {
    copyToClipboard(getShareText(), 'Texto do certificado copiado!');
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

  // Compartilhamento nativo (se disponível)
  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Meu Certificado de Implementação',
        text: getShareText(),
        url: getShareableUrl()
      }).then(() => {
        toast.success('Conteúdo compartilhado com sucesso!');
      }).catch((error) => {
        if (error.name !== 'AbortError') {
          // Se não foi cancelado pelo usuário, usar fallback
          copyToClipboard(getShareText());
        }
      });
    } else {
      // Se não tem API nativa, abrir o dropdown
      return false;
    }
    return true;
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
              if (shareNative()) {
                return;
              }
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
