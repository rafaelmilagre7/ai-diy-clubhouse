import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SocialShareButtonsProps {
  certificate: any;
}

export const SocialShareButtons = ({ certificate }: SocialShareButtonsProps) => {
  console.log("🔍 [SocialShareButtons] Certificate data:", certificate);
  
  const courseName = certificate?.learning_courses?.title || certificate?.solutions?.title || "Curso";
  const validationCode = certificate?.validation_code;
  
  console.log("📊 [SocialShareButtons] Dados extraídos:", { courseName, validationCode });
  
  const shareText = `🎉 Acabei de conquistar meu certificado do curso "${courseName}" na Viver de IA! 
  
🚀 Mais um passo na minha jornada em Inteligência Artificial
🎓 Certificado validado: ${validationCode}
  
#ViverdoIA #InteligenciaArtificial #Certificado #Conquista`;

  const shareUrl = `https://viverdeia.ai/validar/${validationCode}`;

  console.log("🔗 [SocialShareButtons] URL de compartilhamento:", shareUrl);
  console.log("📝 [SocialShareButtons] Texto de compartilhamento:", shareText);

  const handleLinkedInShare = () => {
    console.log("📘 [LinkedIn] Iniciando compartilhamento...");
    try {
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('Novo Certificado Conquistado!')}&summary=${encodeURIComponent(shareText)}`;
      console.log("📘 [LinkedIn] URL gerada:", linkedInUrl);
      window.open(linkedInUrl, '_blank', 'width=600,height=600');
      toast.success("Abrindo LinkedIn para compartilhamento!");
    } catch (error) {
      console.error("❌ [LinkedIn] Erro:", error);
      toast.error("Erro ao abrir LinkedIn");
    }
  };

  const handleTwitterShare = () => {
    console.log("🐦 [Twitter] Iniciando compartilhamento...");
    try {
      const twitterText = shareText.substring(0, 280); // Twitter character limit
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`;
      console.log("🐦 [Twitter] URL gerada:", twitterUrl);
      window.open(twitterUrl, '_blank', 'width=600,height=400');
      toast.success("Abrindo X (Twitter) para compartilhamento!");
    } catch (error) {
      console.error("❌ [Twitter] Erro:", error);
      toast.error("Erro ao abrir X (Twitter)");
    }
  };

  const handleWhatsAppShare = () => {
    console.log("💬 [WhatsApp] Iniciando compartilhamento...");
    try {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
      console.log("💬 [WhatsApp] URL gerada:", whatsappUrl);
      window.open(whatsappUrl, '_blank');
      toast.success("Abrindo WhatsApp para compartilhamento!");
    } catch (error) {
      console.error("❌ [WhatsApp] Erro:", error);
      toast.error("Erro ao abrir WhatsApp");
    }
  };

  const handleCopyLink = async () => {
    console.log("📋 [Copy Link] Copiando link...");
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API não disponível");
      }
      await navigator.clipboard.writeText(shareUrl);
      console.log("✅ [Copy Link] Link copiado:", shareUrl);
      toast.success("Link copiado para área de transferência!");
    } catch (error) {
      console.error("❌ [Copy Link] Erro:", error);
      // Fallback para browsers mais antigos
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Link copiado para área de transferência!");
      } catch (fallbackError) {
        console.error("❌ [Copy Link] Fallback falhou:", fallbackError);
        toast.error("Erro ao copiar link. Tente copiar manualmente.");
      }
    }
  };

  const handleCopyText = async () => {
    console.log("📋 [Copy Text] Copiando texto...");
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API não disponível");
      }
      await navigator.clipboard.writeText(shareText);
      console.log("✅ [Copy Text] Texto copiado");
      toast.success("Texto copiado para área de transferência!");
    } catch (error) {
      console.error("❌ [Copy Text] Erro:", error);
      // Fallback para browsers mais antigos
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Texto copiado para área de transferência!");
      } catch (fallbackError) {
        console.error("❌ [Copy Text] Fallback falhou:", fallbackError);
        toast.error("Erro ao copiar texto. Tente copiar manualmente.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          🎉 Compartilhe sua conquista!
        </h3>
        <p className="text-sm text-muted-foreground">
          Mostre para o mundo que você conquistou mais um certificado
        </p>
      </div>

      {/* Redes Sociais */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Compartilhar nas redes sociais
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleLinkedInShare}
            className="justify-start h-12 bg-[#0077B5] hover:bg-[#005885] text-white border-0 transition-all duration-200 hover:scale-105"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </Button>

          <Button
            onClick={handleTwitterShare}
            className="justify-start h-12 bg-black hover:bg-gray-800 text-white border-0 transition-all duration-200 hover:scale-105"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X (Twitter)
          </Button>

          <Button
            onClick={handleWhatsAppShare}
            className="justify-start h-12 bg-[#25D366] hover:bg-[#1DA851] text-white border-0 transition-all duration-200 hover:scale-105"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Ações rápidas
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="justify-start h-10 hover:bg-muted/50 transition-all duration-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Copiar link de validação
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyText}
            className="justify-start h-10 hover:bg-muted/50 transition-all duration-200"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar texto promocional
          </Button>
        </div>
      </div>

      {/* Link de Validação */}
      <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Link de validação do certificado
          </label>
          <div className="flex items-center gap-2 p-2 bg-background rounded border">
            <code className="text-xs font-mono text-foreground flex-1 truncate">
              {shareUrl}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyLink}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};