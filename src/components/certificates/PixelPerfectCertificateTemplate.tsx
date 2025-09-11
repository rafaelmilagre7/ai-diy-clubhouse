import React from 'react';

interface PixelPerfectTemplateProps {
  userName?: string;
  solutionTitle?: string;
  solutionCategory?: string;
  implementationDate?: string;
  certificateId?: string;
  validationCode?: string;
  className?: string;
}

export const PixelPerfectCertificateTemplate = ({
  userName = "{{USER_NAME}}",
  solutionTitle = "{{SOLUTION_TITLE}}",
  solutionCategory = "{{SOLUTION_CATEGORY}}",
  implementationDate = "{{IMPLEMENTATION_DATE}}",
  certificateId = "{{CERTIFICATE_ID}}",
  validationCode = "{{VALIDATION_CODE}}",
  className = ""
}: PixelPerfectTemplateProps) => {
  return (
    <div 
      className={`pixel-perfect-certificate ${className}`}
      style={{
        width: '1200px',
        height: '900px',
        minWidth: '1200px',
        minHeight: '900px',
        aspectRatio: '4/3',
        backgroundColor: '#0A0D0F',
        position: 'relative',
        fontFamily: 'Inter, Poppins, Manrope, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      {/* Main Frame with Turquoise Border */}
      <div
        style={{
          position: 'absolute',
          top: '48px',
          left: '48px',
          right: '48px',
          bottom: '48px',
          borderRadius: '40px',
          background: 'linear-gradient(135deg, #7CF6FF 0%, #37DFF2 100%)',
          boxShadow: '0 0 0 6px rgba(55, 223, 242, 0.15)',
          padding: '24px'
        }}
      >
        {/* Inner Dark Area */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#0F1114',
            borderRadius: '32px',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)',
            position: 'relative',
            padding: '48px'
          }}
        >
          {/* Main Title - VIVER DE IA */}
          <div
            style={{
              position: 'absolute',
              top: '64px',
              left: '48px',
              right: '48px',
              textAlign: 'center'
            }}
          >
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 600,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                margin: 0,
                lineHeight: 1,
                color: '#EAF2F6'
              }}
            >
              VIVER{' '}
              <span
                style={{
                  background: 'linear-gradient(180deg, #79F0FF 0%, #28D6EE 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                DE IA
              </span>
            </h1>
          </div>

          {/* Subtitle - CERTIFICAMOS QUE */}
          <div
            style={{
              position: 'absolute',
              top: '192px', // 64 + 128
              left: '48px',
              right: '48px',
              textAlign: 'center'
            }}
          >
            <h2
              style={{
                fontSize: '26px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                margin: 0,
                lineHeight: 1,
                color: '#EAF2F6',
                opacity: 0.85
              }}
            >
              CERTIFICAMOS QUE
            </h2>
          </div>

          {/* Dynamic Content Area - Positioned below subtitle */}
          <div
            style={{
              position: 'absolute',
              top: '280px',
              left: '48px',
              right: '48px',
              bottom: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '24px'
            }}
          >
            {/* User Name */}
            {userName && userName !== "{{USER_NAME}}" && (
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#79F0FF',
                  textAlign: 'center',
                  letterSpacing: '0.02em'
                }}
              >
                {userName}
              </div>
            )}

            {/* Course Title */}
            {solutionTitle && solutionTitle !== "{{SOLUTION_TITLE}}" && (
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 500,
                  color: '#EAF2F6',
                  textAlign: 'center',
                  opacity: 0.9,
                  maxWidth: '800px'
                }}
              >
                Concluiu com sucesso a formação
              </div>
            )}

            {solutionTitle && solutionTitle !== "{{SOLUTION_TITLE}}" && (
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#37DFF2',
                  textAlign: 'center',
                  letterSpacing: '0.02em',
                  maxWidth: '900px'
                }}
              >
                "{solutionTitle}"
              </div>
            )}

            {/* Category and Date */}
            <div
              style={{
                display: 'flex',
                gap: '48px',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              {solutionCategory && solutionCategory !== "{{SOLUTION_CATEGORY}}" && (
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#EAF2F6',
                    opacity: 0.7,
                    textAlign: 'center'
                  }}
                >
                  Categoria: {solutionCategory}
                </div>
              )}

              {implementationDate && implementationDate !== "{{IMPLEMENTATION_DATE}}" && (
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#EAF2F6',
                    opacity: 0.7,
                    textAlign: 'center'
                  }}
                >
                  Concluído em: {implementationDate}
                </div>
              )}
            </div>

            {/* Validation Code */}
            {validationCode && validationCode !== "{{VALIDATION_CODE}}" && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  right: '0px',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#EAF2F6',
                  opacity: 0.5,
                  fontFamily: 'monospace'
                }}
              >
                Código: {validationCode}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};