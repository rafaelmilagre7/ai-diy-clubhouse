
import React, { useEffect, useState } from "react";
import { sanitizeCertificateHTML, sanitizeCSS, createSafeHTML } from '@/utils/htmlSanitizer';

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
}

export const CertificateRenderer = ({ template, data }: CertificateRendererProps) => {
  const [isReady, setIsReady] = useState(false);
  const [processedHtml, setProcessedHtml] = useState("");

  useEffect(() => {
    console.log('📋 CertificateRenderer - Template recebido:', {
      id: template.id,
      name: template.name,
      hasHtml: !!template.html_template,
      hasCss: !!template.css_styles,
      htmlPreview: template.html_template?.substring(0, 100) + '...'
    });

    console.log('📋 CertificateRenderer - Dados do certificado:', data);

    // Processar HTML com substituições
    const html = template.html_template
      .replace(/\{\{USER_NAME\}\}/g, data.userName)
      .replace(/\{\{SOLUTION_TITLE\}\}/g, data.solutionTitle)
      .replace(/\{\{SOLUTION_CATEGORY\}\}/g, data.solutionCategory)
      .replace(/\{\{IMPLEMENTATION_DATE\}\}/g, data.implementationDate)
      .replace(/\{\{VALIDATION_CODE\}\}/g, data.validationCode)
      .replace(/\{\{BENEFITS\}\}/g, data.benefits?.join(', ') || '');

    setProcessedHtml(html);

    // Aguardar um pouco para garantir que as fontes carregaram
    const timer = setTimeout(() => {
      console.log('✅ CertificateRenderer pronto para renderização');
      setIsReady(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [template, data]);

  // CSS otimizado para renderização de PDF
  const optimizedCSS = `
    ${template.css_styles}
    
    /* Garantir que as fontes sejam aplicadas corretamente */
    * {
      font-display: block !important;
      -webkit-font-feature-settings: "kern" 1;
      font-feature-settings: "kern" 1;
      text-rendering: optimizeLegibility;
    }
    
    /* Melhorar qualidade para PDF */
    .certificate-container {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
      image-rendering: pixelated;
    }
    
    /* Garantir que elementos não sejam cortados */
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  `;

  if (!isReady) {
    return (
      <div className="certificate-container" style={{ width: '1123px', height: '794px', background: '#fff' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Preparando certificado...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-container">
      <style dangerouslySetInnerHTML={{ __html: sanitizeCSS(optimizedCSS) }} />
      <div dangerouslySetInnerHTML={createSafeHTML(processedHtml)} />
    </div>
  );
};
