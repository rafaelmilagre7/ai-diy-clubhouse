import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Star, BookOpen, Award, Eye, Lightbulb, BadgeCheck, Linkedin, MessageCircle } from "lucide-react";
import { UnifiedCertificate } from "@/hooks/learning/useUnifiedCertificates";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UnifiedCertificateViewer } from "@/components/certificates/UnifiedCertificateViewer";
import { CertificateData } from "@/utils/certificates/templateEngine";
import { useAuth } from "@/contexts/auth";
import { ShareCertificateDropdown } from "./ShareCertificateDropdown";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface UnifiedCertificateCardProps {
  certificate: UnifiedCertificate;
  onDownload: (certificateId: string) => void;
}

export const UnifiedCertificateCard = ({
  certificate,
  onDownload
}: UnifiedCertificateCardProps) => {
  const { user } = useAuth();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const isSolution = certificate.type === 'solution';
  const formattedDate = format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const config = isSolution ? {
    icon: Lightbulb,
    typeLabel: "Solução",
    headerBg: "from-accent/10 to-transparent",
    badgeClass: "bg-accent/15 text-accent border-accent/30",
    iconColor: "text-accent",
    iconBg: "bg-accent/15",
    codeBoxClass: "bg-accent/10 border-accent/20",
    codeLabelColor: "text-accent"
  } : {
    icon: Award,
    typeLabel: "Curso",
    headerBg: "from-primary/10 to-transparent",
    badgeClass: "bg-primary/15 text-primary border-primary/30",
    iconColor: "text-primary",
    iconBg: "bg-primary/15",
    codeBoxClass: "bg-primary/10 border-primary/20",
    codeLabelColor: "text-primary"
  };
  
  const handleDownload = () => {
    onDownload(certificate.id);
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
        userName: user?.user_metadata?.full_name || user?.email || "Usuário",
        solutionTitle: certificate.title,
        solutionCategory: isSolution ? 'Solução de IA' : 'Curso',
        implementationDate: formattedDate,
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

  const handleShareLinkedIn = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdfUrl = await generatePublicPDF();
      
      if (pdfUrl) {
        const shareText = `Estou certificado ${isSolution ? 'na solução' : 'no curso'} "${certificate.title}" do VIVER DE IA! 🎓

Confira meu certificado:`;
        const linkedInText = encodeURIComponent(shareText);
        const linkedInTitle = encodeURIComponent(`Novo Certificado ${isSolution ? 'de Solução' : 'de Curso'} - VIVER DE IA`);
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pdfUrl)}&title=${linkedInTitle}&summary=${linkedInText}&source=${encodeURIComponent('VIVER DE IA')}`;
        
        window.open(linkedInUrl, '_blank', 'width=700,height=500');
        toast.success("🚀 Abrindo LinkedIn para compartilhar seu certificado!");
      } else {
        toast.error("Erro ao gerar PDF do certificado");
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error("Erro ao gerar link para compartilhamento");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShareWhatsApp = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdfUrl = await generatePublicPDF();
      
      if (pdfUrl) {
        const shareText = `*Novo Certificado VIVER DE IA!*

Acabei de me certificar ${isSolution ? 'na solução' : 'no curso'} *"${certificate.title}"*!

Confira meu certificado: ${pdfUrl}`;
        
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
        toast.success("📱 Abrindo WhatsApp para compartilhar seu certificado!");
      } else {
        toast.error("Erro ao gerar PDF do certificado");
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error); 
      toast.error("Erro ao gerar link para compartilhamento");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  const coverImage = certificate.image_url || certificate.learning_courses?.cover_image_url || certificate.solutions?.thumbnail_url;

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/20 hover:shadow-xl transition-all duration-300 animate-fade-in">
      {/* Capa visual */}
      <div className="relative h-48 overflow-hidden">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={certificate.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${isSolution ? 'from-accent/20 via-accent/10 to-accent/5' : 'from-primary/20 via-primary/10 to-primary/5'} flex items-center justify-center`}>
            <div className={`p-8 rounded-full ${config.iconBg} shadow-lg`}>
              <config.icon className={`h-16 w-16 ${config.iconColor}`} />
            </div>
          </div>
        )}
        
        {/* Overlay com badge do tipo */}
        <div className="absolute top-4 left-4">
          <Badge className={`${config.badgeClass} text-xs font-medium shadow-lg backdrop-blur-sm`}>
            {isSolution ? <Lightbulb className="h-3 w-3 mr-1" /> : <BookOpen className="h-3 w-3 mr-1" />}
            {config.typeLabel}
          </Badge>
        </div>

        {/* Share button no canto */}
        <div className="absolute top-4 right-4 z-30">
            <ShareCertificateDropdown
              certificate={{
                id: certificate.id,
                validation_code: certificate.validation_code,
                solutions: {
                  title: certificate.title
                },
                title: certificate.title,
                type: certificate.type
              }}
              userProfile={{
                name: user?.user_metadata?.full_name || user?.email || "Usuário"
              }}
              compact
            />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      <CardContent className="p-6 -mt-8 relative z-10">
        <div className="space-y-4">
          {/* Header com título */}
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {certificate.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">Certificado de {isSolution ? 'Implementação' : 'Conclusão'}</span>
            </div>
          </div>
          
          {/* Data de emissão */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary/60" />
            <span>Emitido em {formattedDate}</span>
          </div>
          
          {/* Código de validação */}
          <div className="bg-gradient-to-r from-muted/80 to-muted/40 rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Star className="h-3 w-3 text-amber-500" />
                  Código de Validação
                </div>
                <div className="text-sm font-mono text-foreground bg-background/50 px-2 py-1 rounded border">
                  {certificate.validation_code}
                </div>
              </div>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="flex-1 text-sm hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl w-full max-h-[85vh] certificate-dialog">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl font-bold text-foreground">
                      {`Certificado de ${isSolution ? 'Implementação' : 'Conclusão'}`}
                    </DialogTitle>
                    
                    {/* Botões de compartilhamento */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleShareLinkedIn}
                        disabled={isGeneratingPDF}
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        {isGeneratingPDF ? "Gerando..." : "LinkedIn"}
                      </Button>
                      
                      <Button
                        onClick={handleShareWhatsApp}
                        disabled={isGeneratingPDF}
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-700 hover:from-green-100 hover:to-green-200 hover:text-green-800 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {isGeneratingPDF ? "Gerando..." : "WhatsApp"}
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
                <div className="px-6 pb-6 overflow-auto certificate-dialog-content">
                  <UnifiedCertificateViewer
                    data={{
                      userName: user?.user_metadata?.full_name || user?.email || "Usuário",
                      solutionTitle: certificate.title,
                      solutionCategory: isSolution ? "Solução de IA" : "Curso",
                      courseTitle: !isSolution ? certificate.title : undefined,
                      implementationDate: formattedDate,
                      completedDate: formattedDate,
                      certificateId: certificate.id,
                      validationCode: certificate.validation_code
                    } as CertificateData}
                    showHeader={false}
                    scale={0.5}
                    onDownload={() => handleDownload()}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};