import React from 'react';
import { CertificateData } from '@/utils/certificates/templateEngine';

interface PixelPerfectTemplateProps {
  data?: CertificateData;
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
        className={`pixel-perfect-certificate ${className}`}
        style={{
          width: '1200px',
          height: '900px',
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
                    // Fallback robusto para html2canvas - usar cor sólida
                    color: '#7CF6FF',
                    display: 'inline-block',
                    fontWeight: 'inherit'
                  }}
                  className="certificate-gradient-text"
                > DE IA</span>
              </h1>
            </div>

            {/* Subtitle: CERTIFICAMOS QUE */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '24px'
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  margin: 0,
                  letterSpacing: '0.08em',
                  color: '#EAF2F6',
                  textTransform: 'uppercase',
                  opacity: 0.9,
                  lineHeight: 1
                }}
              >
                CERTIFICAMOS QUE
              </h2>
            </div>

            {/* User Name and Description */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '48px',
                maxWidth: '800px',
                margin: '0 auto 48px auto'
              }}
            >
              {/* User Name in Highlight */}
              <div
                style={{
                  fontSize: '42px',
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: '0.02em',
                  color: '#7CF6FF',
                  lineHeight: 1.1,
                  textShadow: '0 0 20px rgba(124, 246, 255, 0.3)',
                  marginBottom: '32px',
                  textTransform: 'uppercase'
                }}
              >
                {data?.userName || "Nome do Usuário"}
              </div>
              
              {/* Descriptive Text */}
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#EAF2F6',
                  opacity: 0.9,
                  lineHeight: 1.6,
                  letterSpacing: '0.01em',
                  textAlign: 'center',
                  margin: '0 auto',
                  maxWidth: '600px'
                }}
              >
                Concluiu o curso <strong style={{ color: '#7CF6FF', fontWeight: 600 }}>{data?.solutionTitle || "Curso de Formação"}</strong>, 
                adquirindo conhecimentos sobre <strong style={{ color: '#7CF6FF', fontWeight: 600 }}>{data?.solutionCategory || "Inteligência Artificial"}</strong>, 
                em <strong style={{ color: '#7CF6FF', fontWeight: 600 }}>{data?.implementationDate || new Date().toLocaleDateString('pt-BR')}</strong>, 
                com carga horária de <strong style={{ color: '#7CF6FF', fontWeight: 600 }}>8 horas</strong>.
              </div>
            </div>

            {/* Signature and Validation */}
            <div
              style={{
                position: 'absolute',
                bottom: '48px',
                left: '48px',
                right: '48px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
              }}
            >
              {/* Signature - Left Side */}
              <div
                style={{
                  textAlign: 'center',
                  flex: 1
                }}
              >
                {/* Signature Line */}
                <div
                  style={{
                    width: '200px',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, #7CF6FF 50%, transparent 100%)',
                    margin: '0 auto 8px auto'
                  }}
                ></div>
                
                {/* Signature Script */}
                <div
                  style={{
                    fontSize: '28px',
                    fontFamily: 'Brush Script MT, cursive, serif',
                    color: '#7CF6FF',
                    marginBottom: '4px',
                    fontWeight: 400,
                    textShadow: '0 0 10px rgba(124, 246, 255, 0.2)'
                  }}
                >
                  Rafael Milagre
                </div>
                
                {/* Printed Name */}
                <div
                  style={{
                    fontSize: '12px',
                    color: '#EAF2F6',
                    opacity: 0.8,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Rafael Milagre
                </div>
              </div>

              {/* Validation Code - Right Side */}
              <div
                style={{
                  textAlign: 'right'
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: '#EAF2F6',
                    opacity: 0.7,
                    marginBottom: '4px'
                  }}
                >
                  CÓDIGO DE VALIDAÇÃO
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#7CF6FF',
                    letterSpacing: '0.1em'
                  }}
                >
                  {data?.validationCode || "VIVER-IA-2024"}
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