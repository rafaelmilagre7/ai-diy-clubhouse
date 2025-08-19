import React, { useEffect, useRef } from "react";
import { CertificateData } from "@/utils/certificates/templateEngine";

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
    if (containerRef.current && onReady) {
      const timer = setTimeout(() => {
        onReady(containerRef.current!);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [onReady]);

  const completionType = data.courseTitle 
    ? "o curso"
    : "a implementação da solução";

  return (
    <div className={`certificate-static ${className}`}>
      <div 
        ref={containerRef}
        className="certificate-container-static"
      >
        <div className="certificate-content-static">
          {/* Header com logo e título */}
          <header className="header-static">
            <img 
              src="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png" 
              alt="VIVER DE IA" 
              className="logo-static" 
            />
            <h1 className="main-title-static">Certificado de {completionType}</h1>
            <div className="divider-line-static"></div>
          </header>

          {/* Corpo principal */}
          <main className="body-static">
            <p className="intro-text-static">Certificamos que</p>
            
            <div className="user-section-static">
              <h2 className="user-name-static">{data.userName}</h2>
              <div className="user-underline-static"></div>
            </div>
            
            <p className="completion-text-static">
              concluiu com excelência {completionType}:
            </p>
            
            <div className="solution-box-static">
              <h3 className="solution-name-static">{data.solutionTitle}</h3>
              {data.solutionCategory && (
                <p className="solution-category-static">{data.solutionCategory}</p>
              )}
            </div>
            
            <p className="achievement-description-static">
              demonstrando competência técnica e dedicação no desenvolvimento de soluções em Inteligência Artificial
            </p>
          </main>

          {/* Rodapé com informações */}
          <footer className="footer-static">
            <div className="footer-left-static">
              <div className="info-block-static">
                <span className="info-label-static">Data de Conclusão</span>
                <span className="info-value-static">{data.implementationDate}</span>
              </div>
            </div>
            
            <div className="footer-center-static">
              <div className="signature-area-static">
                <div className="signature-handwritten-static">Rafael G Milagre</div>
                <div className="signature-line-static"></div>
                <div className="signature-info-static">
                  <span className="signatory-name-static">Rafael G Milagre</span>
                  <span className="signatory-title-static">Founder • VIVER DE IA</span>
                </div>
              </div>
            </div>
            
            <div className="footer-right-static">
              <div className="info-block-static">
                <span className="info-label-static">Código de Validação</span>
                <span className="validation-code-static">{data.validationCode}</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};