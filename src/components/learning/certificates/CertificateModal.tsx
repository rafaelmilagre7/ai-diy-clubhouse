import React, { useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, X, RefreshCw, Printer } from "lucide-react";
import { CertificateRenderer } from "./CertificateRenderer";
import { useCertificateTemplate } from "@/hooks/learning/useCertificateTemplate";
import { usePDFGenerator } from "@/hooks/learning/usePDFGenerator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

interface CertificateModalProps {
  certificate: any;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal = ({ certificate, isOpen, onClose }: CertificateModalProps) => {
  const { user } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  const { data: template, isLoading: templateLoading, clearCache } = useCertificateTemplate();
  const { generatePDF, downloadPDF, openCertificateInNewTab, isGenerating } = usePDFGenerator();

  const solution = certificate.solutions;
  const implementationDate = format(new Date(certificate.implementation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const certificateData = {
    userName: user?.user_metadata?.name || user?.email || 'Usuário',
    solutionTitle: solution?.title || 'Solução',
    solutionCategory: solution?.category || 'Categoria',
    implementationDate,
    validationCode: certificate.validation_code,
    benefits: [] // Pode ser expandido futuramente
  };

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
    console.log('🔄 Forçando refresh do template...');
    clearCache();
    toast.info('Template atualizado!');
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

  if (templateLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0b14] border-neutral-700">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Carregando template...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!template) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0b14] border-neutral-700">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-red-400">Erro: Template não encontrado</div>
            <Button onClick={handleRefreshTemplate} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-[#0a0b14] border-neutral-700">
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
              className="bg-viverblue hover:bg-viverblue/90 text-white"
            >
              <Printer className="h-4 w-4 mr-2" />
              {isGenerating ? 'Preparando...' : 'Visualizar para Imprimir'}
            </Button>
            
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              variant="outline"
              className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
          </div>

          {/* Info do Template */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">
              ✓ Template: {template.name} (ID: {template.id})
            </div>
          </div>

          {/* Debug info (apenas em desenvolvimento) */}
          {import.meta.env.DEV && (
            <div className="text-xs text-gray-500 space-y-1">
              <div>Template ID: {template.id}</div>
              <div>Template Name: {template.name}</div>
              <div>Certificate ID: {certificate.id}</div>
              <div>HTML Length: {template.html_template?.length || 0}</div>
              <div>CSS Length: {template.css_styles?.length || 0}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
