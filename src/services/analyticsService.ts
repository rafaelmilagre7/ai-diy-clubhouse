
// Serviço isolado para analytics com verificações robustas

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customData?: Record<string, any>;
}

class AnalyticsService {
  private isEnabled(): boolean {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  }

  /**
   * Registra evento de uso de URL de certificado
   */
  trackCertificateURLUsage(data: {
    source: string;
    cached: boolean;
    timestamp: string;
    user_agent: string;
    page_url: string;
  }): void {
    if (!this.isEnabled()) {
      console.log('[Analytics] gtag não disponível, pulando evento de certificado');
      return;
    }

    try {
      window.gtag!('event', 'certificate_url_usage', {
        event_category: 'certificates',
        event_label: data.source,
        value: data.cached ? 1 : 0,
        custom_map: data
      });
      
      console.log('[Analytics] Evento de certificado registrado:', data);
    } catch (error) {
      console.warn('[Analytics] Erro ao registrar evento de certificado:', error);
    }
  }

  /**
   * Registra transformação de URL
   */
  trackURLTransformation(data: {
    type: string;
    original: string;
    transformed: string;
    timestamp: string;
  }): void {
    if (!this.isEnabled()) {
      console.log('[Analytics] gtag não disponível, pulando transformação de URL');
      return;
    }

    try {
      window.gtag!('event', 'url_transformation', {
        event_category: 'proxy',
        event_label: data.type,
        custom_map: { transformation_type: data.type }
      });
      
      console.log('[Analytics] Transformação de URL registrada:', data);
    } catch (error) {
      console.warn('[Analytics] Erro ao registrar transformação:', error);
    }
  }

  /**
   * Registra evento genérico
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled()) {
      console.log('[Analytics] gtag não disponível, pulando evento:', event);
      return;
    }

    try {
      window.gtag!('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        custom_map: event.customData
      });
      
      console.log('[Analytics] Evento registrado:', event);
    } catch (error) {
      console.warn('[Analytics] Erro ao registrar evento:', error);
    }
  }
}

// Instância singleton
export const analyticsService = new AnalyticsService();
