
// Declarações de tipos globais para o projeto

interface GtagConfig {
  page_title?: string;
  page_location?: string;
  custom_map?: Record<string, any>;
}

interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_map?: Record<string, any>;
}

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: GtagConfig | GtagEventParams
    ) => void;
  }
}

export {};
