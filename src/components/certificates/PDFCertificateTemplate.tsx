import React from 'react';
import { CertificateData } from '@/utils/certificates/templateEngine';

interface PDFCertificateTemplateProps {
  data?: CertificateData;
  onReady?: (element: HTMLElement) => void;
  className?: string;
}

export const PDFCertificateTemplate = React.forwardRef<HTMLDivElement, PDFCertificateTemplateProps>(
  ({ data, onReady, className = "" }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (containerRef.current && onReady) {
        // Aguardar um frame antes de notificar que está pronto
        requestAnimationFrame(() => {
          if (containerRef.current) {
            onReady(containerRef.current);
          }
        });
      }
    }, [onReady]);

    return (
      <div 
        ref={(el) => {
          containerRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        className={`pdf-certificate-template ${className}`}
        style={{
          width: '1200px',
          height: '900px',
          aspectRatio: '4/3',
          background: '#0A0D0F',
          position: 'relative',
          fontFamily: 'Inter, system-ui, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          padding: '48px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          margin: '0 auto',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          colorAdjust: 'exact'
        }}
      >
        {/* Main Card with Solid Frame - html2canvas compatible */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '40px',
            background: '#37DFF2', // Cor sólida em vez de gradiente
            padding: '24px',
            boxShadow: '0 0 0 6px rgba(55, 223, 242, 0.15)',
            boxSizing: 'border-box'
          }}
        >
          {/* Inner Card */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#0F1114',
              borderRadius: '32px',
              position: 'relative',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              paddingTop: '64px'
            }}
          >
            {/* Header Title: VIVER DE IA */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '128px'
              }}
            >
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: '600',
                  margin: '0',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  lineHeight: '1.2',
                  color: '#EAF2F6'
                }}
              >
                VIVER{' '}
                <span 
                  style={{
                    color: '#7CF6FF', // Cor sólida em vez de gradiente com background-clip
                    fontWeight: '600'
                  }}
                >
                  DE IA
                </span>
              </h1>
            </div>

            {/* Subtitle: CERTIFICAMOS QUE */}
            <div
              style={{
                textAlign: 'center'
              }}
            >
              <h2
                style={{
                  fontSize: '26px',
                  fontWeight: '600',
                  margin: '0',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#EAF2F6',
                  opacity: '0.85'
                }}
              >
                CERTIFICAMOS QUE
              </h2>
            </div>

            {/* Nome do usuário (se disponível) */}
            {data?.userName && (
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '64px'
                }}
              >
                <h3
                  style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    margin: '0',
                    color: '#7CF6FF',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase'
                  }}
                >
                  {data.userName}
                </h3>
              </div>
            )}

            {/* Título da solução (se disponível) */}
            {data?.solutionTitle && (
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '32px'
                }}
              >
                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: '400',
                    margin: '0',
                    color: '#EAF2F6',
                    opacity: '0.8',
                    letterSpacing: '0.05em'
                  }}
                >
                  CONCLUIU COM SUCESSO
                </p>
                <p
                  style={{
                    fontSize: '22px',
                    fontWeight: '600',
                    margin: '8px 0 0 0',
                    color: '#EAF2F6',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase'
                  }}
                >
                  {data.solutionTitle}
                </p>
              </div>
            )}

            {/* Data (se disponível) */}
            {data?.completedDate && (
              <div
                style={{
                  textAlign: 'center',
                  marginTop: 'auto',
                  marginBottom: '32px'
                }}
              >
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    margin: '0',
                    color: '#EAF2F6',
                    opacity: '0.6',
                    letterSpacing: '0.05em'
                  }}
                >
                  {new Date(data.completedDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PDFCertificateTemplate.displayName = 'PDFCertificateTemplate';