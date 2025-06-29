
import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, X } from "lucide-react";
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
  const { data: template, isLoading: templateLoading } = useCertificateTemplate();
  const { generatePDF, downloadPDF, isGenerating } = usePDFGenerator();

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

  const handleDownload = async () => {
    if (!certificateRef.current || !template) {
      toast.error('Erro ao preparar certificado para download');
      return;
    }

    const filename = `certificado-${solution?.title?.replace(/[^a-zA-Z0-9]/g, '-')}-${certificate.validation_code}.pdf`;
    
    // Se já existe um PDF cacheado, fazer download direto
    if (certificate.certificate_url && certificate.certificate_filename) {
      downloadPDF(certificate.certificate_url, certificate.certificate_filename);
      toast.success('Download iniciado!');
      return;
    }

    // Gerar novo PDF
    const result = await generatePDF(certificateRef.current, filename, certificate.id);
    
    if (result) {
      downloadPDF(result.url, result.filename);
      toast.success('Certificado gerado e download iniciado!');
    }
  };

  const handleOpenInNewTab = async () => {
    if (certificate.certificate_url) {
      window.open(certificate.certificate_url, '_blank');
      return;
    }

    // Gerar PDF se não existir
    if (!certificateRef.current || !template) {
      toast.error('Erro ao preparar certificado');
      return;
    }

    const filename = `certificado-${solution?.title?.replace(/[^a-zA-Z0-9]/g, '-')}-${certificate.validation_code}.pdf`;
    const result = await generatePDF(certificateRef.current, filename, certificate.id);
    
    if (result) {
      window.open(result.url, '_blank');
      toast.success('Certificado aberto em nova aba!');
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-[#0a0b14] border-neutral-700">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-white">Preview do Certificado</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview do Certificado */}
          <div className="flex justify-center bg-white p-4 rounded-lg">
            <div ref={certificateRef} className="transform scale-75 origin-top">
              {template && (
                <CertificateRenderer
                  template={template}
                  data={certificateData}
                />
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center border-t border-neutral-700 pt-4">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="bg-viverblue hover:bg-viverblue/90 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
            
            <Button
              onClick={handleOpenInNewTab}
              disabled={isGenerating}
              variant="outline"
              className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir em Nova Aba
            </Button>
          </div>

          {certificate.certificate_url && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
                ✓ Certificado disponível para download instantâneo
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
