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
          <div class="certificate-header">
            <div class="logo-container">
              <img src="/lovable-uploads/a408c993-07fa-49f2-bee6-c66d0614298b.png" alt="VIVER DE IA" class="certificate-logo" />
            </div>
            <h1 class="certificate-title">Certificado de Conclusão</h1>
            <div class="title-decoration">
              <div class="decoration-line"></div>
              <span class="platform-name">VIVER DE IA</span>
              <div class="decoration-line"></div>
            </div>
            <p class="subtitle">A plataforma de soluções e educação de IA da sua empresa</p>
          </div>

          <!-- Conteúdo principal -->
          <div class="certificate-body">
            <p class="certification-text">Certificamos que</p>
            
            <div class="user-name-section">
              <h2 class="user-name">{{USER_NAME}}</h2>
              <div class="name-underline"></div>
            </div>
            
            <p class="completion-text">
              concluiu com sucesso {{COMPLETION_TYPE}} 
            </p>
            
            <div class="solution-section">
              <h3 class="solution-title">"{{SOLUTION_TITLE}}"</h3>
              {{#if SOLUTION_CATEGORY}}
              <p class="solution-category">Categoria: {{SOLUTION_CATEGORY}}</p>
              {{/if}}
            </div>
            
            <p class="achievement-text">
              demonstrando dedicação e competência na aplicação de soluções de Inteligência Artificial
            </p>
          </div>

          <!-- Footer com assinatura e data -->
          <div class="certificate-footer">
            <div class="date-column">
              <p class="date-label">Data de Conclusão</p>
              <p class="date-value">{{IMPLEMENTATION_DATE}}</p>
            </div>
            
            <div class="signature-column">
              <div class="signature-section">
                <img src="/src/assets/certificates/signature-rafael.png" alt="Assinatura" class="signature-image" />
                <div class="signature-line"></div>
                <p class="signature-name">Rafael G Milagre</p>
                <p class="signature-title">Founder VIVER DE IA</p>
              </div>
              
              <div class="digital-seal">
                <div class="seal-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span class="seal-text">ASSINATURA DIGITAL</span>
              </div>
            </div>
            
            <div class="validation-column">
              <p class="validation-label">Código de Validação</p>
              <p class="validation-code">{{VALIDATION_CODE}}</p>
              <p class="platform-credit">Emitido por VIVER DE IA</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const cssStyles = `
      .certificate-container {
        width: 1123px;
        height: 794px;
        background: #ffffff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        position: relative;
        padding: 60px;
        box-sizing: border-box;
        border: 2px solid hsl(var(--primary));
        border-radius: 12px;
        overflow: hidden;
      }

      .certificate-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, 
          hsla(var(--primary), 0.03) 0%, 
          transparent 25%, 
          transparent 75%, 
          hsla(var(--accent), 0.03) 100%);
        pointer-events: none;
      }

      .certificate-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        z-index: 1;
      }

      /* Header */
      .certificate-header {
        text-align: center;
        margin-bottom: 40px;
      }

      .logo-container {
        margin-bottom: 24px;
      }

      .certificate-logo {
        width: 80px;
        height: 80px;
        object-fit: contain;
      }

      .certificate-title {
        font-size: 42px;
        font-weight: 700;
        color: hsl(var(--primary));
        margin: 0 0 16px 0;
        line-height: 1.2;
      }

      .title-decoration {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-bottom: 8px;
      }

      .decoration-line {
        width: 40px;
        height: 2px;
        background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)));
        border-radius: 1px;
      }

      .platform-name {
        font-size: 20px;
        font-weight: 600;
        color: hsl(var(--primary));
        letter-spacing: 2px;
      }

      .subtitle {
        font-size: 14px;
        color: hsl(var(--muted-foreground));
        margin: 0;
        font-weight: 400;
      }

      /* Body */
      .certificate-body {
        text-align: center;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 24px;
      }

      .certification-text {
        font-size: 18px;
        color: hsl(var(--foreground));
        margin: 0;
        font-weight: 300;
      }

      .user-name-section {
        margin: 32px 0;
      }

      .user-name {
        font-size: 36px;
        font-weight: 700;
        color: hsl(var(--primary));
        margin: 0 0 12px 0;
        line-height: 1.2;
      }

      .name-underline {
        width: 200px;
        height: 2px;
        background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)));
        margin: 0 auto;
        border-radius: 1px;
      }

      .completion-text {
        font-size: 18px;
        color: hsl(var(--muted-foreground));
        margin: 0;
        font-weight: 300;
      }

      .solution-section {
        margin: 32px 0;
        padding: 24px;
        background: hsla(var(--primary), 0.05);
        border-radius: 8px;
        border: 1px solid hsla(var(--primary), 0.1);
      }

      .solution-title {
        font-size: 28px;
        font-weight: 600;
        color: hsl(var(--primary));
        margin: 0 0 8px 0;
        line-height: 1.3;
      }

      .solution-category {
        font-size: 14px;
        color: hsl(var(--muted-foreground));
        margin: 0;
        font-weight: 500;
      }

      .achievement-text {
        font-size: 16px;
        color: hsl(var(--muted-foreground));
        line-height: 1.5;
        max-width: 600px;
        margin: 0 auto;
        font-weight: 400;
      }

      /* Footer */
      .certificate-footer {
        display: flex;
        justify-content: space-between;
        align-items: end;
        margin-top: 40px;
      }

      .date-column,
      .validation-column {
        text-align: left;
        flex: 1;
      }

      .signature-column {
        text-align: center;
        flex: 1;
      }

      .date-label,
      .validation-label {
        font-size: 12px;
        color: hsl(var(--muted-foreground));
        margin: 0 0 4px 0;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .date-value,
      .validation-code {
        font-size: 16px;
        font-weight: 600;
        color: hsl(var(--foreground));
        margin: 0;
      }

      .platform-credit {
        font-size: 12px;
        color: hsl(var(--muted-foreground));
        margin: 8px 0 0 0;
        font-weight: 500;
      }

      .signature-section {
        margin-bottom: 20px;
      }

      .signature-image {
        width: 160px;
        height: auto;
        margin-bottom: 8px;
      }

      .signature-line {
        width: 160px;
        height: 1px;
        background: hsl(var(--border));
        margin: 0 auto 8px;
      }

      .signature-name {
        font-size: 16px;
        font-weight: 600;
        color: hsl(var(--primary));
        margin: 0 0 4px 0;
      }

      .signature-title {
        font-size: 12px;
        color: hsl(var(--muted-foreground));
        margin: 0;
        font-weight: 500;
      }

      .digital-seal {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: hsla(var(--primary), 0.05);
        border: 1px solid hsla(var(--primary), 0.1);
        border-radius: 8px;
        width: 160px;
        margin: 0 auto;
      }

      .seal-icon {
        width: 24px;
        height: 24px;
        color: hsl(var(--primary));
      }

      .seal-text {
        font-size: 10px;
        font-weight: 700;
        color: hsl(var(--primary));
        letter-spacing: 0.5px;
      }

      .validation-column {
        text-align: right;
      }

      /* Print styles */
      @media print {
        .certificate-container {
          width: 297mm;
          height: 210mm;
          padding: 20mm;
          border: none;
          page-break-inside: avoid;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;

    return {
      name: 'VIVER DE IA Default Template',
      html_template: htmlTemplate,
      css_styles: cssStyles,
      metadata: {
        version: '1.0',
        type: 'default',
        author: 'VIVER DE IA',
        description: 'Template padrão para certificados da plataforma'
      }
    };
  }

  public processTemplate(template: CertificateTemplate, data: CertificateData): string {
    let processedHtml = template.html_template;

    // Determinar tipo de conclusão
    const completionType = data.courseTitle 
      ? `o curso "${data.courseTitle}"`
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