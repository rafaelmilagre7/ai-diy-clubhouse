import { sanitizeCertificateHTML, sanitizeCSS } from '@/utils/htmlSanitizer';

export interface CertificateData {
  userName: string;
  solutionTitle: string;
  solutionCategory?: string;
  implementationDate: string;
  completedDate?: string;
  certificateId: string;
  validationCode: string;
  courseTitle?: string;
  benefits?: string[];
}

export interface CertificateTemplate {
  id?: string;
  name?: string;
  html_template: string;
  css_styles: string;
  metadata?: Record<string, any>;
}

export class CertificateTemplateEngine {
  private static instance: CertificateTemplateEngine;

  public static getInstance(): CertificateTemplateEngine {
    if (!CertificateTemplateEngine.instance) {
      CertificateTemplateEngine.instance = new CertificateTemplateEngine();
    }
    return CertificateTemplateEngine.instance;
  }

  public generateDefaultTemplate(): CertificateTemplate {
    const htmlTemplate = `
      <div class="certificate-container">
        <div class="certificate-content">
          <!-- Header com logo e título -->
          <header class="header">
            <img src="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png" alt="VIVER DE IA" class="logo" />
            <h1 class="main-title">Certificado de {{COMPLETION_TYPE}}</h1>
            <div class="divider-line"></div>
          </header>

          <!-- Corpo principal -->
          <main class="body">
            <p class="intro-text">Certificamos que</p>
            
            <div class="user-section">
              <h2 class="user-name">{{USER_NAME}}</h2>
              <div class="user-underline"></div>
            </div>
            
            <p class="completion-text">
              concluiu com excelência {{COMPLETION_TYPE}}:
            </p>
            
            <div class="solution-box">
              <h3 class="solution-name">{{SOLUTION_TITLE}}</h3>
              {{#if SOLUTION_CATEGORY}}
                <p class="solution-category">{{SOLUTION_CATEGORY}}</p>
              {{/if}}
            </div>
            
            <p class="achievement-description">
              demonstrando competência técnica e dedicação no desenvolvimento de soluções em Inteligência Artificial
            </p>
          </main>

          <!-- Rodapé com informações -->
          <footer class="footer">
            <div class="footer-left">
              <div class="info-block">
                <span class="info-label">Data de Conclusão</span>
                <span class="info-value">{{IMPLEMENTATION_DATE}}</span>
              </div>
            </div>
            
            <div class="footer-center">
              <div class="signature-area">
                <div class="signature-line"></div>
                <div class="signature-info">
                  <span class="signatory-name">Rafael G Milagre</span>
                  <span class="signatory-title">Founder • VIVER DE IA</span>
                </div>
              </div>
            </div>
            
            <div class="footer-right">
              <div class="info-block">
                <span class="info-label">Código de Validação</span>
                <span class="validation-code">{{VALIDATION_CODE}}</span>
              </div>
            </div>
          </footer>
        </div>
      </div>`;

    const cssStyles = `
      .certificate-container {
        width: 1123px;
        height: 794px;
        background: linear-gradient(135deg, #0a0f1c 0%, #1a2332 100%);
        color: #ffffff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        position: relative;
        overflow: hidden;
        border-radius: 16px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      }

      .certificate-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 20%, rgba(0, 201, 167, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0, 201, 167, 0.1) 0%, transparent 50%);
        pointer-events: none;
      }

      .certificate-content {
        position: relative;
        z-index: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 60px 80px;
        box-sizing: border-box;
      }

      /* Header */
      .header {
        text-align: center;
        margin-bottom: 50px;
      }

      .logo {
        width: 140px;
        height: auto;
        object-fit: contain;
        margin: 0 auto 30px;
        filter: brightness(1.1) drop-shadow(0 4px 20px rgba(0, 201, 167, 0.3));
      }

      .main-title {
        font-size: 48px;
        font-weight: 700;
        color: #00c9a7;
        margin: 0 0 20px 0;
        letter-spacing: -0.02em;
        text-shadow: 0 2px 10px rgba(0, 201, 167, 0.3);
      }

      .divider-line {
        width: 120px;
        height: 3px;
        background: linear-gradient(90deg, transparent, #00c9a7, transparent);
        margin: 0 auto;
        border-radius: 2px;
      }

      /* Body */
      .body {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        gap: 30px;
      }

      .intro-text {
        font-size: 20px;
        color: #e2e8f0;
        margin: 0;
        font-weight: 400;
      }

      .user-section {
        margin: 20px 0 30px;
      }

      .user-name {
        font-size: 42px;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 15px 0;
        letter-spacing: -0.01em;
        text-shadow: 0 2px 15px rgba(255, 255, 255, 0.1);
      }

      .user-underline {
        width: 300px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #00c9a7, transparent);
        margin: 0 auto;
        border-radius: 1px;
      }

      .completion-text {
        font-size: 20px;
        color: #e2e8f0;
        margin: 0;
        font-weight: 400;
      }

      .solution-box {
        background: rgba(0, 201, 167, 0.08);
        border: 1px solid rgba(0, 201, 167, 0.25);
        border-radius: 12px;
        padding: 30px 40px;
        margin: 20px auto;
        max-width: 600px;
        backdrop-filter: blur(10px);
      }

      .solution-name {
        font-size: 32px;
        font-weight: 700;
        color: #00c9a7;
        margin: 0 0 10px 0;
        line-height: 1.3;
      }

      .solution-category {
        font-size: 16px;
        color: #94a3b8;
        margin: 0;
        font-weight: 500;
      }

      .achievement-description {
        font-size: 18px;
        color: #cbd5e1;
        line-height: 1.6;
        max-width: 700px;
        margin: 0 auto;
        font-weight: 400;
      }

      /* Footer */
      .footer {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-top: 50px;
        gap: 40px;
      }

      .footer-left,
      .footer-right {
        flex: 1;
      }

      .footer-center {
        flex: 1;
        display: flex;
        justify-content: center;
      }

      .footer-right {
        text-align: right;
      }

      .info-block {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .info-label {
        font-size: 12px;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        font-weight: 600;
      }

      .info-value {
        font-size: 16px;
        color: #ffffff;
        font-weight: 600;
      }

      .validation-code {
        font-size: 16px;
        color: #00c9a7;
        font-weight: 700;
        background: rgba(0, 201, 167, 0.1);
        padding: 8px 16px;
        border-radius: 8px;
        border: 1px solid rgba(0, 201, 167, 0.3);
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: 0.5px;
      }

      .signature-area {
        text-align: center;
      }

      .signature-line {
        width: 200px;
        height: 1px;
        background: rgba(255, 255, 255, 0.3);
        margin: 0 auto 12px;
      }

      .signature-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .signatory-name {
        font-size: 18px;
        color: #ffffff;
        font-weight: 700;
      }

      .signatory-title {
        font-size: 14px;
        color: #94a3b8;
        font-weight: 500;
      }

      /* Print optimizations */
      @media print {
        .certificate-container {
          width: 297mm;
          height: 210mm;
          border-radius: 0;
          box-shadow: none;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }

      /* Responsive adjustments */
      @media (max-width: 1200px) {
        .certificate-content {
          padding: 40px 60px;
        }
        
        .main-title {
          font-size: 40px;
        }
        
        .user-name {
          font-size: 36px;
        }
        
        .solution-name {
          font-size: 28px;
        }
      }
    `;

    return {
      name: 'VIVER DE IA Certificado Moderno',
      html_template: htmlTemplate,
      css_styles: cssStyles,
      metadata: {
        version: '3.0',
        type: 'modern',
        author: 'VIVER DE IA',
        description: 'Template moderno com as cores da plataforma e layout espaçado'
      }
    };
  }

  public processTemplate(template: CertificateTemplate, data: CertificateData): string {
    let processedHtml = template.html_template;

    // Determinar tipo de conclusão
    const completionType = data.courseTitle 
      ? `o curso`
      : `a implementação da solução`;

    // Substituições básicas
    const replacements = {
      '{{USER_NAME}}': data.userName,
      '{{SOLUTION_TITLE}}': data.solutionTitle || data.courseTitle || '',
      '{{SOLUTION_CATEGORY}}': data.solutionCategory || '',
      '{{IMPLEMENTATION_DATE}}': data.implementationDate || data.completedDate || '',
      '{{VALIDATION_CODE}}': data.validationCode,
      '{{CERTIFICATE_ID}}': data.certificateId,
      '{{COMPLETION_TYPE}}': completionType,
      '{{BENEFITS}}': data.benefits?.join(', ') || ''
    };

    // Aplicar substituições
    for (const [placeholder, value] of Object.entries(replacements)) {
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      processedHtml = processedHtml.replace(regex, value || '');
    }

    // Processamento condicional simples
    processedHtml = this.processConditionals(processedHtml, data);

    return sanitizeCertificateHTML(processedHtml);
  }

  private processConditionals(html: string, data: CertificateData): string {
    // Processar {{#if CONDITION}} ... {{/if}}
    const ifRegex = /\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs;
    
    return html.replace(ifRegex, (match, condition, content) => {
      const value = this.getDataValue(data, condition);
      return value ? content : '';
    });
  }

  private getDataValue(data: CertificateData, key: string): any {
    const keyMap: Record<string, any> = {
      'SOLUTION_CATEGORY': data.solutionCategory,
      'COURSE_TITLE': data.courseTitle,
      'BENEFITS': data.benefits,
    };

    return keyMap[key];
  }

  public optimizeCSS(css: string): string {
    const optimizations = `
      /* Otimizações para renderização */
      * {
        font-display: block !important;
        -webkit-font-feature-settings: "kern" 1;
        font-feature-settings: "kern" 1;
        text-rendering: optimizeLegibility;
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .certificate-container {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
        image-rendering: pixelated;
      }
    `;

    return sanitizeCSS(css + '\n' + optimizations);
  }
}

export const templateEngine = CertificateTemplateEngine.getInstance();