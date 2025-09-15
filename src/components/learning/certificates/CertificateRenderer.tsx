
import React from "react";
import { PixelPerfectCertificateTemplate } from "@/components/certificates/PixelPerfectCertificateTemplate";
import { CertificateData, templateEngine } from "@/utils/certificates/templateEngine";
import '@/styles/pixel-perfect-certificate.css';

interface CertificateRendererProps {
  template?: {
    id?: string;
    name?: string;
    html_template: string;
    css_styles: string;
  };
  data: {
    userName: string;
    solutionTitle: string;
    solutionCategory: string;
    implementationDate: string;
    validationCode: string;
    benefits?: string[];
  };
  onReady?: (element: HTMLElement) => void;
}

export const CertificateRenderer = ({ template, data, onReady }: CertificateRendererProps) => {
  // SEMPRE usar o template pixel-perfect "VIVER DE IA" neon v5.0
  console.log('🎨 CertificateRenderer: Usando template pixel-perfect VIVER DE IA v5.0');

  const unifiedData: CertificateData = {
    userName: data.userName,
    solutionTitle: data.solutionTitle,
    solutionCategory: data.solutionCategory,
    implementationDate: data.implementationDate,
    certificateId: data.validationCode,
    validationCode: data.validationCode,
    benefits: data.benefits,
    // Campos enriquecidos com valores padrão inteligentes
    description: 'Certificado de conclusão de formação em inteligência artificial',
    workload: '20 horas',
    difficulty: 'Intermediário',
    categoryDetailed: data.solutionCategory || 'Formação IA'
  };

  return (
    <div className="certificate-preview-container">
      <PixelPerfectCertificateTemplate
        data={unifiedData}
        onReady={onReady}
        className="certificate-scale-preview"
      />
    </div>
  );
};
