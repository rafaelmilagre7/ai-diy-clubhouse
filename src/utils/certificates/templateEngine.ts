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
  // Novos campos enriquecidos
  description?: string;
  workload?: string;
  difficulty?: string;
  categoryDetailed?: string;
  totalModules?: number;
  totalLessons?: number;
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
        class="viver-de-ia-certificate"
        style="
          width: 1200px;
          height: 900px;
          min-width: 1200px;
          min-height: 900px;
          aspect-ratio: 4/3;
          background: #0A0D0F;
          position: relative;
          font-family: Inter, Poppins, Manrope, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          padding: 48px;
          box-sizing: border-box;
        "
      >
        <!-- Main Card with Neon Frame -->
        <div
          style="
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 40px;
            background: linear-gradient(135deg, #7CF6FF 0%, #37DFF2 100%);
            padding: 24px;
            box-shadow: 0 0 0 6px rgba(55, 223, 242, 0.15);
            box-sizing: border-box;
          "
        >
          <!-- Inner Card -->
          <div
            style="
              width: 100%;
              height: 100%;
              background: #0F1114;
              border-radius: 32px;
              position: relative;
              box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
              padding: 64px 48px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
            "
          >
            <!-- Header Title: VIVER DE IA -->
            <div
              style="
                text-align: center;
                margin-bottom: 64px;
              "
            >
              <h1
                style="
                  font-size: 32px;
                  font-weight: 600;
                  margin: 0;
                  letter-spacing: 0.24em;
                  text-transform: uppercase;
                  line-height: 1.2;
                "
              >
                <span style="color: #EAF2F6;">VIVER</span>
                <span 
                  style="
                    background: linear-gradient(180deg, #79F0FF 0%, #28D6EE 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    color: transparent;
                  "
                > DE IA</span>
              </h1>
            </div>

            <!-- Subtitle: CERTIFICAMOS QUE -->
            <div
              style="
                text-align: center;
                margin-bottom: 48px;
              "
            >
              <h2
                style="
                  font-size: 26px;
                  font-weight: 600;
                  margin: 0;
                  letter-spacing: 0.08em;
                  text-transform: uppercase;
                  color: #EAF2F6;
                  opacity: 0.85;
                "
              >
                CERTIFICAMOS QUE
              </h2>
            </div>

            <!-- User Name -->
            <div
              style="
                text-align: center;
                margin-bottom: 32px;
              "
            >
              <div
                style="
                  font-size: 28px;
                  font-weight: 600;
                  color: #7CF6FF;
                  margin-bottom: 8px;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                "
              >
                {{USER_NAME}}
              </div>
            </div>

            <!-- Completion Text -->
            <div
              style="
                text-align: center;
                margin-bottom: 24px;
              "
            >
              <div
                style="
                  font-size: 18px;
                  color: #EAF2F6;
                  opacity: 0.8;
                  margin-bottom: 16px;
                "
              >
                concluiu com sucesso a formação
              </div>
            </div>

            <!-- Course Title -->
            <div
              style="
                text-align: center;
                margin-bottom: 32px;
              "
            >
              <div
                style="
                  font-size: 24px;
                  font-weight: 600;
                  color: #37DFF2;
                  line-height: 1.3;
                  max-width: 700px;
                  margin: 0 auto;
                "
              >
                {{SOLUTION_TITLE}}
              </div>
            </div>

            <!-- Description -->
            <div
              style="
                text-align: center;
                margin-bottom: 40px;
              "
            >
              <div
                style="
                  font-size: 16px;
                  color: #EAF2F6;
                  opacity: 0.7;
                  line-height: 1.5;
                  max-width: 600px;
                  margin: 0 auto;
                  font-style: italic;
                "
              >
                {{DESCRIPTION}}
              </div>
            </div>

            <!-- Course Details -->
            <div
              style="
                display: flex;
                justify-content: center;
                gap: 64px;
                margin-bottom: 40px;
                flex-wrap: wrap;
              "
            >
              <div style="text-align: center;">
                <div
                  style="
                    font-size: 14px;
                    color: #EAF2F6;
                    opacity: 0.6;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                  "
                >
                  Carga Horária
                </div>
                <div
                  style="
                    font-size: 20px;
                    font-weight: 600;
                    color: #7CF6FF;
                  "
                >
                  {{WORKLOAD}}
                </div>
              </div>

              <div style="text-align: center;">
                <div
                  style="
                    font-size: 14px;
                    color: #EAF2F6;
                    opacity: 0.6;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                  "
                >
                  Conclusão
                </div>
                <div
                  style="
                    font-size: 20px;
                    font-weight: 600;
                    color: #7CF6FF;
                  "
                >
                  {{IMPLEMENTATION_DATE}}
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div
              style="
                margin-top: auto;
                display: flex;
                justify-content: space-between;
                align-items: end;
                padding-top: 24px;
                border-top: 1px solid rgba(234, 242, 246, 0.1);
              "
            >
              <div
                style="
                  font-size: 14px;
                  color: #EAF2F6;
                  opacity: 0.6;
                "
              >
                Plataforma: VIVER DE IA
              </div>
              
              <div style="text-align: right;">
                <div
                  style="
                    font-size: 12px;
                    color: #EAF2F6;
                    opacity: 0.5;
                    margin-bottom: 4px;
                  "
                >
                  Código de Validação
                </div>
                <div
                  style="
                    font-size: 14px;
                    font-weight: 600;
                    color: #37DFF2;
                    font-family: monospace;
                  "
                >
                  {{VALIDATION_CODE}}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const cssStyles = `
      .viver-de-ia-certificate {
        width: 1200px !important;
        height: 900px !important;
        min-width: 1200px !important;
        min-height: 900px !important;
        aspect-ratio: 4/3 !important;
        background: #0A0D0F !important;
        position: relative !important;
        font-family: Inter, Poppins, Manrope, system-ui, sans-serif !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
        margin: 0 auto !important;
        padding: 48px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      /* Garantir que gradientes funcionem em todos os browsers */
      .viver-de-ia-certificate [style*="linear-gradient"] {
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
      }

      @media print {
        .viver-de-ia-certificate {
          width: 297mm !important;
          height: 210mm !important;
          background: #0A0D0F !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }

      /* Responsive scaling */
      @media (max-width: 1200px) {
        .viver-de-ia-certificate {
          width: 100% !important;
          height: 75vw !important;
          min-width: 320px !important;
          min-height: 240px !important;
          padding: 24px !important;
        }
      }
    `;

    return {
      id: 'viver-de-ia-neon-v5',
      name: 'VIVER DE IA - Neon Turquoise v5.0',
      html_template: htmlTemplate,
      css_styles: cssStyles,
      metadata: {
        version: '5.0',
        type: 'viver-de-ia-neon',
        aspectRatio: '4:3',
        minWidth: 1200,
        minHeight: 900,
        theme: 'dark-neon'
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
      '{{COURSE_TITLE}}': data.courseTitle || data.solutionTitle || 'Curso',
      // Novos campos enriquecidos
      '{{DESCRIPTION}}': data.description || 'Certificado de conclusão de formação em inteligência artificial',
      '{{WORKLOAD}}': data.workload || this.calculateWorkload(data),
      '{{DIFFICULTY}}': data.difficulty || this.getDifficultyLevel(data),
      '{{CATEGORY_DETAILED}}': data.categoryDetailed || data.solutionCategory || 'Formação'
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

  // Função auxiliar para calcular carga horária baseada nos dados reais
  private calculateWorkload(data: CertificateData): string {
    if (data.workload) return data.workload;
    
    // Se temos dados específicos de lições
    const totalLessons = data.totalLessons || 0;
    const totalModules = data.totalModules || 0;
    
    // Calcular baseado em dados reais das aulas
    if (totalLessons > 0) {
      // Fórmula: 30 minutos por aula em média
      const estimatedHours = Math.ceil(totalLessons * 0.5);
      return `${estimatedHours} horas`;
    }
    
    if (totalModules > 0) {
      // Fórmula: 2 horas por módulo em média
      const estimatedHours = totalModules * 2;
      return `${estimatedHours} horas`;
    }
    
    // Fallback baseado no tipo de conteúdo
    if (data.solutionTitle?.toLowerCase().includes('formação')) {
      return '8+ horas';
    }
    
    return '4-6 horas';
  }

  // Função auxiliar para determinar nível de dificuldade
  private getDifficultyLevel(data: CertificateData): string {
    if (data.difficulty) return data.difficulty;
    
    const title = (data.solutionTitle || '').toLowerCase();
    
    if (title.includes('avançado') || title.includes('expert') || title.includes('mastery')) {
      return 'Avançado';
    }
    
    if (title.includes('intermediário') || title.includes('intermediate') || title.includes('plus')) {
      return 'Intermediário';
    }
    
    return 'Iniciante';
  }
}

// Exportar instância singleton
export const templateEngine = CertificateTemplateEngine.getInstance();

// Log de inicialização
console.log('🎨 Template Engine inicializado - VIVER DE IA Neon v5.0');
console.log('📋 Templates disponíveis:', templateEngine.getAvailableTemplates().length);

// Limpar cache de templates antigos
if (typeof window !== 'undefined') {
  localStorage.removeItem('certificate-template-cache');
  localStorage.removeItem('certificate-template-updated');
  console.log('🔄 Cache de templates limpo - novo design será aplicado');
}