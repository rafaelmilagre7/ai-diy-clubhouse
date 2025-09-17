
import React from "react";
import { PixelPerfectCertificateTemplate } from "@/components/certificates/PixelPerfectCertificateTemplate";
import { CertificateData } from "@/utils/certificates/templateEngine";
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
    workloadHours?: string;
    benefits?: string[];
  };
  onReady?: (element: HTMLElement) => void;
}

export const CertificateRenderer = ({ template, data, onReady }: CertificateRendererProps) => {
  // TEMPLATE PIXEL-PERFECT BASE - Apenas layout fundamental
  console.log('🎨 CertificateRenderer: Usando template pixel-perfect VIVER DE IA v6.0 - Layout Base');

  // LOG DETALHADO dos dados recebidos
  console.log('🔍 [RENDERER] CertificateRenderer recebeu dados:', {
    userName: data.userName,
    solutionTitle: data.solutionTitle,
    workloadHours: data.workloadHours,
    data: data
  });

  // Preparar dados mínimos para o template base
  const baseData: CertificateData = {
    userName: data.userName || "Nome do Usuário", 
    solutionTitle: data.solutionTitle || "Curso de Formação",
    solutionCategory: data.solutionCategory || "IA",
    implementationDate: data.implementationDate || new Date().toLocaleDateString('pt-BR'),
    certificateId: data.validationCode,
    validationCode: data.validationCode,
    workloadHours: data.workloadHours || "Duração não disponível"
  };

  // LOG dos dados finais processados
  console.log('🔍 [RENDERER] Dados finais (baseData) passados para template:', baseData);

  return (
    <div className="certificate-preview-container">
      <PixelPerfectCertificateTemplate
        data={baseData}
        onReady={onReady}
        className="certificate-scale-preview"
      />
    </div>
  );
};
