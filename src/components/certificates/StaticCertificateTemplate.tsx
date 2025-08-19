import React, { useEffect, useRef } from 'react';
import { CertificateData, templateEngine } from '@/utils/certificates/templateEngine';

interface StaticCertificateTemplateProps {
  data: CertificateData;
  onReady?: (element: HTMLElement) => void;
  className?: string;
}

export const StaticCertificateTemplate = ({ 
  data, 
  onReady, 
  className = "" 
}: StaticCertificateTemplateProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Usar o template engine unificado para manter o design aprovado
    const template = templateEngine.generateDefaultTemplate();
    const html = templateEngine.processTemplate(template, data);
    const css = templateEngine.optimizeCSS(template.css_styles);

    // Inserir conteúdo processado
    container.innerHTML = `<style>${css}</style>${html}`;

    // Aguardar renderização e notificar quando pronto
    const timer = setTimeout(() => {
      const certificateElement = container.querySelector('.certificate-container') as HTMLElement;
      if (certificateElement && onReady) {
        onReady(certificateElement);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [data, onReady]);

  return (
    <div 
      ref={containerRef}
      className={`certificate-static-wrapper ${className}`}
      style={{
        width: '1123px',
        height: '920px',
        overflow: 'hidden'
      }}
    />
  );
};