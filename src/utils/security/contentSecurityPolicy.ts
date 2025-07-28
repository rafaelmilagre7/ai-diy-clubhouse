/**
 * Content Security Policy (CSP) para prevenir XSS
 * Aplicado automaticamente no cabeçalho da aplicação
 */

// =============================================================================
// CONFIGURAÇÃO CSP
// =============================================================================

export const CSP_DIRECTIVES = {
  // Scripts apenas do próprio domínio e domínios confiáveis
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Necessário para Vite em desenvolvimento
    "https://api.lovable.app",
    "https://*.supabase.co",
    "https://js.stripe.com"
  ],
  
  // Estilos do próprio domínio e inline seguros
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Necessário para Tailwind CSS
    "https://fonts.googleapis.com"
  ],
  
  // Imagens de várias fontes confiáveis
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "https://*.supabase.co"
  ],
  
  // Fontes apenas de fontes confiáveis
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  
  // Conexões apenas para APIs confiáveis
  'connect-src': [
    "'self'",
    "https://*.supabase.co",
    "https://api.lovable.app",
    "ws://localhost:*", // WebSocket para desenvolvimento
    "wss://*.supabase.co" // WebSocket para Supabase
  ],
  
  // Sem frames externos
  'frame-src': [
    "'none'"
  ],
  
  // Sem objetos/embeds
  'object-src': [
    "'none'"
  ],
  
  // Base URI restrita
  'base-uri': [
    "'self'"
  ],
  
  // Upgrade insecure requests em produção
  'upgrade-insecure-requests': [],
  
  // Bloquear mixed content
  'block-all-mixed-content': []
};

/**
 * Gera string CSP para uso em meta tag
 */
export const generateCSPString = (isDevelopment: boolean = false): string => {
  const directives = { ...CSP_DIRECTIVES };
  
  // Em desenvolvimento, permitir localhost
  if (isDevelopment) {
    directives['script-src'].push("http://localhost:*");
    directives['connect-src'].push("http://localhost:*");
    directives['style-src'].push("http://localhost:*");
  }
  
  const cspParts: string[] = [];
  
  Object.entries(directives).forEach(([directive, sources]) => {
    if (sources.length > 0) {
      cspParts.push(`${directive} ${sources.join(' ')}`);
    } else {
      cspParts.push(directive);
    }
  });
  
  return cspParts.join('; ');
};

/**
 * Aplica CSP via meta tag no documento
 */
export const applyCSP = (): void => {
  // Verificar se já existe uma meta tag CSP
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  
  if (existingCSP) {
    return; // Já aplicado
  }
  
  const isDevelopment = import.meta.env.DEV;
  const cspString = generateCSPString(isDevelopment);
  
  // Criar e inserir meta tag CSP
  const metaCSP = document.createElement('meta');
  metaCSP.httpEquiv = 'Content-Security-Policy';
  metaCSP.content = cspString;
  
  document.head.appendChild(metaCSP);
  
  console.log('[CSP] Content Security Policy aplicada:', cspString);
};

/**
 * Aplica headers de segurança adicionais
 */
export const applySecurityHeaders = (): void => {
  // CSP
  applyCSP();
  
  // X-Content-Type-Options
  let metaTag = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'X-Content-Type-Options');
    metaTag.setAttribute('content', 'nosniff');
    document.head.appendChild(metaTag);
  }
  
  // X-Frame-Options
  metaTag = document.querySelector('meta[http-equiv="X-Frame-Options"]');
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'X-Frame-Options');
    metaTag.setAttribute('content', 'DENY');
    document.head.appendChild(metaTag);
  }
  
  // Referrer Policy
  metaTag = document.querySelector('meta[name="referrer"]');
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('name', 'referrer');
    metaTag.setAttribute('content', 'strict-origin-when-cross-origin');
    document.head.appendChild(metaTag);
  }
};

// =============================================================================
// MONITORAMENTO DE VIOLAÇÕES CSP
// =============================================================================

/**
 * Monitora violações de CSP e registra no console
 */
export const setupCSPMonitoring = (): void => {
  document.addEventListener('securitypolicyviolation', (event) => {
    console.error('[CSP VIOLATION] Violação de Content Security Policy detectada:', {
      directive: event.violatedDirective,
      blockedURI: event.blockedURI,
      originalPolicy: event.originalPolicy,
      effectiveDirective: event.effectiveDirective,
      disposition: event.disposition,
      timestamp: new Date().toISOString()
    });
    
    // Em produção, você pode enviar isso para um serviço de monitoramento
    if (!import.meta.env.DEV) {
      // Exemplo: enviar para serviço de logs
      // sendCSPViolationToService(event);
    }
  });
};