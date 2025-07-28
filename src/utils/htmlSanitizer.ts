
import DOMPurify from 'dompurify';
import { sanitizeHTML, sanitizeUserContent } from '@/utils/security/xssProtection';

/**
 * Configuração segura do DOMPurify para conteúdo do fórum
 * Permite imagens, links e formatação básica
 */
const createSafeHTMLConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'code', 'pre', 
    'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'div', 'span'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'class', 'style',
    'src', 'alt', 'loading', 'data-image-src'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|blob):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick'], // Remover eventos inline por segurança
};

/**
 * Configuração para certificados - mais permissiva
 */
const certificateHTMLConfig = {
  ALLOWED_TAGS: [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'b', 'i', 'u', 'br', 'img', 'svg', 'path',
    'g', 'rect', 'circle', 'text', 'tspan'
  ],
  ALLOWED_ATTR: [
    'class', 'style', 'src', 'alt', 'width', 'height',
    'viewBox', 'fill', 'stroke', 'stroke-width', 'd',
    'x', 'y', 'dx', 'dy', 'text-anchor', 'font-family',
    'font-size', 'font-weight'
  ],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror'],
};

/**
 * Cria HTML seguro para renderização no fórum
 * Remove elementos perigosos mas mantém formatação e imagens
 */
export const createSafeHTML = (htmlString: string) => {
  if (!htmlString) return { __html: '' };
  
  // Primeira passada: sanitização básica
  let cleanHTML = DOMPurify.sanitize(htmlString, createSafeHTMLConfig);
  
  // Segunda passada: processar imagens de forma mais segura
  cleanHTML = cleanHTML.replace(/<img([^>]*?)>/gi, (match, attrs) => {
    // Extrair src da imagem
    const srcMatch = attrs.match(/src="([^"]*?)"/);
    if (srcMatch && srcMatch[1]) {
      const src = srcMatch[1];
      // Gerar tag limpa sem eventos inline
      return `<img${attrs} data-image-src="${src}" style="cursor: pointer;">`;
    }
    return match;
  });
  
  console.log('🧹 HTML sanitizado:', cleanHTML);
  
  return { __html: cleanHTML };
};

/**
 * Sanitiza HTML específico para certificados
 */
export const sanitizeCertificateHTML = (htmlString: string) => {
  if (!htmlString) return '';
  
  const cleanHTML = DOMPurify.sanitize(htmlString, certificateHTMLConfig);
  console.log('📄 HTML de certificado sanitizado');
  
  return cleanHTML;
};

/**
 * Sanitiza estilos CSS removendo propriedades perigosas
 */
export const sanitizeCSS = (cssString: string) => {
  if (!cssString) return '';
  
  // Lista de propriedades perigosas a serem removidas
  const dangerousProperties = [
    'javascript:', 'expression(', 'behavior:', 'binding:',
    '@import', 'url(javascript:', 'url(data:', 'url(vbscript:'
  ];
  
  let cleanCSS = cssString;
  
  // Remover propriedades perigosas
  dangerousProperties.forEach(prop => {
    const regex = new RegExp(prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    cleanCSS = cleanCSS.replace(regex, '');
  });
  
  // Remover comentários que podem conter código malicioso
  cleanCSS = cleanCSS.replace(/\/\*[\s\S]*?\*\//g, '');
  
  console.log('🎨 CSS sanitizado');
  
  return cleanCSS;
};

/**
 * Escreve HTML de forma segura em uma nova janela
 */
export const safeDocumentWrite = (doc: Document, htmlContent: string) => {
  if (!doc || !htmlContent) return;
  
  try {
    // Sanitizar o HTML antes de escrever
    const safeHTML = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        'html', 'head', 'body', 'title', 'meta', 'link', 'style',
        'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'em', 'b', 'i', 'u', 'br', 'img', 'svg', 'path',
        'g', 'rect', 'circle', 'text', 'tspan'
      ],
      ALLOWED_ATTR: [
        'class', 'style', 'src', 'alt', 'width', 'height',
        'viewBox', 'fill', 'stroke', 'stroke-width', 'd',
        'x', 'y', 'dx', 'dy', 'text-anchor', 'font-family',
        'font-size', 'font-weight', 'charset', 'name', 'content',
        'rel', 'href', 'type'
      ],
      WHOLE_DOCUMENT: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror'],
    });
    
    doc.open();
    doc.write(safeHTML);
    doc.close();
    
    console.log('📝 HTML escrito de forma segura no documento');
  } catch (error) {
    console.error('❌ Erro ao escrever HTML no documento:', error);
  }
};

/**
 * Adicionar event listener global para abrir imagens
 * Chame esta função uma vez no componente principal
 */
export const initializeImageViewer = () => {
  // Remover listener anterior se existir
  document.removeEventListener('click', handleImageClick);
  
  // Adicionar novo listener
  document.addEventListener('click', handleImageClick);
  
  console.log('🖼️ Visualizador de imagens inicializado');
};

const handleImageClick = (event: Event) => {
  const target = event.target as HTMLElement;
  
  if (target.tagName === 'IMG' && target.hasAttribute('data-image-src')) {
    event.preventDefault();
    const src = target.getAttribute('data-image-src');
    if (src) {
      console.log('🖼️ Abrindo imagem:', src);
      window.open(src, '_blank');
    }
  }
};

/**
 * Adicionar tratamento de erro para imagens quebradas
 */
export const initializeImageErrorHandling = () => {
  document.addEventListener('error', (event: Event) => {
    const target = event.target as HTMLImageElement;
    
    if (target.tagName === 'IMG') {
      console.warn('⚠️ Erro ao carregar imagem:', target.src);
      
      // Adicionar classe de erro visual
      target.style.border = '2px dashed #ccc';
      target.style.padding = '20px';
      target.style.backgroundColor = '#f9f9f9';
      target.alt = 'Imagem não pôde ser carregada';
    }
  }, true);
  
  console.log('🛡️ Tratamento de erro de imagens inicializado');
};
