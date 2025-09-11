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
    return this.generatePixelPerfectTemplate();
  }

  public generatePixelPerfectTemplate(): CertificateTemplate {
    const htmlTemplate = `
      <div 
        class="pixel-perfect-certificate"
        style="
          width: 1200px;
          height: 900px;
          min-width: 1200px;
          min-height: 900px;
          aspect-ratio: 4/3;
          background-color: #0A0D0F;
          position: relative;
          font-family: Inter, Poppins, Manrope, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        "
      >
        <!-- Main Frame with Turquoise Border -->
        <div
          style="
            position: absolute;
            top: 48px;
            left: 48px;
            right: 48px;
            bottom: 48px;
            border-radius: 40px;
            background: linear-gradient(135deg, #7CF6FF 0%, #37DFF2 100%);
            box-shadow: 0 0 0 6px rgba(55, 223, 242, 0.15);
            padding: 24px;
          "
        >
          <!-- Inner Dark Area -->
          <div
            style="
              width: 100%;
              height: 100%;
              background-color: #0F1114;
              border-radius: 32px;
              box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
              position: relative;
              padding: 48px;
            "
          >
            <!-- Main Title - VIVER DE IA -->
            <div
              style="
                position: absolute;
                top: 64px;
                left: 48px;
                right: 48px;
                text-align: center;
              "
            >
              <h1
                style="
                  font-size: 32px;
                  font-weight: 600;
                  letter-spacing: 0.24em;
                  text-transform: uppercase;
                  margin: 0;
                  line-height: 1;
                  color: #EAF2F6;
                "
              >
                VIVER 
                <span
                  style="
                    background: linear-gradient(180deg, #79F0FF 0%, #28D6EE 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                  "
                >
                  DE IA
                </span>
              </h1>
            </div>

            <!-- Subtitle - CERTIFICAMOS QUE -->
            <div
              style="
                position: absolute;
                top: 192px;
                left: 48px;
                right: 48px;
                text-align: center;
              "
            >
              <h2
                style="
                  font-size: 26px;
                  font-weight: 600;
                  letter-spacing: 0.08em;
                  text-transform: uppercase;
                  margin: 0;
                  line-height: 1;
                  color: #EAF2F6;
                  opacity: 0.85;
                "
              >
                CERTIFICAMOS QUE
              </h2>
            </div>

            <!-- Dynamic Content Area -->
            <div
              style="
                position: absolute;
                top: 280px;
                left: 48px;
                right: 48px;
                bottom: 48px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                gap: 24px;
              "
            >
              <!-- User Name -->
              <div
                style="
                  font-size: 36px;
                  font-weight: 700;
                  color: #79F0FF;
                  text-align: center;
                  letter-spacing: 0.02em;
                "
              >
                {{USER_NAME}}
              </div>

              <!-- Course Completion Text -->
              <div
                style="
                  font-size: 24px;
                  font-weight: 500;
                  color: #EAF2F6;
                  text-align: center;
                  opacity: 0.9;
                  max-width: 800px;
                "
              >
                Concluiu com sucesso a formação
              </div>

              <!-- Course Title -->
              <div
                style="
                  font-size: 28px;
                  font-weight: 600;
                  color: #37DFF2;
                  text-align: center;
                  letter-spacing: 0.02em;
                  max-width: 900px;
                "
              >
                "{{SOLUTION_TITLE}}"
              </div>

              <!-- Category and Date -->
              <div
                style="
                  display: flex;
                  gap: 48px;
                  align-items: center;
                  justify-content: center;
                  flex-wrap: wrap;
                  margin-top: 32px;
                "
              >
                <div
                  style="
                    font-size: 16px;
                    font-weight: 500;
                    color: #EAF2F6;
                    opacity: 0.7;
                    text-align: center;
                  "
                >
                  Categoria: {{SOLUTION_CATEGORY}}
                </div>

                <div
                  style="
                    font-size: 16px;
                    font-weight: 500;
                    color: #EAF2F6;
                    opacity: 0.7;
                    text-align: center;
                  "
                >
                  Concluído em: {{IMPLEMENTATION_DATE}}
                </div>
              </div>

              <!-- Validation Code -->
              <div
                style="
                  position: absolute;
                  bottom: 24px;
                  right: 0px;
                  font-size: 12px;
                  font-weight: 400;
                  color: #EAF2F6;
                  opacity: 0.5;
                  font-family: monospace;
                "
              >
                Código: {{VALIDATION_CODE}}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const cssStyles = `
      .pixel-perfect-certificate {
        width: 1200px !important;
        height: 900px !important;
        min-width: 1200px !important;
        min-height: 900px !important;
        aspect-ratio: 4/3 !important;
        background-color: #0A0D0F !important;
        position: relative !important;
        font-family: Inter, Poppins, Manrope, sans-serif !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
        margin: 0 auto !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      @media print {
        .pixel-perfect-certificate {
          width: 297mm !important;
          height: 210mm !important;
          background-color: #0A0D0F !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }

      /* Responsive scaling */
      @media (max-width: 1200px) {
        .pixel-perfect-certificate {
          width: 100% !important;
          height: 75vw !important;
          min-width: 320px !important;
          min-height: 240px !important;
        }
      }
    `;

    return {
      id: 'pixel-perfect-v4',
      name: 'Pixel Perfect VIVER DE IA v4.0',
      html_template: htmlTemplate,
      css_styles: cssStyles,
      metadata: {
        version: '4.0',
        type: 'pixel-perfect',
        aspectRatio: '4:3',
        minWidth: 1200,
        minHeight: 900
      }
    };
  }

  public processTemplate(template: CertificateTemplate, data: CertificateData): string {
    let processedHTML = template.html_template;

    // Substituir placeholders com dados reais
    const replacements = {
      '{{USER_NAME}}': data.userName || 'Nome não informado',
      '{{SOLUTION_TITLE}}': data.solutionTitle || 'Título não informado',
      '{{SOLUTION_CATEGORY}}': data.solutionCategory || 'Categoria não informada',
      '{{IMPLEMENTATION_DATE}}': data.implementationDate || 'Data não informada',
      '{{VALIDATION_CODE}}': data.validationCode || 'Código não informado',
      '{{CERTIFICATE_ID}}': data.certificateId || 'ID não informado',
      '{{COMPLETION_TYPE}}': 'Formação',
      '{{COURSE_TITLE}}': data.courseTitle || data.solutionTitle || 'Curso'
    };

    // Aplicar substituições
    Object.entries(replacements).forEach(([placeholder, value]) => {
      processedHTML = processedHTML.replace(new RegExp(placeholder, 'g'), value);
    });

    // Sanitizar HTML
    processedHTML = sanitizeCertificateHTML(processedHTML);

    console.log('✅ Template processado:', {
      placeholders: Object.keys(replacements).length,
      finalSize: processedHTML.length
    });

    return processedHTML;
  }

  public optimizeCSS(css: string): string {
    let optimizedCSS = css;

    // Remover comentários CSS
    optimizedCSS = optimizedCSS.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remover espaços extras
    optimizedCSS = optimizedCSS.replace(/\s+/g, ' ');

    // Remover quebras de linha desnecessárias
    optimizedCSS = optimizedCSS.replace(/\n\s*\n/g, '\n');

    // Sanitizar CSS
    optimizedCSS = sanitizeCSS(optimizedCSS);

    return optimizedCSS.trim();
  }

  public validateTemplate(template: CertificateTemplate): boolean {
    if (!template.html_template || !template.css_styles) {
      console.error('❌ Template inválido: HTML ou CSS ausente');
      return false;
    }

    // Verificar se contém placeholders essenciais
    const requiredPlaceholders = ['{{USER_NAME}}', '{{SOLUTION_TITLE}}'];
    const hasRequiredPlaceholders = requiredPlaceholders.every(
      placeholder => template.html_template.includes(placeholder)
    );

    if (!hasRequiredPlaceholders) {
      console.error('❌ Template inválido: placeholders essenciais ausentes');
      return false;
    }

    console.log('✅ Template válido');
    return true;
  }

  public getAvailableTemplates(): CertificateTemplate[] {
    return [
      this.generatePixelPerfectTemplate()
    ];
  }
}

// Exportar instância singleton
export const templateEngine = CertificateTemplateEngine.getInstance();

// Log de inicialização
console.log('🎨 Template Engine inicializado com sucesso');
console.log('📋 Templates disponíveis:', templateEngine.getAvailableTemplates().length);