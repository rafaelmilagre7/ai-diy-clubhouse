
import DOMPurify from 'dompurify';

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
    'src', 'alt', 'loading', 'onclick', 'onerror'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|blob):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick'], // Remover eventos inline por segurança
};

/**
 * Cria HTML seguro para renderização no fórum
 * Remove elementos perigosos mas mantém formatação e imagens
 */
export const createSafeHTML = (htmlString: string) => {
  if (!htmlString) return { __html: '' };
  
  // Primeira passada: sanitização básica
  let cleanHTML = DOMPurify.sanitize(htmlString, createSafeHTMLConfig);
  
  // Segunda passada: tratar eventos inline de forma mais segura
  cleanHTML = cleanHTML
    // Remover eventos inline perigosos
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    // Adicionar abertura de imagem em nova aba de forma segura
    .replace(/<img([^>]*?)>/gi, (match, attrs) => {
      // Extrair src da imagem
      const srcMatch = attrs.match(/src="([^"]*?)"/);
      if (srcMatch && srcMatch[1]) {
        const src = srcMatch[1];
        // Adicionar click handler seguro via data attribute
        return `<img${attrs} data-image-src="${src}" style="cursor: pointer;">`;
      }
      return match;
    });
  
  console.log('🧹 HTML sanitizado:', cleanHTML);
  
  return { __html: cleanHTML };
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
};

const handleImageClick = (event: Event) => {
  const target = event.target as HTMLElement;
  
  if (target.tagName === 'IMG' && target.hasAttribute('data-image-src')) {
    event.preventDefault();
    const src = target.getAttribute('data-image-src');
    if (src) {
      window.open(src, '_blank');
    }
  }
};
