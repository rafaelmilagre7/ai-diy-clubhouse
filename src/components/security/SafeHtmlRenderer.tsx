
import React from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlRendererProps {
  html: string;
  className?: string;
  style?: React.CSSProperties;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

export const SafeHtmlRenderer: React.FC<SafeHtmlRendererProps> = ({
  html,
  className,
  style,
  allowedTags,
  allowedAttributes
}) => {
  // Configuração de sanitização personalizada
  const sanitizeOptions = {
    ALLOWED_TAGS: allowedTags || [
      'p', 'div', 'span', 'br', 'strong', 'em', 'u', 'i', 'b',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'a', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'hr', 'sup', 'sub', 'mark', 'del', 'ins'
    ],
    ALLOWED_ATTR: allowedAttributes || [
      'class', 'style', 'href', 'target', 'rel', 'src', 'alt', 
      'width', 'height', 'title', 'id', 'data-*'
    ],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus'],
    ALLOW_DATA_ATTR: true,
    USE_PROFILES: { html: true }
  };

  // Sanitizar o HTML
  const cleanHtml = DOMPurify.sanitize(html, sanitizeOptions);

  return (
    <div 
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

// Hook para sanitização de HTML
export const useSafeHtml = (html: string, options?: any) => {
  return React.useMemo(() => {
    if (!html) return '';
    
    const sanitizeOptions = {
      ALLOWED_TAGS: [
        'p', 'div', 'span', 'br', 'strong', 'em', 'u', 'i', 'b',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
        'a', 'img', 'hr', 'sup', 'sub', 'mark', 'del', 'ins'
      ],
      ALLOWED_ATTR: [
        'class', 'style', 'href', 'target', 'rel', 'src', 'alt', 
        'width', 'height', 'title', 'id'
      ],
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
      USE_PROFILES: { html: true },
      ...options
    };

    return DOMPurify.sanitize(html, sanitizeOptions);
  }, [html, options]);
};

export default SafeHtmlRenderer;
