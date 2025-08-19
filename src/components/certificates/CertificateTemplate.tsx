import React, { useEffect, useState, useRef } from "react";
import { templateEngine, CertificateData, type CertificateTemplate as TemplateType } from "@/utils/certificates/templateEngine";

interface CertificateTemplateProps {
  template?: TemplateType;
  data: CertificateData;
  onReady?: (element: HTMLElement) => void;
  className?: string;
}

export const CertificateTemplate = ({
  template,
  data,
  onReady,
  className = ""
}: CertificateTemplateProps) => {
  const [isReady, setIsReady] = useState(false);
  const [processedHtml, setProcessedHtml] = useState("");
  const [optimizedCSS, setOptimizedCSS] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const processTemplate = async () => {
      console.log('🎨 Processando template de certificado...');
      
      try {
        // Usar template padrão se não fornecido
        const activeTemplate = template || templateEngine.generateDefaultTemplate();
        
        // Processar HTML e CSS
        const html = templateEngine.processTemplate(activeTemplate, data);
        const css = templateEngine.optimizeCSS(activeTemplate.css_styles);
        
        setProcessedHtml(html);
        setOptimizedCSS(css);
        
        console.log('✅ Template processado com sucesso');
        
        // Aguardar renderização
        setTimeout(() => {
          setIsReady(true);
          
          // Notificar que está pronto
          if (containerRef.current && onReady) {
            setTimeout(() => {
              onReady(containerRef.current!);
            }, 200);
          }
        }, 300);
        
      } catch (error) {
        console.error('❌ Erro ao processar template:', error);
      }
    };

    processTemplate();
  }, [template, data, onReady]);

  if (!isReady) {
    return (
      <div className={`flex items-center justify-center bg-background border border-border rounded-lg ${className}`} 
           style={{ width: '1123px', height: '794px' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-sm">Gerando certificado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`certificate-wrapper ${className}`} style={{ display: 'block', width: '1123px', height: '794px', margin: '0', padding: '0' }}>
      <style dangerouslySetInnerHTML={{ __html: optimizedCSS }} />
      <div 
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
        className="certificate-rendered"
        style={{ 
          display: 'block', 
          position: 'relative', 
          width: '1123px', 
          height: '794px',
          margin: '0',
          padding: '0',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};