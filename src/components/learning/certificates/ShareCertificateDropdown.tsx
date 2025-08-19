import React from "react";
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
  const certificateUrl = `https://app.viverdeia.ai/certificado/validar/${certificate.validation_code}`;
  
  // Detectar tipo e título do certificado
  const isSolution = certificate.type === 'solution' || (!certificate.type && certificate.solutions?.title);
  const certificateTitle = certificate.title || certificate.solutions?.title || 'Certificado';
  
  const shareText = `Estou certificado ${isSolution ? 'na solução' : 'no curso'} "${certificateTitle}" do VIVER DE IA! 🎓

Confira meu certificado:`;

  const handleShareLinkedIn = async () => {
    // Compartilhar no LinkedIn com o link bonito do domínio
    const linkedInText = encodeURIComponent(shareText);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&summary=${linkedInText}`;
    
    window.open(linkedInUrl, '_blank', 'width=700,height=500');
    toast.success("🚀 Abrindo LinkedIn para compartilhar seu certificado!");
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
        >
          <Share2 className={compact ? "h-4 w-4" : "h-4 w-4 mr-2"} />
          {!compact && "Compartilhar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem 
          onClick={handleShareLinkedIn} 
          className="cursor-pointer"
        >
          <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">Compartilhar no LinkedIn</span>
            <span className="text-xs text-muted-foreground">
              Com link do certificado
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