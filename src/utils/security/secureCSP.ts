/**
 * Content Security Policy (CSP) Segura
 * Remove unsafe-inline e implementa nonces/hashes para máxima segurança
 */

// =============================================================================
// GERAÇÃO DE NONCES SEGUROS
// =============================================================================

/**
 * Gera um nonce criptograficamente seguro para CSP
 */
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

// Nonce global para a sessão atual
let currentNonce: string | null = null;

/**
 * Obtém o nonce atual ou gera um novo
 */
export const getCurrentNonce = (): string => {
  if (!currentNonce) {
    currentNonce = generateNonce();
  }
  return currentNonce;
};

/**
 * Regenera o nonce (para uso em navegação SPA)
 */
export const refreshNonce = (): string => {
  currentNonce = generateNonce();
  return currentNonce;
};

// =============================================================================
// CSP SEGURA - SEM UNSAFE-INLINE
// =============================================================================

export const SECURE_CSP_DIRECTIVES = {
  // Scripts: apenas próprio domínio + nonce (SEM unsafe-inline)
  'script-src': [
    "'self'",
    // Nonce será injetado dinamicamente
    "https://cdn.gpteng.co", // Lovable necessário
    "https://*.supabase.co",
    "https://js.stripe.com"
  ],
  
  // Estilos: próprio domínio + hashes específicos (SEM unsafe-inline)  
  'style-src': [
    "'self'",
    "https://fonts.googleapis.com",
    // Hashes para estilos críticos serão adicionados
  ],
  
  // Imagens: mantém permissivo mas seguro
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "https://*.supabase.co"
  ],
  
  // Fontes: apenas fontes confiáveis
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  
  // Conexões: APIs específicas
  'connect-src': [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co"
  ],
  
  // Frames: vídeos específicos
  'frame-src': [
    "'self'",
    "https://*.pandavideo.com.br",
    "https://player-vz-*.tv.pandavideo.com.br"
  ],
  
  // Objetos: bloqueados
  'object-src': [
    "'none'"
  ],
  
  // Base URI: apenas próprio
  'base-uri': [
    "'self'"
  ],
  
  // Formulários: apenas próprio
  'form-action': [
    "'self'"
  ],
  
  // Upgrade insecure em produção
  'upgrade-insecure-requests': [],
  
  // Bloquear mixed content
  'block-all-mixed-content': []
};

// =============================================================================
// CSP PARA DESENVOLVIMENTO (MENOS RESTRITIVA)
// =============================================================================

export const DEV_CSP_DIRECTIVES = {
  ...SECURE_CSP_DIRECTIVES,
  'script-src': [
    ...SECURE_CSP_DIRECTIVES['script-src'],
    "http://localhost:*",
    "'unsafe-eval'" // Necessário para Vite HMR em desenvolvimento
  ],
  'connect-src': [
    ...SECURE_CSP_DIRECTIVES['connect-src'],
    "http://localhost:*",
    "ws://localhost:*"
  ],
  'style-src': [
    ...SECURE_CSP_DIRECTIVES['style-src'],
    "http://localhost:*",
    "'unsafe-inline'" // Apenas em dev para Tailwind
  ]
};

// =============================================================================
// GERAÇÃO DE CSP STRING
// =============================================================================

/**
 * Gera string CSP com nonce incluído
 */
export const generateSecureCSPString = (
  isDevelopment: boolean = false,
  nonce?: string
): string => {
  const directives = isDevelopment ? DEV_CSP_DIRECTIVES : SECURE_CSP_DIRECTIVES;
  const currentNonceValue = nonce || getCurrentNonce();
  
  const cspParts: string[] = [];
  
  Object.entries(directives).forEach(([directive, sources]) => {
    if (sources.length > 0) {
      let sourcesArray = [...sources];
      
      // Adicionar nonce para script-src
      if (directive === 'script-src' && !isDevelopment) {
        sourcesArray.push(`'nonce-${currentNonceValue}'`);
      }
      
      cspParts.push(`${directive} ${sourcesArray.join(' ')}`);
    } else {
      cspParts.push(directive);
    }
  });
  
  return cspParts.join('; ');
};

// =============================================================================
// APLICAÇÃO SEGURA DE CSP
// =============================================================================

/**
 * Aplica CSP segura sem unsafe-inline
 */
export const applySecureCSP = (): void => {
  // Remover CSP existente se houver
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingCSP) {
    existingCSP.remove();
  }
  
  const isDevelopment = import.meta.env.DEV;
  const nonce = getCurrentNonce();
  const cspString = generateSecureCSPString(isDevelopment, nonce);
  
  // Criar nova meta tag CSP
  const metaCSP = document.createElement('meta');
  metaCSP.httpEquiv = 'Content-Security-Policy';
  metaCSP.content = cspString;
  
  document.head.appendChild(metaCSP);
  
  // Adicionar nonce aos scripts existentes se necessário
  if (!isDevelopment) {
    addNonceToExistingScripts(nonce);
  }
  
  console.log('[SECURE CSP] Content Security Policy segura aplicada');
  console.log('[SECURE CSP] Nonce atual:', nonce);
};

/**
 * Adiciona nonce a scripts existentes
 */
const addNonceToExistingScripts = (nonce: string): void => {
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    if (!script.hasAttribute('nonce')) {
      script.setAttribute('nonce', nonce);
    }
  });
};

// =============================================================================
// MONITORAMENTO DE VIOLAÇÕES CSP
// =============================================================================

/**
 * Setup de monitoramento CSP melhorado
 */
export const setupSecureCSPMonitoring = (): void => {
  document.addEventListener('securitypolicyviolation', (event) => {
    const violation = {
      directive: event.violatedDirective,
      blockedURI: event.blockedURI,
      originalPolicy: event.originalPolicy,
      effectiveDirective: event.effectiveDirective,
      disposition: event.disposition,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 100),
      url: window.location.href
    };
    
    console.error('[CSP VIOLATION] Violação detectada:', violation);
    
    // Classificar severidade da violação
    const severity = classifyCSPViolationSeverity(event);
    
    // Em produção, enviar para monitoramento
    if (!import.meta.env.DEV) {
      // Aqui você pode integrar com seu sistema de monitoramento
      // Ex: Sentry, LogRocket, etc.
      sendCSPViolationToMonitoring(violation, severity);
    }
  });
};

/**
 * Classifica a severidade de uma violação CSP
 */
const classifyCSPViolationSeverity = (event: SecurityPolicyViolationEvent): 'low' | 'medium' | 'high' | 'critical' => {
  // Inline scripts são críticos
  if (event.violatedDirective === 'script-src' && event.blockedURI === 'inline') {
    return 'critical';
  }
  
  // Eval é crítico
  if (event.blockedURI === 'eval') {
    return 'critical';
  }
  
  // Scripts externos desconhecidos são altos
  if (event.violatedDirective === 'script-src') {
    return 'high';
  }
  
  // Estilos inline são médios
  if (event.violatedDirective === 'style-src') {
    return 'medium';
  }
  
  return 'low';
};

/**
 * Envia violação CSP para sistema de monitoramento
 */
const sendCSPViolationToMonitoring = async (
  violation: any, 
  severity: 'low' | 'medium' | 'high' | 'critical'
): Promise<void> => {
  try {
    // Integração com sistema de logs/monitoramento
    // Por ora, apenas console em produção
    console.warn(`[CSP MONITORING] Violation severity: ${severity}`, violation);
    
    // TODO: Implementar integração com Sentry, LogRocket, etc.
    // await sendToSentry(violation, severity);
  } catch (error) {
    console.error('[CSP MONITORING] Erro ao enviar violação:', error);
  }
};

// =============================================================================
// UTILITÁRIOS PARA NONCE EM COMPONENTES
// =============================================================================

/**
 * Hook personalizado para usar nonce em componentes React
 */
export const useCSPNonce = () => {
  return getCurrentNonce();
};

/**
 * Cria um script com nonce
 */
export const createScriptWithNonce = (src: string, content?: string): HTMLScriptElement => {
  const script = document.createElement('script');
  script.nonce = getCurrentNonce();
  
  if (src) {
    script.src = src;
  }
  
  if (content) {
    script.textContent = content;
  }
  
  return script;
};