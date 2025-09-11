
import React from "react";
import { CertificateTemplate } from "@/components/certificates/CertificateTemplate";
import { CertificateData, templateEngine } from "@/utils/certificates/templateEngine";

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
  // SEMPRE usar o template hardcoded "VIVER DE IA" neon
  // Ignorar completamente o template do banco de dados
  const hardcodedTemplate = templateEngine.generateDefaultTemplate();
  
  console.log('🎨 CertificateRenderer: Forçando uso do template hardcoded VIVER DE IA');

  const unifiedData: CertificateData = {
    userName: data.userName,
    solutionTitle: data.solutionTitle,
    solutionCategory: data.solutionCategory,
    implementationDate: data.implementationDate,
    certificateId: data.validationCode,
    validationCode: data.validationCode,
    benefits: data.benefits
  };

  return (
    <CertificateTemplate
      template={hardcodedTemplate}
      data={unifiedData}
      onReady={onReady}
    />
  );
};
