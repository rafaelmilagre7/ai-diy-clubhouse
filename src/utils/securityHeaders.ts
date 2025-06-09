
import { logger } from './logger';

// Sistema de headers de segurança
export class SecurityHeaders {
  private static instance: SecurityHeaders;
  
  private constructor() {}
  
  static getInstance(): SecurityHeaders {
    if (!SecurityHeaders.instance) {
      SecurityHeaders.instance = new SecurityHeaders();
    }
    return SecurityHeaders.instance;
  }

  // Headers de segurança padrão
  private getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), location=()',
      'Content-Security-Policy': this.getCSPHeader()
    };
  }

  // Content Security Policy
  private getCSPHeader(): string {
    const isProduction = window.location.hostname.includes('viverdeia.ai');
    
    if (isProduction) {
      return "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://zotzvtepvpnkcoobdubt.supabase.co;";
    } else {
      return "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws: wss: https://zotzvtepvpnkcoobdubt.supabase.co;";
    }
  }

  // Novo método para obter diretivas CSP
  getCSPDirectives(): string {
    return this.getCSPHeader();
  }

  // Aplicar headers a uma requisição fetch
  enhanceFetch(url: string, options: RequestInit = {}): RequestInit {
    const headers = {
      ...this.getSecurityHeaders(),
      ...options.headers
    };

    return {
      ...options,
      headers
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

  // Aplicar headers de segurança no documento
  applyToDocument(): void {
    try {
      // Aplicar meta tags de segurança
      this.addMetaTag('X-Content-Type-Options', 'nosniff');
      this.addMetaTag('X-Frame-Options', 'DENY');
      this.addMetaTag('X-XSS-Protection', '1; mode=block');
      this.addMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      logger.info("Headers de segurança aplicados", {
        component: 'SECURITY_HEADERS'
      });
    } catch (error) {
      logger.error("Erro ao aplicar headers de segurança", {
        component: 'SECURITY_HEADERS',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Adicionar meta tag ao documento
  private addMetaTag(httpEquiv: string, content: string): void {
    const existingTag = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
    if (existingTag) {
      existingTag.setAttribute('content', content);
    } else {
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('http-equiv', httpEquiv);
      metaTag.setAttribute('content', content);
      document.head.appendChild(metaTag);
    }
  }
}

// Instância global
export const securityHeaders = SecurityHeaders.getInstance();

// Aplicar automaticamente quando o módulo for carregado
if (typeof window !== 'undefined') {
  securityHeaders.applyToDocument();
}
