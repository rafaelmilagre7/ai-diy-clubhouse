// ============================================================================
// SISTEMA UNIFICADO DE CERTIFICADOS - VIVER DE IA
// ============================================================================

// Exportações principais do sistema unificado
export { pdfGenerator } from './pdfGenerator';
export { templateEngine } from './templateEngine';
export { validateCertificateCode, generateValidationUrl, isValidValidationCodeFormat } from './validationUtils';

// Utilitários de correção
export { applyCertificateBackgroundFix } from './backgroundFix';

// Hooks especializados
export { useCertificateRefresh } from '@/hooks/certificates/useCertificateRefresh';

// Types e interfaces unificadas
export type { CertificateData, CertificateTemplate } from './templateEngine';
export type { PDFGenerationOptions } from './pdfGenerator';
export type { CertificateValidationResult } from './validationUtils';

// Componentes principais
export { CertificatePreview } from '@/components/certificates/CertificatePreview';
export { UnifiedCertificateViewer } from '@/components/certificates/UnifiedCertificateViewer';
export { StaticCertificateTemplate } from '@/components/certificates/StaticCertificateTemplate';
export { CertificateErrorBoundary } from '@/components/certificates/CertificateErrorBoundary';
export { CertificateTemplateSelector } from '@/components/certificates/CertificateTemplateSelector';
export { CertificateRefreshButton } from '@/components/certificates/CertificateRefreshButton';

export { PixelPerfectCertificateTemplate } from '@/components/certificates/PixelPerfectCertificateTemplate';

// Hooks especializados
export { useUnifiedCertificates } from '@/hooks/learning/useUnifiedCertificates';
export { useCertificateTemplate } from '@/hooks/learning/useCertificateTemplate';
export { useCertificateTemplates } from '@/hooks/learning/useCertificateTemplates';
export { useUnifiedTemplateManager } from '@/hooks/certificates/useUnifiedTemplateManager';

// Loading states
export { 
  CertificateListSkeleton, 
  CertificatePreviewSkeleton, 
  PDFGenerationLoader,
  CertificateTypeSkeleton 
} from '@/components/loading/CertificateLoadingStates';

// Utilidades auxiliares
export { generateCertificatePDF, downloadCertificate, openCertificateInNewTab } from '../certificateGenerator';

/**
 * Guia de migração para desenvolvedores:
 * 
 * SISTEMA LEGADO → SISTEMA UNIFICADO
 * 
 * ANTES:
 * import { generateCertificatePDF } from '@/utils/certificateGenerator';
 * 
 * DEPOIS:
 * import { pdfGenerator, templateEngine } from '@/utils/certificates';
 * 
 * const template = templateEngine.generateDefaultTemplate();
 * const html = templateEngine.processTemplate(template, data);
 * const css = templateEngine.optimizeCSS(template.css_styles);
 * const blob = await pdfGenerator.generateFromHTML(html, css, data);
 */

/**
 * Configuração padrão recomendada para certificados
 */
export const CERTIFICATE_CONFIG = {
  dimensions: {
    width: 1123,
    height: 920
  },
  scale: {
    preview: 0.5,
    modal: 0.6,
    fullscreen: 0.8
  },
  pdf: {
    quality: 1.0,
    format: 'a4' as const,
    orientation: 'landscape' as const
  }
} as const;

/**
 * Status do sistema após correções implementadas:
 * 
 * ✅ BANCO DE DADOS
 * - Tabela learning_certificate_templates criada
 * - Campos padronizados entre tabelas
 * - RLS policies implementadas
 * - Índices de performance adicionados
 * - Dados órfãos corrigidos
 * 
 * ✅ CÓDIGO
 * - Sistema unificado implementado
 * - Hooks otimizados
 * - Componentes modulares
 * - Error boundaries implementados
 * - Loading states avançados
 * 
 * ✅ DESIGN
 * - Template original preservado
 * - Cores e layout mantidos
 * - Animações funcionando
 * - Responsivo
 * 
 * ⚠️  SEGURANÇA
 * - 7 warnings de search_path (não críticos)
 * - 2 warnings de autenticação (configuração)
 */