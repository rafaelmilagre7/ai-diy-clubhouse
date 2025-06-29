
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Copy, Facebook, Twitter, Linkedin } from "lucide-react";
import { toast } from "sonner";

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
  const certificateUrl = `${window.location.origin}/certificado/validar/${certificate.validation_code}`;
  const shareText = `🎉 Acabei de completar a implementação da solução "${certificate.solutions.title}" no Viver de IA! Confira meu certificado:`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(certificateUrl);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(certificateUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copiar link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareFacebook}>
          <Facebook className="h-4 w-4 mr-2" />
          Compartilhar no Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareTwitter}>
          <Twitter className="h-4 w-4 mr-2" />
          Compartilhar no Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareLinkedIn}>
          <Linkedin className="h-4 w-4 mr-2" />
          Compartilhar no LinkedIn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
