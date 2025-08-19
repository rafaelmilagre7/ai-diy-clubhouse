import React, { useState } from "react";
import { CertificatePreview } from "./CertificatePreview";
import { CertificateData, type CertificateTemplate as TemplateType } from "@/utils/certificates/templateEngine";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface UnifiedCertificateViewerProps {
  data: CertificateData;
  template?: TemplateType;
  showHeader?: boolean;
  headerTitle?: string;
  headerDescription?: string;
  scale?: number;
  className?: string;
  onDownload?: () => void;
  onOpenInNewTab?: () => void;
}

export const UnifiedCertificateViewer = ({
  data,
  template,
  showHeader = true,
  headerTitle = "Seu Certificado",
  headerDescription = "Parabéns! Você conquistou este certificado ao concluir com sucesso.",
  scale = 0.6,
  className = "",
  onDownload,
  onOpenInNewTab
}: UnifiedCertificateViewerProps) => {
  return (
    <div className={`w-full max-w-7xl mx-auto ${className}`}>
      {showHeader && (
        <Card className="mb-8 aurora-glass aurora-glow">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full aurora-gradient p-1">
                <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold aurora-text-gradient mb-2">
              {headerTitle}
            </h1>
            
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {headerDescription}
            </p>
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-8 h-0.5 aurora-gradient rounded-full"></div>
              <span className="text-sm font-medium text-viverblue">VIVER DE IA</span>
              <div className="w-8 h-0.5 aurora-gradient rounded-full"></div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="flex justify-center">
        <CertificatePreview
          data={data}
          template={template}
          scale={scale}
          showActions={true}
          className="aurora-glass-hover rounded-lg p-6"
          onDownload={onDownload}
          onOpenInNewTab={onOpenInNewTab}
        />
      </div>
      
      <div className="mt-8 text-center">
        <div className="aurora-glass rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Validação do Certificado
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Este certificado pode ser validado usando o código:
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg font-mono text-sm">
            <span className="text-primary font-semibold">{data.validationCode}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Acesse /certificado/validar para verificar a autenticidade
          </p>
        </div>
      </div>
    </div>
  );
};