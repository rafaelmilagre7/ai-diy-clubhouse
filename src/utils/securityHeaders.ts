
// Headers de segurança para requisições HTTP
export class SecurityHeaders {
  private static instance: SecurityHeaders;
  
  private constructor() {}
  
  static getInstance(): SecurityHeaders {
    if (!SecurityHeaders.instance) {
      SecurityHeaders.instance = new SecurityHeaders();
    }
    return SecurityHeaders.instance;
  }
  
  // Headers de segurança padrão para todas as requisições
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }
  
  // Aplicar headers em requisições fetch
  enhanceFetch(url: string, options: RequestInit = {}): RequestInit {
    const securityHeaders = this.getSecurityHeaders();
    
    return {
      ...options,
      headers: {
        ...securityHeaders,
        ...options.headers
      }
    };
  }
  
  // Validar origem da requisição
  validateOrigin(origin: string): boolean {
    const allowedOrigins = [
      'https://app.viverdeia.ai',
      'https://viverdeia.ai',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    
    return allowedOrigins.includes(origin) || 
           (process.env.NODE_ENV === 'development' && origin.includes('localhost'));
  }
  
  // Configurar CSP (Content Security Policy)
  getCSPDirectives(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ];
    
    return directives.join('; ');
  }
}

// Instância global
export const securityHeaders = SecurityHeaders.getInstance();
