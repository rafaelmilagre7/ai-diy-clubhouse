import React, { useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, X, RefreshCw, Printer } from "lucide-react";
import { CertificateRenderer } from "./CertificateRenderer";
import { usePDFGenerator } from "@/hooks/learning/usePDFGenerator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { getCategoryDetails } from "@/lib/types/categoryTypes";

const getCourseCapacitationDescription = (category: string, courseTitle: string) => {
  // Primeiro, tentar inferir pela categoria
  switch (category) {
    case 'Receita':
      return 'implementação de estratégias de IA para aumento de receita e otimização comercial';
    case 'Operacional': 
      return 'automação de processos operacionais e otimização de workflows com inteligência artificial';
    case 'Estratégia':
      return 'planejamento estratégico e tomada de decisões baseadas em dados e IA';
    default:
      // Fallback baseado no título do curso
      if (courseTitle.toLowerCase().includes('copy')) {
        return 'criação de copy persuasivo e conteúdo otimizado com inteligência artificial';
      } else if (courseTitle.toLowerCase().includes('lovable')) {
        return 'desenvolvimento de aplicações web modernas com ferramentas de IA';
      } else if (courseTitle.toLowerCase().includes('formação')) {
        return 'aplicação prática de inteligência artificial em negócios e processos';
      }
      return 'aplicação de inteligência artificial e automação de processos empresariais';
  }
};

interface CertificateModalProps {
  certificate: any;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal = ({ certificate, isOpen, onClose }: CertificateModalProps) => {
  const { user } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  // Não usar mais template do banco - sempre usar hardcoded
  const template = { id: 'hardcoded', name: 'VIVER DE IA Neon', html_template: '', css_styles: '' };
  const templateLoading = false;
  const { generatePDF, downloadPDF, openCertificateInNewTab, isGenerating } = usePDFGenerator();

  const solution = certificate.solutions;
  const implementationDate = format(new Date(certificate.implementation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  // LOG DETALHADO dos dados do certificado
  console.log('🎯 [MODAL] CertificateModal - Dados do certificado:', {
    certificateId: certificate.id,
    workloadHours: certificate.workloadHours,
    certificate: certificate
  });
  
  const certificateData = {
    userName: user?.user_metadata?.name || user?.email || 'Usuário',
    solutionTitle: solution?.title || 'Solução',
    solutionCategory: getCourseCapacitationDescription(
      solution?.category || 'Geral', 
      solution?.title || ''
    ),
    implementationDate,
    validationCode: certificate.validation_code,
    workloadHours: certificate.workloadHours, // Incluir a carga horária do hook
    benefits: [] // Pode ser expandido futuramente
  };

  // LOG dos dados finais
  console.log('🎯 [MODAL] Dados finais passados para CertificateRenderer:', certificateData);

  // Debug: Log do template quando carregado
  useEffect(() => {
    if (template) {
      console.log('📋 Template carregado no modal:', {
        id: template.id,
        name: template.name,
        hasHTML: !!template.html_template,
        hasCSS: !!template.css_styles,
        htmlLength: template.html_template?.length || 0,
        cssLength: template.css_styles?.length || 0
      });
    }
  }, [template]);

  const handleRefreshTemplate = () => {
    console.log('🔄 Template hardcoded VIVER DE IA sempre ativo');
    toast.info('Template VIVER DE IA neon ativo!');
  };

  const handleDownload = async () => {
    if (!certificateRef.current || !template) {
      toast.error('Erro ao preparar certificado para download');
      return;
    }

    console.log('💾 Iniciando download do certificado:', certificate.id);

    const filename = `certificado-${solution?.title?.replace(/[^a-zA-Z0-9]/g, '-')}-${certificate.validation_code}.pdf`;
    
    // Gerar PDF e fazer download direto
    const result = await generatePDF(certificateRef.current, filename, certificate.id);
    
    if (result) {
      downloadPDF(result.url, result.filename, true);
      toast.success('Download do certificado iniciado!');
    }
  };

  const handleOpenForPrint = async () => {
    if (!certificateRef.current || !template) {
      toast.error('Erro ao preparar certificado');
      return;
    }

    console.log('🖨️ Abrindo certificado para impressão...');
    await openCertificateInNewTab(certificateRef.current, certificateData);
  };

  // Template hardcoded sempre disponível - remover loading states

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-background border-border">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-white">Preview do Certificado</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshTemplate}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview do Certificado */}
          <div className="flex justify-center bg-white p-4 rounded-lg">
            <div ref={certificateRef} className="transform scale-75 origin-top">
              <CertificateRenderer
                template={template}
                data={certificateData}
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center border-t border-neutral-700 pt-4">
            <Button
              onClick={handleOpenForPrint}
              disabled={isGenerating}
              variant="aurora-primary"
            >
              <Printer className="h-4 w-4 mr-2" />
              {isGenerating ? 'Preparando...' : 'Visualizar para Imprimir'}
            </Button>
            
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              variant="outline"
              className="border-aurora-primary/50 text-aurora-primary hover:bg-aurora-primary/10"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
          </div>

          {/* Info do Template */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">
              ✓ Template: VIVER DE IA Neon (Hardcoded)
            </div>
          </div>

          {/* Debug info (apenas em desenvolvimento) */}
          {import.meta.env.DEV && (
            <div className="text-xs text-gray-500 space-y-1">
              <div>Template: Hardcoded VIVER DE IA</div>
              <div>Certificate ID: {certificate.id}</div>
              <div>Layout: Fundo escuro + moldura neon turquesa</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
