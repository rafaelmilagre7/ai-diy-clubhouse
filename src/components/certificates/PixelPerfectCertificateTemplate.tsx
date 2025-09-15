import React from 'react';
import { CertificateData } from '@/utils/certificates/templateEngine';

interface PixelPerfectTemplateProps {
  data: CertificateData;
  onReady?: (element: HTMLElement) => void;
  className?: string;
}

export const PixelPerfectCertificateTemplate = React.forwardRef<HTMLDivElement, PixelPerfectTemplateProps>(
  ({ data, onReady, className = "" }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (containerRef.current && onReady) {
        onReady(containerRef.current);
      }
    }, [onReady]);

    return (
      <div 
        ref={(el) => {
          containerRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        className={`viver-de-ia-certificate pixel-perfect-certificate ${className}`}
        style={{
          width: '1200px',
          height: '900px',
          minWidth: '1200px',
          minHeight: '900px',
          aspectRatio: '4/3',
          background: '#0A0D0F',
          position: 'relative',
          fontFamily: 'Inter, Poppins, Manrope, system-ui, sans-serif',
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
        {/* Main Card with Neon Frame */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '40px',
            background: 'linear-gradient(135deg, #7CF6FF 0%, #37DFF2 100%)',
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
              padding: '64px 48px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header Title: VIVER DE IA */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '64px'
              }}
            >
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: 600,
                  margin: 0,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  lineHeight: 1.2
                }}
              >
                <span style={{ color: '#EAF2F6' }}>VIVER</span>
                <span 
                  style={{
                    background: 'linear-gradient(180deg, #79F0FF 0%, #28D6EE 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                > DE IA</span>
              </h1>
            </div>

            {/* Subtitle: CERTIFICAMOS QUE */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '48px'
              }}
            >
              <h2
                style={{
                  fontSize: '26px',
                  fontWeight: 600,
                  margin: 0,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#EAF2F6',
                  opacity: 0.85
                }}
              >
                CERTIFICAMOS QUE
              </h2>
            </div>

            {/* User Name */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '32px'
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#7CF6FF',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {data.userName}
              </div>
            </div>

            {/* Completion Text */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '24px'
              }}
            >
              <div
                style={{
                  fontSize: '18px',
                  color: '#EAF2F6',
                  opacity: 0.8,
                  marginBottom: '16px'
                }}
              >
                concluiu com sucesso a formação
              </div>
            </div>

            {/* Course Title */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '32px'
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#37DFF2',
                  lineHeight: 1.3,
                  maxWidth: '700px',
                  margin: '0 auto'
                }}
              >
                {data.solutionTitle}
              </div>
            </div>

            {/* Description */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '40px'
              }}
            >
              <div
                style={{
                  fontSize: '16px',
                  color: '#EAF2F6',
                  opacity: 0.7,
                  lineHeight: 1.5,
                  maxWidth: '600px',
                  margin: '0 auto',
                  fontStyle: 'italic'
                }}
              >
                {data.description || 'Certificado de conclusão de formação em inteligência artificial'}
              </div>
            </div>

            {/* Course Details */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '64px',
                marginBottom: '40px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#EAF2F6',
                    opacity: 0.6,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Carga Horária
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#7CF6FF'
                  }}
                >
                  {data.workload || '20 horas'}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#EAF2F6',
                    opacity: 0.6,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Conclusão
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#7CF6FF'
                  }}
                >
                  {data.implementationDate}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'end',
                paddingTop: '24px',
                borderTop: '1px solid rgba(234, 242, 246, 0.1)'
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: '#EAF2F6',
                  opacity: 0.6
                }}
              >
                Plataforma: VIVER DE IA
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#EAF2F6',
                    opacity: 0.5,
                    marginBottom: '4px'
                  }}
                >
                  Código de Validação
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#37DFF2',
                    fontFamily: 'monospace'
                  }}
                >
                  {data.validationCode}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PixelPerfectCertificateTemplate.displayName = 'PixelPerfectCertificateTemplate';