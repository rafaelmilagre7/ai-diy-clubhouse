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
      <div class="certificate-container aurora-bg">
        <div class="certificate-inner">
          <!-- Header com logo e título -->
          <header class="header">
            <img src="/lovable-uploads/a408c993-07fa-49f2-bee6-c66d0614298b.png" alt="Logo VIVER DE IA" class="logo" />
            <h1 class="title">Certificado de {{COMPLETION_TYPE}}</h1>
            <p class="subtitle">VIVER DE IA • Plataforma de soluções e educação em IA</p>
          </header>

          <!-- Corpo -->
          <main class="body">
            <p class="lead">Certificamos que</p>
            <h2 class="user">{{USER_NAME}}</h2>
            <div class="divider"></div>
            <p class="context">
              concluiu com excelência {{COMPLETION_TYPE}}<span class="dot">:</span>
            </p>
            <h3 class="subject">{{SOLUTION_TITLE}}</h3>
            {{#if SOLUTION_CATEGORY}}
              <p class="category">Categoria: {{SOLUTION_CATEGORY}}</p>
            {{/if}}
          </main>

          <!-- Rodapé -->
          <footer class="footer">
            <div class="footer-col">
              <span class="label">Data</span>
              <span class="value">{{IMPLEMENTATION_DATE}}</span>
            </div>
            <div class="footer-col signature">
              <div class="signature-line"></div>
              <span class="sig-name">Rafael G Milagre</span>
              <span class="sig-role">Founder • VIVER DE IA</span>
            </div>
            <div class="footer-col right">
              <span class="label">Código de Validação</span>
              <span class="code">{{VALIDATION_CODE}}</span>
            </div>
          </footer>
        </div>
      </div>`;

    const cssStyles = `
      :root{
        --bg-1:#0b1220;
        --bg-2:#0e1629;
        --fg:#e5e7eb;
        --muted:#94a3b8;
        --accent:#00c9a7;
        --accent-soft:rgba(0,201,167,.15);
        --border:rgba(255,255,255,.12);
      }

      .certificate-container{
        position:relative; width:1123px; height:794px; color:var(--fg); background:linear-gradient(180deg,var(--bg-1),var(--bg-2));
        border-radius:20px; overflow:hidden; border:1px solid var(--border);
      }
      .certificate-container::before, .certificate-container::after{
        content:""; position:absolute; inset:-20%; pointer-events:none; opacity:.6;
        background: radial-gradient(600px 400px at 10% 20%, rgba(124,58,237,.35), transparent 60%),
                    radial-gradient(500px 300px at 90% 80%, rgba(0,201,167,.35), transparent 60%);
      }

      .certificate-inner{ position:relative; z-index:1; display:flex; flex-direction:column; height:100%; padding:56px; }

      .header{ text-align:center; margin-bottom:12px; }
      .logo{ width:120px; height:auto; object-fit:contain; filter: drop-shadow(0 0 18px rgba(255,255,255,.2)); margin:0 auto 12px; }
      .title{ font-size:40px; margin:0; font-weight:800; letter-spacing:.5px; color:var(--fg); }
      .subtitle{ margin:6px 0 0; color:var(--muted); font-size:14px; }

      .body{ flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; text-align:center; }
      .lead{ color:var(--muted); font-size:16px; margin:0; }
      .user{ font-size:36px; font-weight:800; margin:0; color:#fff; text-shadow:0 2px 12px rgba(0,0,0,.25); }
      .divider{ width:220px; height:2px; background:linear-gradient(90deg, transparent, var(--accent), transparent); border-radius:2px; }
      .context{ color:var(--fg); font-size:16px; margin:0; opacity:.9; }
      .dot{ margin-left:4px; }
      .subject{ font-size:28px; font-weight:700; margin:4px 0 0; color:var(--accent); }
      .category{ margin:0; color:var(--muted); font-size:13px; background:var(--accent-soft); padding:6px 10px; border:1px solid rgba(0,201,167,.25); border-radius:8px; }

      .footer{ display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-top:24px; }
      .footer-col{ display:flex; flex-direction:column; gap:6px; }
      .footer-col.right{ align-items:flex-end; text-align:right; }
      .label{ font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:.6px; }
      .value{ font-size:16px; font-weight:600; color:#fff; }
      .code{ font-size:16px; font-weight:700; color:var(--accent); background:var(--accent-soft); padding:6px 10px; border-radius:8px; border:1px solid rgba(0,201,167,.25); }

      .signature{ align-items:center; text-align:center; }
      .signature-line{ width:200px; height:1px; background:var(--border); margin:0 auto 8px; }
      .sig-name{ color:#fff; font-weight:700; font-size:16px; }
      .sig-role{ color:var(--muted); font-size:12px; }

      @media print{
        .certificate-container{ width:297mm; height:210mm; border:none; }
        *{ -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }

      /* Otimizações para renderização */
      *{ box-sizing:border-box; text-rendering:optimizeLegibility; }
    `;

    return {
      name: 'VIVER DE IA Aurora Template',
      html_template: htmlTemplate,
      css_styles: cssStyles,
      metadata: {
        version: '2.0',
        type: 'aurora',
        author: 'VIVER DE IA',
        description: 'Template aurora moderno, com alto contraste e ótimo para PDF'
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