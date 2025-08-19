
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
  const { user } = useAuth();
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  
  const certificateUrl = `${window.location.origin}/certificado/validar/${certificate.validation_code}`;
  // Detectar tipo e título do certificado
  const isSolution = certificate.type === 'solution' || (!certificate.type && certificate.solutions?.title);
  const certificateTitle = certificate.title || certificate.solutions?.title || 'Certificado';
  
  const shareText = isSolution 
    ? `🚀 NOVA CONQUISTA DESBLOQUEADA! 
    
🎯 Acabei de concluir com sucesso a implementação da solução "${certificateTitle}" na plataforma Viver de IA!

💡 Este certificado oficial comprova minha capacidade de aplicar Inteligência Artificial em projetos reais e resolver problemas complexos com soluções práticas.

🏆 Mais uma etapa vencida na minha jornada de especialização em IA!

👨‍💻 Quer também dominar as ferramentas de IA mais avançadas do mercado?

#InteligenciaArtificial #IA #MachineLearning #Inovacao #TechCareer #ViverDeIA #Certificacao #DesenvolvedorIA #FuturoDoTrabalho #TechSkills`
    : `🎓 CERTIFICADO CONQUISTADO!

📚 Finalizei com sucesso o curso "${certificateTitle}" na plataforma Viver de IA!

🚀 Mais conhecimentos práticos em Inteligência Artificial adquiridos e aplicados!

💪 Cada certificado é um passo a mais rumo ao domínio completo das tecnologias de IA que estão transformando o mercado.

🔥 A jornada continua! Próximo objetivo já definido.

👉 Se você também quer se destacar no mercado de IA, conheça a Viver de IA!

#EducacaoContinua #InteligenciaArtificial #AprendizadoIA #TechEducation #ViverDeIA #CarreiraEmTech #InovacaoDigital #FuturoDoTrabalho #SkillsIA #TechProfessional`;

  const handleShareLinkedIn = () => {
    const linkedInText = encodeURIComponent(shareText);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&summary=${linkedInText}`;
    
    // Analytics de compartilhamento (opcional - para métricas futuras)
    console.log("📊 [ANALYTICS] Compartilhamento LinkedIn iniciado:", {
      certificateId: certificate.id,
      type: isSolution ? 'solution' : 'course',
      title: certificateTitle
    });
    
    window.open(linkedInUrl, '_blank', 'width=700,height=500');
    toast.success("🚀 Abrindo LinkedIn! Compartilhe sua conquista com sua rede!");
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
        solutionTitle: certificateTitle,
        solutionCategory: isSolution ? 'Solução de IA' : 'Curso',
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
      <DropdownMenuContent align="end" className="w-80">{/* Aumentei a largura para mostrar melhor os textos */}
        <DropdownMenuItem onClick={handleShareLinkedIn} className="cursor-pointer">
          <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">Compartilhar no LinkedIn</span>
            <span className="text-xs text-muted-foreground">Mostre sua conquista para sua rede!</span>
          </div>
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
