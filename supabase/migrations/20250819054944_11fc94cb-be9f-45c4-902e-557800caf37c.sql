-- ============================================================================
-- SISTEMA DE CERTIFICADOS - PARTE 3: TEMPLATES E FUNÇÕES
-- ============================================================================

-- 1. CRIAR TEMPLATE PADRÃO PARA LEARNING_CERTIFICATES
INSERT INTO public.learning_certificate_templates (
  name,
  description,
  html_template,
  css_styles,
  is_active,
  is_default
) VALUES (
  'Template Padrão - Cursos',
  'Template padrão para certificados de cursos da plataforma VIVER DE IA',
  '<div class="certificate-container">
    <div class="certificate-content">
      <header class="header">
        <img src="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png" alt="VIVER DE IA" class="logo" />
        <h1 class="main-title">Certificado de Conclusão</h1>
        <div class="divider-line"></div>
      </header>
      <main class="body">
        <p class="intro-text">Certificamos que</p>
        <div class="user-section">
          <h2 class="user-name">{{USER_NAME}}</h2>
          <div class="user-underline"></div>
        </div>
        <p class="completion-text">concluiu com excelência o curso:</p>
        <div class="solution-box">
          <h3 class="solution-name">{{COURSE_TITLE}}</h3>
          <p class="solution-category">{{COURSE_CATEGORY}}</p>
        </div>
        <p class="achievement-description">
          demonstrando dedicação no aprendizado e domínio dos conceitos apresentados
        </p>
      </main>
      <footer class="footer">
        <div class="footer-left">
          <div class="info-block">
            <span class="info-label">Data de Conclusão</span>
            <span class="info-value">{{COMPLETION_DATE}}</span>
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
  </div>',
  '.certificate-container { width: 1123px !important; height: 794px !important; background: linear-gradient(135deg, #0a0f1c 0%, #1a2332 100%) !important; color: #ffffff !important; font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif !important; position: relative !important; overflow: hidden !important; border-radius: 16px !important; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3) !important; box-sizing: border-box !important; } .certificate-content { position: relative !important; z-index: 1 !important; height: 100% !important; display: flex !important; flex-direction: column !important; padding: 60px 80px !important; box-sizing: border-box !important; } .header { text-align: center !important; margin-bottom: 50px !important; } .logo { width: 200px !important; height: auto !important; margin: 0 auto 30px !important; filter: brightness(1.1) drop-shadow(0 4px 20px rgba(0, 201, 167, 0.3)) !important; } .main-title { font-size: 48px !important; font-weight: 700 !important; color: #00c9a7 !important; margin: 0 0 20px 0 !important; text-shadow: 0 2px 10px rgba(0, 201, 167, 0.3) !important; } .divider-line { width: 120px !important; height: 3px !important; background: linear-gradient(90deg, transparent, #00c9a7, transparent) !important; margin: 0 auto !important; border-radius: 2px !important; } .body { flex: 1 !important; display: flex !important; flex-direction: column !important; justify-content: center !important; text-align: center !important; gap: 30px !important; } .user-name { font-size: 42px !important; font-weight: 800 !important; color: #ffffff !important; } .solution-box { background: rgba(0, 201, 167, 0.08) !important; border: 1px solid rgba(0, 201, 167, 0.25) !important; border-radius: 12px !important; padding: 30px 40px !important; margin: 20px auto !important; max-width: 600px !important; } .solution-name { font-size: 32px !important; font-weight: 700 !important; color: #00c9a7 !important; } .footer { display: flex !important; align-items: flex-end !important; justify-content: space-between !important; margin-top: 50px !important; } .validation-code { font-size: 16px !important; color: #00c9a7 !important; font-weight: 700 !important; background: rgba(0, 201, 167, 0.1) !important; padding: 8px 16px !important; border-radius: 8px !important; border: 1px solid rgba(0, 201, 167, 0.3) !important; font-family: "JetBrains Mono", monospace !important; }',
  true,
  true
) ON CONFLICT DO NOTHING;

-- 2. CORRIGIR FUNÇÃO DE VALIDAÇÃO DE CÓDIGO
CREATE OR REPLACE FUNCTION public.generate_certificate_validation_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN 'VIA-' || EXTRACT(EPOCH FROM now())::bigint;
END;
$$;