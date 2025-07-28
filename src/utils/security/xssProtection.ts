/**
 * Sistema completo de proteção contra XSS
 * Sanitiza todo conteúdo HTML antes da exibição
 */
import DOMPurify from 'dompurify';
import React, { useMemo } from 'react';

// =============================================================================
// CONFIGURAÇÕES DE SANITIZAÇÃO
// =============================================================================

// Configuração padrão para conteúdo de usuário
const defaultConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'
  ],
  ALLOWED_ATTR: ['class'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  SANITIZE_DOM: true,
  KEEP_CONTENT: false
};

// Configuração restritiva para texto simples
const strictConfig = {
  ALLOWED_TAGS: ['br'],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  STRIP_COMMENTS: true
};

// Configuração para comentários e posts (mais permissiva)
const commentConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
    'a', 'blockquote', 'code', 'pre'
  ],
  ALLOWED_ATTR: ['href', 'title', 'class'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
  SANITIZE_DOM: true
};

// =============================================================================
// FUNÇÕES DE SANITIZAÇÃO
// =============================================================================

/**
 * Sanitiza HTML com configuração padrão
 */
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(html, defaultConfig) as string;
};

/**
 * Sanitiza texto removendo quase todas as tags HTML
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(text, strictConfig) as string;
};

/**
 * Sanitiza conteúdo de comentários e posts
 */
export const sanitizeUserContent = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(content, commentConfig) as string;
};

/**
 * Sanitiza URLs para prevenir javascript: e data: URLs
 */
export const sanitizeURL = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  // Remove protocolos perigosos
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
  const lowerURL = url.toLowerCase().trim();
  
  for (const protocol of dangerousProtocols) {
    if (lowerURL.startsWith(protocol)) {
      return '';
    }
  }
  
  // Permitir apenas http, https, mailto, tel
  const allowedProtocols = /^(https?|mailto|tel):/i;
  const hasProtocol = /^[a-z][a-z0-9+.-]*:/i.test(url);
  
  if (hasProtocol && !allowedProtocols.test(url)) {
    return '';
  }
  
  return url;
};

/**
 * Escape HTML entities para exibição segura
 */
export const escapeHTML = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// =============================================================================
// COMPONENTE REACT PARA HTML SANITIZADO
// =============================================================================

interface SafeHTMLProps {
  html: string;
  className?: string;
  sanitizationLevel?: 'strict' | 'default' | 'comments';
}

/**
 * Componente React que renderiza HTML sanitizado
 */
export const SafeHTML: React.FC<SafeHTMLProps> = ({ 
  html, 
  className = '', 
  sanitizationLevel = 'default' 
}) => {
  let sanitizedHTML: string;
  
  switch (sanitizationLevel) {
    case 'strict':
      sanitizedHTML = sanitizeText(html);
      break;
    case 'comments':
      sanitizedHTML = sanitizeUserContent(html);
      break;
    default:
      sanitizedHTML = sanitizeHTML(html);
  }
  
  return React.createElement('div', {
    className,
    dangerouslySetInnerHTML: { __html: sanitizedHTML }
  });
};

// =============================================================================
// VALIDAÇÃO DE INPUT EM TEMPO REAL
// =============================================================================

/**
 * Detecta tentativas de injeção XSS em inputs
 */
export const detectXSSAttempt = (input: string): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Limpa input suspeito e registra tentativa
 */
export const cleanSuspiciousInput = (
  input: string, 
  context: string = 'unknown'
): string => {
  if (detectXSSAttempt(input)) {
    // Log da tentativa suspeita
    console.warn('[XSS PROTECTION] Tentativa de XSS detectada:', {
      context,
      input: input.substring(0, 100),
      timestamp: new Date().toISOString()
    });
    
    // Sanitizar agressivamente
    return sanitizeText(input);
  }
  
  return input;
};

// =============================================================================
// HOOKS REACT PARA SANITIZAÇÃO
// =============================================================================

/**
 * Hook para sanitizar HTML
 */
export const useSanitizedHTML = (
  html: string, 
  level: 'strict' | 'default' | 'comments' = 'default'
): string => {
  return useMemo(() => {
    switch (level) {
      case 'strict':
        return sanitizeText(html);
      case 'comments':
        return sanitizeUserContent(html);
      default:
        return sanitizeHTML(html);
    }
  }, [html, level]);
};

/**
 * Hook para detectar e limpar inputs suspeitos
 */
export const useSafeInput = (input: string, context?: string): string => {
  return useMemo(() => {
    return cleanSuspiciousInput(input, context);
  }, [input, context]);
};