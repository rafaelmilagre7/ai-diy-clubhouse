
import React from "react";
import { CertificateTemplate } from "@/components/certificates/CertificateTemplate";
import { CertificateData, type CertificateTemplate as TemplateType } from "@/utils/certificates/templateEngine";

interface CertificateRendererProps {
  template: {
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
  // Converter para formato unificado
  const unifiedTemplate: TemplateType = {
    id: template.id,
    name: template.name,
    html_template: template.html_template,
    css_styles: template.css_styles
  };

  const unifiedData: CertificateData = {
    userName: data.userName,
    solutionTitle: data.solutionTitle,
    solutionCategory: data.solutionCategory,
    implementationDate: data.implementationDate,
    certificateId: data.validationCode, // Usar validation code como ID temporário
    validationCode: data.validationCode,
    benefits: data.benefits
  };

  return (
    <CertificateTemplate
      template={unifiedTemplate}
      data={unifiedData}
      onReady={onReady}
    />
  );
};
