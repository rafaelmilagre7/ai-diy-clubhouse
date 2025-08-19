import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Eye, EyeOff } from "lucide-react";
import { CertificateTemplate } from "./CertificateTemplate";
import { pdfGenerator } from "@/utils/certificates/pdfGenerator";
import { CertificateData, CertificateTemplate as TemplateType } from "@/utils/certificates/templateEngine";
import { toast } from "sonner";

interface CertificatePreviewProps {
  data: CertificateData;
  template?: TemplateType;
  showActions?: boolean;
  scale?: number;
  className?: string;
}

export const CertificatePreview = ({
  data,
  template,
  showActions = true,
  scale = 0.5,
  className = ""
}: CertificatePreviewProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [certificateElement, setCertificateElement] = useState<HTMLElement | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleCertificateReady = (element: HTMLElement) => {
    setCertificateElement(element);
  };

  const handleDownload = async () => {
    if (!certificateElement) {
      toast.error("Certificado ainda não está pronto para download");
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await pdfGenerator.generateFromElement(certificateElement, data);
      const filename = `certificado-${data.solutionTitle?.replace(/[^a-zA-Z0-9]/g, '-') || 'documento'}-${Date.now()}.pdf`;
      
      await pdfGenerator.downloadPDF(blob, filename);
      toast.success("Certificado baixado com sucesso!");
      
    } catch (error) {
      console.error('Erro ao gerar PDF para download:', error);
      toast.error("Erro ao gerar certificado para download");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenInNewTab = async () => {
    if (!certificateElement) {
      toast.error("Certificado ainda não está pronto");
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await pdfGenerator.generateFromElement(certificateElement, data);
      await pdfGenerator.openPDFInNewTab(blob);
      
    } catch (error) {
      console.error('Erro ao abrir PDF:', error);
      toast.error("Erro ao abrir certificado");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVisibility}
              className="flex items-center gap-2"
            >
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isVisible ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleDownload}
              disabled={!certificateElement || isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? "Gerando..." : "Baixar PDF"}
            </Button>
            
            <Button 
              onClick={handleOpenInNewTab}
              disabled={!certificateElement || isGenerating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir
            </Button>
          </div>
        </div>
      )}

      {isVisible && (
        <div className="relative">
          <div 
            ref={previewRef}
            className="rounded-lg overflow-hidden bg-transparent"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: `${1123 * scale}px`,
              height: `${794 * scale}px`
            }}
          >
            <CertificateTemplate
              template={template}
              data={data}
              onReady={handleCertificateReady}
              className="origin-top-left"
            />
          </div>
          
          {!certificateElement && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground">Preparando certificado...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};