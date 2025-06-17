import { APP_CONFIG } from '@/config/app';

export class URLManager {
  private static instance: URLManager;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = APP_CONFIG.getAppDomain();
  }

  public static getInstance(): URLManager {
    if (!URLManager.instance) {
      URLManager.instance = new URLManager();
    }
    return URLManager.instance;
  }

  
  public generateInviteUrl(token: string): string {
    return `${this.baseUrl}/convite/${token}`;
  }

  public generateResetUrl(token: string): string {
    return `${this.baseUrl}/reset-password?token=${token}`;
  }

  public generateCertificateUrl(certificateId: string): string {
    return `${this.baseUrl}/certificado/${certificateId}`;
  }

  public generateProfileUrl(userId: string): string {
    return `${this.baseUrl}/perfil/${userId}`;
  }

  public generateSolutionUrl(solutionSlug: string): string {
    return `${this.baseUrl}/solucao/${solutionSlug}`;
  }

  public generateToolUrl(toolId: string): string {
    return `${this.baseUrl}/ferramenta/${toolId}`;
  }

  public generateLessonUrl(courseSlug: string, lessonSlug: string): string {
    return `${this.baseUrl}/learning/courses/${courseSlug}/lessons/${lessonSlug}`;
  }

  public getCanonicalUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  public isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  public isInternalUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const baseUrlObj = new URL(this.baseUrl);
      return urlObj.hostname === baseUrlObj.hostname;
    } catch {
      return false;
    }
  }
}

// Instância singleton para uso global
export const urlManager = URLManager.getInstance();
