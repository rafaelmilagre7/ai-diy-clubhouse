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

    try {
      // Usar o template engine unificado para manter o design aprovado
      const template = templateEngine.generateDefaultTemplate();
      const html = templateEngine.processTemplate(template, data);
      const css = templateEngine.optimizeCSS(template.css_styles);

      // Inserir conteúdo processado
      container.innerHTML = `<style>${css}</style><div class="certificate-container">${html}</div>`;

      // Aguardar renderização com verificações robustas
      let attempts = 0;
      const maxAttempts = 10;
      const checkInterval = 300;

      const checkAndNotify = () => {
        attempts++;
        const certificateElement = container.querySelector('.certificate-container, .pixel-perfect-certificate') as HTMLElement;
        
        if (certificateElement) {
          // Verificar se o elemento tem conteúdo visível
          const hasContent = certificateElement.children.length > 0 || certificateElement.textContent?.trim();
          
          if (hasContent && onReady) {
            onReady(certificateElement);
            return;
          }
        }

        if (attempts < maxAttempts) {
          setTimeout(checkAndNotify, checkInterval);
        } else {
          console.error('❌ [STATIC-CERT] Timeout - certificado não renderizou após', maxAttempts * checkInterval, 'ms');
          // Mesmo assim, tentar retornar o que temos
          if (certificateElement && onReady) {
            onReady(certificateElement);
          }
        }
      };

      // Começar verificação
      setTimeout(checkAndNotify, checkInterval);

    } catch (error) {
      console.error('❌ [STATIC-CERT] Erro na renderização:', error);
    }
  }, [data, onReady]);

  return (
    <div 
      ref={containerRef}
      className={`certificate-static-wrapper ${className}`}
      style={{
        width: '1123px',
        height: '950px',
        overflow: 'hidden'
      }}
    />
  );
};