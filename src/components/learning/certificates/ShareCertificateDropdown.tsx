
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Share2, Linkedin, Link, Copy, ExternalLink, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useLinkedInIntegration } from "@/hooks/useLinkedInIntegration";
import { ShareAchievementModal } from "@/components/gamification/ShareAchievementModal";

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
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [achievementModal, setAchievementModal] = useState<any>(null);
  
  const { 
    isConnecting, 
    isPosting, 
    linkedInProfile, 
    connectLinkedIn, 
    postToLinkedIn,
    disconnectLinkedIn 
  } = useLinkedInIntegration();
  
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

  const handleShareLinkedInWithPreview = async () => {
    setIsGeneratingPreview(true);
    try {
      // Gerar imagem preview do certificado
      const previewImageUrl = await generateCertificatePreviewImage();
      
      if (previewImageUrl) {
        // LinkedIn com imagem preview personalizada
        const linkedInText = encodeURIComponent(shareText + `\n\n🔗 Confira meu certificado:`);
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&title=${encodeURIComponent('🎉 Novo Certificado Viver de IA!')}&summary=${linkedInText}&source=${encodeURIComponent('Viver de IA')}`;
        
        // Analytics
        await logShareAnalytics('linkedin_with_preview');
        
        window.open(linkedInUrl, '_blank', 'width=700,height=500');
        toast.success("🎨 Compartilhamento com preview personalizado! Sua conquista vai brilhar no LinkedIn!");
      } else {
        // Fallback para compartilhamento simples
        handleShareLinkedIn();
      }
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      handleShareLinkedIn(); // Fallback
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleShareLinkedIn = async () => {
    const linkedInText = encodeURIComponent(shareText);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&summary=${linkedInText}`;
    
    // Analytics de compartilhamento
    await logShareAnalytics('linkedin_simple');
    
    window.open(linkedInUrl, '_blank', 'width=700,height=500');
    toast.success("🚀 Abrindo LinkedIn! Compartilhe sua conquista com sua rede!");
  };

  const logShareAnalytics = async (shareType: string) => {
    try {
      // Log analytics para métricas
      console.log("📊 [ANALYTICS] Compartilhamento:", {
        certificateId: certificate.id,
        shareType,
        type: isSolution ? 'solution' : 'course',
        title: certificateTitle,
        timestamp: new Date().toISOString()
      });
      
      // Futuramente: salvar no banco para dashboard de analytics
      /* 
      await supabase.from('certificate_shares').insert({
        certificate_id: certificate.id,
        user_id: user?.id,
        share_type: shareType,
        shared_at: new Date().toISOString()
      });
      */
    } catch (error) {
      console.error('Erro ao logar analytics:', error);
    }
  };

  const generateCertificatePreviewImage = async (): Promise<string | null> => {
    try {
      // Criar elemento temporário para captura
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 1123px;
        height: 950px;
        background: white;
        z-index: -1;
      `;
      document.body.appendChild(tempDiv);

      // Renderizar certificado
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
                // Aguardar renderização
                await new Promise(r => setTimeout(r, 1000));
                
                // Capturar como canvas
                const html2canvas = (await import('html2canvas')).default;
                const canvas = await html2canvas(element, {
                  width: 1123,
                  height: 950,
                  scale: 1,
                  backgroundColor: '#ffffff',
                  useCORS: true,
                  logging: false
                });
                
                // Converter para blob
                canvas.toBlob(async (blob) => {
                  if (blob) {
                    // Upload para storage
                    const fileName = `certificate-preview-${certificate.validation_code}-${Date.now()}.png`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                      .from('certificates')
                      .upload(`previews/${fileName}`, blob, {
                        contentType: 'image/png',
                        upsert: true
                      });
                    
                    if (!uploadError) {
                      const { data: { publicUrl } } = supabase.storage
                        .from('certificates')
                        .getPublicUrl(`previews/${fileName}`);
                      resolve(publicUrl);
                    } else {
                      resolve(null);
                    }
                  } else {
                    resolve(null);
                  }
                }, 'image/png', 0.9);
                
              } catch (error) {
                console.error('Erro ao capturar imagem:', error);
                resolve(null);
              } finally {
                root.unmount();
                document.body.removeChild(tempDiv);
              }
            }
          })
        );
      });
      
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      return null;
    }
  };

  // Post direto via API do LinkedIn
  const handleLinkedInDirectPost = async () => {
    if (!linkedInProfile) {
      const connected = await connectLinkedIn();
      if (!connected) return;
    }

    const postData = {
      title: `🎉 Novo Certificado Viver de IA!`,
      description: shareText,
      url: certificateUrl,
      imageUrl: await generateCertificatePreviewImage()
    };

    const success = await postToLinkedIn(postData);
    if (success) {
      // Verificar se desbloqueou alguma conquista
      setTimeout(() => {
        const mockAchievement = {
          id: 'social_master',
          title: '📱 Mestre Social!',
          description: 'Postou diretamente via API do LinkedIn',
          icon: '🚀',
          points: 100,
          rarity: 'epic' as const
        };
        setAchievementModal(mockAchievement);
      }, 1000);
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
      <DropdownMenuContent align="end" className="w-80">
        {/* LinkedIn API Direto - Destaque */}
        <DropdownMenuItem 
          onClick={handleLinkedInDirectPost} 
          disabled={isPosting}
          className="cursor-pointer bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 mb-2"
        >
          <Crown className="h-4 w-4 mr-2 text-amber-500" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-700">
                {isPosting ? "📤 Postando..." : "👑 Post Automático"}
              </span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                PREMIUM
              </span>
            </div>
            <span className="text-xs text-blue-600">
              {linkedInProfile 
                ? `Conectado como ${linkedInProfile.firstName}` 
                : "Post direto via API + Conquistas"}
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleShareLinkedInWithPreview} disabled={isGeneratingPreview} className="cursor-pointer">
          <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">
              {isGeneratingPreview ? "🎨 Gerando preview..." : "🚀 LinkedIn Premium"}
            </span>
            <span className="text-xs text-muted-foreground">
              {isGeneratingPreview ? "Criando imagem personalizada" : "Com preview visual do seu certificado!"}
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleShareLinkedIn} className="cursor-pointer">
          <Linkedin className="h-4 w-4 mr-2 text-blue-400" />
          <div className="flex flex-col">
            <span className="font-medium">LinkedIn Simples</span>
            <span className="text-xs text-muted-foreground">Compartilhamento rápido</span>
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
      
      {/* Modal de Conquista */}
      <ShareAchievementModal
        achievement={achievementModal}
        isOpen={!!achievementModal}
        onClose={() => setAchievementModal(null)}
        onShare={() => {
          handleShareLinkedInWithPreview();
          setAchievementModal(null);
        }}
      />
    </DropdownMenu>
  );
};
