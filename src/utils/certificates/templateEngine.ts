import { sanitizeCertificateHTML, sanitizeCSS } from '@/utils/htmlSanitizer';
import '@/utils/certificates/backgroundFix'; // Auto-aplicar fix de background

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
                <div class="signature-handwritten">Rafael G Milagre</div>
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
        width: 1123px !important;
        height: 950px !important;
        background: linear-gradient(135deg, #00c9a7 0%, #00a688 50%, #008f75 100%) !important;
        background-attachment: local !important;
        color: #ffffff !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        position: relative !important;
        overflow: hidden !important;
        border-radius: 16px !important;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3) !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .certificate-container::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: 
          radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 50% 10%, rgba(0, 150, 130, 0.3) 0%, transparent 60%) !important;
        pointer-events: none !important;
        z-index: 0 !important;
      }

      .certificate-content {
        position: relative !important;
        z-index: 1 !important;
        height: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        padding: 60px 80px !important;
        box-sizing: border-box !important;
        margin: 0 !important;
      }

      /* Header */
      .header {
        text-align: center !important;
        margin-bottom: 50px !important;
        flex-shrink: 0 !important;
      }

      .logo {
        width: 200px !important;
        height: auto !important;
        object-fit: contain !important;
        margin: 0 auto 30px !important;
        filter: brightness(1.1) drop-shadow(0 4px 20px rgba(0, 201, 167, 0.3)) !important;
        display: block !important;
      }

      .main-title {
        font-size: 48px !important;
        font-weight: 700 !important;
        color: #ffffff !important;
        margin: 0 0 20px 0 !important;
        letter-spacing: -0.02em !important;
        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
        display: block !important;
        text-align: center !important;
      }

      .divider-line {
        width: 120px !important;
        height: 3px !important;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent) !important;
        margin: 0 auto !important;
        border-radius: 2px !important;
        display: block !important;
      }

      /* Body */
      .body {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        text-align: center !important;
        gap: 30px !important;
        min-height: 400px !important;
      }

      .intro-text {
        font-size: 20px !important;
        color: #e2e8f0 !important;
        margin: 0 !important;
        font-weight: 400 !important;
      }

      .user-section {
        margin: 20px 0 30px !important;
      }

      .user-name {
        font-size: 42px !important;
        font-weight: 800 !important;
        color: #ffffff !important;
        margin: 0 0 15px 0 !important;
        letter-spacing: -0.01em !important;
        text-shadow: 0 2px 15px rgba(255, 255, 255, 0.1) !important;
      }

      .user-underline {
        width: 300px !important;
        height: 2px !important;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent) !important;
        margin: 0 auto !important;
        border-radius: 1px !important;
      }

      .completion-text {
        font-size: 20px !important;
        color: #e2e8f0 !important;
        margin: 0 !important;
        font-weight: 400 !important;
      }

      .solution-box {
        background: rgba(255, 255, 255, 0.15) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        border-radius: 12px !important;
        padding: 30px 40px !important;
        margin: 20px auto !important;
        max-width: 600px !important;
        backdrop-filter: blur(10px) !important;
      }

      .solution-name {
        font-size: 32px !important;
        font-weight: 700 !important;
        color: #ffffff !important;
        margin: 0 0 10px 0 !important;
        line-height: 1.3 !important;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
      }

      .solution-category {
        font-size: 16px !important;
        color: #94a3b8 !important;
        margin: 0 !important;
        font-weight: 500 !important;
      }

      .achievement-description {
        font-size: 18px !important;
        color: #cbd5e1 !important;
        line-height: 1.6 !important;
        max-width: 700px !important;
        margin: 0 auto !important;
        font-weight: 400 !important;
      }

      /* Footer */
      .footer {
        display: flex !important;
        align-items: flex-end !important;
        justify-content: space-between !important;
        margin-top: 50px !important;
        gap: 40px !important;
        flex-shrink: 0 !important;
        min-height: 80px !important;
      }

      .footer-left,
      .footer-right {
        flex: 1 !important;
      }

      .footer-center {
        flex: 1 !important;
        display: flex !important;
        justify-content: center !important;
      }

      .footer-right {
        text-align: right !important;
      }

      .info-block {
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
      }

      .info-label {
        font-size: 12px !important;
        color: #94a3b8 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.8px !important;
        font-weight: 600 !important;
      }

      .info-value {
        font-size: 16px !important;
        color: #ffffff !important;
        font-weight: 600 !important;
      }

      .validation-code {
        font-size: 16px !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        background: rgba(255, 255, 255, 0.2) !important;
        padding: 8px 16px !important;
        border-radius: 8px !important;
        border: 1px solid rgba(255, 255, 255, 0.4) !important;
        font-family: 'JetBrains Mono', monospace !important;
        letter-spacing: 0.5px !important;
      }

      .signature-area {
        text-align: center !important;
      }

      .signature-handwritten {
        font-family: 'Brush Script MT', 'Lucida Handwriting', cursive !important;
        font-size: 28px !important;
        color: #ffffff !important;
        margin-bottom: 8px !important;
        transform: rotate(-2deg) !important;
        letter-spacing: 1px !important;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
        font-weight: normal !important;
      }

      .signature-line {
        width: 200px !important;
        height: 1px !important;
        background: rgba(255, 255, 255, 0.3) !important;
        margin: 0 auto 12px !important;
      }

      .signature-info {
        display: flex !important;
        flex-direction: column !important;
        gap: 4px !important;
      }

      .signatory-name {
        font-size: 18px !important;
        color: #ffffff !important;
        font-weight: 700 !important;
      }

      .signatory-title {
        font-size: 14px !important;
        color: #94a3b8 !important;
        font-weight: 500 !important;
      }

      /* Print optimizations */
      @media print {
        .certificate-container {
          width: 297mm;
          height: 210mm;
          border-radius: 0;
          box-shadow: none;
          background: linear-gradient(135deg, #00c9a7 0%, #00a688 50%, #008f75 100%) !important;
          background-attachment: local !important;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
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
      name: 'VIVER DE IA Certificado Verde 2025',
      html_template: htmlTemplate,
      css_styles: cssStyles,
      metadata: {
        version: '4.0',
        type: 'lovable_modern',
        author: 'VIVER DE IA',
        description: 'Template moderno com fundo verde/turquesa baseado no novo design VIVER DE IA',
        backgroundColor: '#00c9a7',
        backgroundGradient: 'linear-gradient(135deg, #00c9a7 0%, #00a688 50%, #008f75 100%)',
        updated: new Date().toISOString()
      }
    };
  }

  public processTemplate(template: CertificateTemplate, data: CertificateData): string {
    let processedHtml = template.html_template;

    // Determinar tipo de conclusão automaticamente
    const completionType = data.courseTitle 
      ? `o curso`
      : `a implementação da solução`;

    // Mapeamento completo de variáveis do template
    const replacements = {
      '{{USER_NAME}}': data.userName || 'Usuário',
      '{{SOLUTION_TITLE}}': data.solutionTitle || data.courseTitle || 'Certificado',
      '{{COURSE_TITLE}}': data.courseTitle || data.solutionTitle || 'Certificado',
      '{{SOLUTION_CATEGORY}}': data.solutionCategory || 'Certificado',
      '{{COURSE_CATEGORY}}': data.solutionCategory || 'Curso',
      '{{IMPLEMENTATION_DATE}}': data.implementationDate || data.completedDate || new Date().toLocaleDateString('pt-BR'),
      '{{COMPLETION_DATE}}': data.completedDate || data.implementationDate || new Date().toLocaleDateString('pt-BR'),
      '{{VALIDATION_CODE}}': data.validationCode || '',
      '{{CERTIFICATE_ID}}': data.certificateId || '',
      '{{COMPLETION_TYPE}}': completionType,
      '{{BENEFITS}}': data.benefits?.join(', ') || ''
    };

    // Aplicar substituições com proteção contra valores undefined
    for (const [placeholder, value] of Object.entries(replacements)) {
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      processedHtml = processedHtml.replace(regex, String(value || ''));
    }

    // Processamento condicional aprimorado
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
      /* Reset e otimizações para renderização */
      .certificate-wrapper * {
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .certificate-container * {
        box-sizing: border-box !important;
        font-display: block !important;
        -webkit-font-feature-settings: "kern" 1;
        font-feature-settings: "kern" 1;
        text-rendering: optimizeLegibility !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      .certificate-rendered {
        display: block !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      /* Forçar aplicação de estilos do certificado */
      .certificate-container {
        display: block !important;
        position: relative !important;
        box-sizing: border-box !important;
        background: linear-gradient(135deg, #00c9a7 0%, #00a688 50%, #008f75 100%) !important;
        background-attachment: local !important;
      }
    `;

    return optimizations + '\n' + css;
  }
}

export const templateEngine = CertificateTemplateEngine.getInstance();