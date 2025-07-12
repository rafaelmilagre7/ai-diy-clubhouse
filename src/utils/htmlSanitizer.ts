/**
 * UTILITÁRIO DE SANITIZAÇÃO HTML - PROTEÇÃO CONTRA XSS
 * ====================================================
 * 
 * Este módulo centraliza toda a sanitização de HTML para prevenir ataques XSS.
 * Substitui o uso direto de dangerouslySetInnerHTML por versões seguras.
 */

import DOMPurify from 'dompurify';

// Configuração de segurança para DOMPurify
const SAFE_CONFIG = {
  // Tags HTML permitidas
  ALLOWED_TAGS: [
    'p', 'div', 'span', 'br', 'hr', 'ul', 'ol', 'li', 'blockquote',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins',
    'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'code', 'pre', 'kbd', 'samp', 'var',
    'mark', 'small', 'sub', 'sup',
    'details', 'summary'
  ],
  
  // Atributos permitidos
  ALLOWED_ATTR: [
    'class', 'id', 'title', 'alt', 'src', 'href', 'target',
    'width', 'height', 'style', 'data-*',
    'colspan', 'rowspan', 'scope',
    'rel', 'rev', 'charset', 'hreflang', 'type'
  ],
  
  // Protocolos permitidos para links
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  
  // Configurações adicionais de segurança
  ALLOW_DATA_ATTR: true,
  ALLOW_ARIA_ATTR: true,
  USE_PROFILES: { html: true },
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
  SANITIZE_DOM: true,
  SANITIZE_NAMED_PROPS: true,
  KEEP_CONTENT: true,
  IN_PLACE: false,
  FORCE_BODY: false,
  WHOLE_DOCUMENT: false
};

/**
 * Sanitiza HTML removendo scripts maliciosos e elementos perigosos
 */
export function sanitizeHTML(html: string, config?: Partial<typeof SAFE_CONFIG>): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const finalConfig = { ...SAFE_CONFIG, ...config };
  
  try {
    // Primeiro passo: sanitização com DOMPurify
    const cleaned = DOMPurify.sanitize(html, finalConfig);
    
    // Segundo passo: limpeza adicional de padrões suspeitos
    const extraCleaned = cleaned
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<iframe\b[^>]*>/gi, '') // Remove iframes não sanitizados
      .replace(/<object\b[^>]*>/gi, '') // Remove objects
      .replace(/<embed\b[^>]*>/gi, ''); // Remove embeds
    
    return extraCleaned;
  } catch (error) {
    console.error('Erro na sanitização HTML:', error);
    return ''; // Retorna string vazia em caso de erro
  }
}

/**
 * Configuração específica para conteúdo de certificados
 */
export function sanitizeCertificateHTML(html: string): string {
  const certificateConfig = {
    ...SAFE_CONFIG,
    ALLOWED_TAGS: [...SAFE_CONFIG.ALLOWED_TAGS, 'style'],
    ALLOWED_ATTR: [...SAFE_CONFIG.ALLOWED_ATTR, 'style']
  };
  
  return sanitizeHTML(html, certificateConfig);
}

/**
 * Configuração específica para conteúdo de comunicações admin
 */
export function sanitizeAdminCommunicationHTML(html: string): string {
  const adminConfig = {
    ...SAFE_CONFIG,
    ALLOWED_TAGS: [
      ...SAFE_CONFIG.ALLOWED_TAGS,
      'style', 'link' // Permitir estilos para comunicações admin
    ]
  };
  
  return sanitizeHTML(html, adminConfig);
}

/**
 * Configuração restritiva para conteúdo de usuários (posts, comentários)
 */
export function sanitizeUserContentHTML(html: string): string {
  const userConfig = {
    ...SAFE_CONFIG,
    ALLOWED_TAGS: [
      'p', 'div', 'span', 'br', 'hr', 'ul', 'ol', 'li', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i', 'u',
      'a', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['class', 'href', 'title', 'alt', 'target']
  };
  
  return sanitizeHTML(html, userConfig);
}

/**
 * Escape de texto simples para prevenir injeção HTML
 */
export function escapeHTML(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Wrapper seguro para dangerouslySetInnerHTML
 */
export function createSafeHTML(html: string, config?: Partial<typeof SAFE_CONFIG>) {
  return { __html: sanitizeHTML(html, config) };
}

/**
 * Hook para usar HTML sanitizado em componentes React
 */
export function useSafeHTML(html: string, config?: Partial<typeof SAFE_CONFIG>) {
  return createSafeHTML(html, config);
}

/**
 * Validador de URLs para prevenir URLs maliciosas
 */
export function isSafeURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    
    // Verificar protocolo
    if (!allowedProtocols.includes(parsed.protocol)) {
      return false;
    }
    
    // Verificar se não é um domínio suspeito
    const suspiciousDomains = ['javascript', 'data', 'vbscript'];
    if (suspiciousDomains.some(domain => parsed.hostname.includes(domain))) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove document.write e substitui por abordagem segura
 */
export function safeDocumentWrite(content: string, targetWindow?: Window): void {
  const targetWin = targetWindow || (typeof window !== 'undefined' ? window : null);
  
  if (!targetWin || !targetWin.document) {
    console.error('Window ou document não disponível');
    return;
  }
  
  try {
    // Limpar documento
    targetWin.document.open();
    
    // Sanitizar conteúdo antes de escrever
    const safeContent = sanitizeHTML(content);
    
    // Usar innerHTML em vez de document.write
    targetWin.document.documentElement.innerHTML = safeContent;
    
    targetWin.document.close();
  } catch (error) {
    console.error('Erro ao escrever documento de forma segura:', error);
  }
}

/**
 * Limpa CSS de possíveis vulnerabilidades
 */
export function sanitizeCSS(css: string): string {
  if (!css || typeof css !== 'string') {
    return '';
  }
  
  return css
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/javascript:/gi, '') // Remove JavaScript URLs
    .replace(/vbscript:/gi, '') // Remove VBScript URLs
    .replace(/data:text\/html/gi, '') // Remove data URLs HTML
    .replace(/import\s+/gi, '') // Remove CSS imports
    .replace(/@import/gi, '') // Remove @import rules
    .replace(/behavior\s*:/gi, ''); // Remove IE behaviors
}