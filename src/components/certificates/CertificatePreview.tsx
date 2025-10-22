import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Eye, EyeOff } from "lucide-react";
import { PixelPerfectCertificateTemplate } from "./PixelPerfectCertificateTemplate";
import { pdfGenerator } from "@/utils/certificates/pdfGenerator";
import { CertificateData, CertificateTemplate as TemplateType } from "@/utils/certificates/templateEngine";
import { toast } from "sonner";
import "@/styles/certificate.css";

interface CertificatePreviewProps {
  data: CertificateData;
  template?: TemplateType;
  showActions?: boolean;
  scale?: number;
  className?: string;
  onDownload?: () => void;
  onOpenInNewTab?: () => void;
}

export const CertificatePreview = ({
  data,
  template,
  showActions = true,
  scale = 0.5,
  className = "",
  onDownload: externalOnDownload,
  onOpenInNewTab: externalOnOpenInNewTab
}: CertificatePreviewProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [certificateElement, setCertificateElement] = useState<HTMLElement | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleReady = (element: HTMLElement) => {
    setCertificateElement(element);
  };
  const handleDownload = async () => {
    // Se há callback externo, usar ele em vez da lógica interna
    if (externalOnDownload) {
      externalOnDownload();
      return;
    }

    if (!certificateElement) {
      toast.error("Certificado ainda não está pronto para download");
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await pdfGenerator.generateFromElement(certificateElement, data);
      const filename = `certificado-${data.solutionTitle?.replace(/[^a-zA-Z0-9]/g, '-') || 'documento'}.pdf`;
      
      await pdfGenerator.downloadPDF(blob, filename);
      toast.success("Certificado baixado com sucesso!");
      
    } catch (error) {
      console.error('❌ [DOWNLOAD] Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar certificado para download");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenInNewTab = async () => {
    // Se há callback externo, usar ele em vez da lógica interna
    if (externalOnOpenInNewTab) {
      externalOnOpenInNewTab();
      return;
    }

    if (!certificateElement) {
      toast.error("Certificado ainda não está pronto");
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await pdfGenerator.generateFromElement(certificateElement, data);
      await pdfGenerator.openPDFInNewTab(blob);
      
    } catch (error) {
      console.error('❌ [OPEN-TAB] Erro ao abrir PDF:', error);
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
              disabled={(!certificateElement && !externalOnDownload) || isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? "Gerando..." : "Baixar PDF"}
            </Button>
            
            <Button 
              onClick={handleOpenInNewTab}
              disabled={(!certificateElement && !externalOnOpenInNewTab) || isGenerating}
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
          {/* Layout wrapper que reserva o espaço em escala */}
          <div 
            className="rounded-lg overflow-hidden" 
            style={{ width: `${1200 * scale}px`, height: `${900 * scale}px` }}
          >
            {/* Container real em tamanho 1:1, só com transform visual */}
            <div
              ref={previewRef}
              className="w-certificate h-certificate origin-top-left"
              style={{
                transform: `scale(${scale})`,
                willChange: 'transform'
              }}
            >
              <PixelPerfectCertificateTemplate
                data={data}
                onReady={handleReady}
                className="certificate-scale-preview"
              />
            </div>
          </div>
          
          {/* Loading state simplificado */}
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