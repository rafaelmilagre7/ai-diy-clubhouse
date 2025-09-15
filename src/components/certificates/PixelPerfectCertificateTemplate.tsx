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
                textAlign: 'center'
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
          </div>
        </div>
      </div>
    );
  }
);

PixelPerfectCertificateTemplate.displayName = 'PixelPerfectCertificateTemplate';