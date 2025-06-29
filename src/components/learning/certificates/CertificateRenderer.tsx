
import React from "react";

interface CertificateRendererProps {
  template: {
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
}

export const CertificateRenderer = ({ template, data }: CertificateRendererProps) => {
  // Substituir variáveis no template HTML
  const processedHtml = template.html_template
    .replace(/\{\{USER_NAME\}\}/g, data.userName)
    .replace(/\{\{SOLUTION_TITLE\}\}/g, data.solutionTitle)
    .replace(/\{\{SOLUTION_CATEGORY\}\}/g, data.solutionCategory)
    .replace(/\{\{IMPLEMENTATION_DATE\}\}/g, data.implementationDate)
    .replace(/\{\{VALIDATION_CODE\}\}/g, data.validationCode)
    .replace(/\{\{BENEFITS\}\}/g, data.benefits?.join(', ') || '');

  return (
    <div className="certificate-container">
      <style dangerouslySetInnerHTML={{ __html: template.css_styles }} />
      <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
    </div>
  );
};
