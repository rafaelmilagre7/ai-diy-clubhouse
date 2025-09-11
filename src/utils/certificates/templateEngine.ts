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
        class="pixel-perfect-certificate"
        style="
          width: 1200px;
          height: 900px;
          min-width: 1200px;
          min-height: 900px;
          aspect-ratio: 4/3;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          position: relative;
          font-family: Inter, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        "
      >
        <!-- Certificate Border -->
        <div
          style="
            position: absolute;
            top: 32px;
            left: 32px;
            right: 32px;
            bottom: 32px;
            border: 3px solid #0f172a;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            padding: 64px 48px;
          "
        >
          <!-- Header -->
          <div
            style="
              text-align: center;
              margin-bottom: 48px;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 32px;
            "
          >
            <h1
              style="
                font-size: 28px;
                font-weight: 700;
                color: #0f172a;
                margin: 0 0 8px 0;
                letter-spacing: 0.05em;
                text-transform: uppercase;
              "
            >
              CERTIFICADO DE CONCLUSÃO
            </h1>
            <div
              style="
                font-size: 16px;
                color: #64748b;
                font-weight: 500;
              "
            >
              VIVER DE IA
            </div>
          </div>

          <!-- Main Content -->
          <div
            style="
              text-align: center;
              margin-bottom: 48px;
            "
          >
            <!-- User Name -->
            <div
              style="
                font-size: 20px;
                color: #475569;
                margin-bottom: 24px;
                font-weight: 400;
              "
            >
              Certificamos que
            </div>
            
            <div
              style="
                font-size: 32px;
                font-weight: 600;
                color: #0f172a;
                margin-bottom: 32px;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 8px;
                display: inline-block;
              "
            >
              {{USER_NAME}}
            </div>

            <!-- Completion Text -->
            <div
              style="
                font-size: 18px;
                color: #475569;
                margin-bottom: 16px;
                line-height: 1.5;
              "
            >
              concluiu com sucesso o curso
            </div>

            <!-- Course Title -->
            <div
              style="
                font-size: 26px;
                font-weight: 600;
                color: #3b82f6;
                margin-bottom: 24px;
                line-height: 1.3;
                max-width: 800px;
                margin-left: auto;
                margin-right: auto;
              "
            >
              {{SOLUTION_TITLE}}
            </div>

            <!-- Description -->
            <div
              style="
                font-size: 16px;
                color: #64748b;
                margin-bottom: 32px;
                line-height: 1.6;
                max-width: 700px;
                margin-left: auto;
                margin-right: auto;
                font-style: italic;
              "
            >
              {{DESCRIPTION}}
            </div>

            <!-- Course Details -->
            <div
              style="
                display: flex;
                justify-content: center;
                gap: 48px;
                margin-bottom: 32px;
                flex-wrap: wrap;
              "
            >
              <div
                style="
                  text-align: center;
                "
              >
                <div
                  style="
                    font-size: 14px;
                    color: #64748b;
                    margin-bottom: 4px;
                    font-weight: 500;
                  "
                >
                  Duração Total
                </div>
                <div
                  style="
                    font-size: 18px;
                    font-weight: 600;
                    color: #0f172a;
                  "
                >
                  {{WORKLOAD}}
                </div>
              </div>

              <div
                style="
                  text-align: center;
                "
              >
                <div
                  style="
                    font-size: 14px;
                    color: #64748b;
                    margin-bottom: 4px;
                    font-weight: 500;
                  "
                >
                  Data de Conclusão
                </div>
                <div
                  style="
                    font-size: 18px;
                    font-weight: 600;
                    color: #0f172a;
                  "
                >
                  {{IMPLEMENTATION_DATE}}
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 2px solid #e2e8f0;
              padding-top: 24px;
              margin-top: auto;
            "
          >
            <div
              style="
                font-size: 14px;
                color: #64748b;
              "
            >
              Plataforma: VIVER DE IA
            </div>
            
            <div
              style="
                text-align: right;
              "
            >
              <div
                style="
                  font-size: 12px;
                  color: #64748b;
                  margin-bottom: 4px;
                "
              >
                Código de Validação
              </div>
              <div
                style="
                  font-size: 14px;
                  font-weight: 600;
                  color: #0f172a;
                  font-family: monospace;
                "
              >
                {{VALIDATION_CODE}}
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
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
        position: relative !important;
        font-family: Inter, system-ui, sans-serif !important;
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
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
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
console.log('🎨 Template Engine inicializado com sucesso');
console.log('📋 Templates disponíveis:', templateEngine.getAvailableTemplates().length);