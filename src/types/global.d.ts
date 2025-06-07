
// Declarações de tipos globais para o projeto

interface GtagConfig {
  page_title?: string;
  page_location?: string;
  custom_map?: Record<string, any>;
  // Parâmetros de configuração GA4
  send_page_view?: boolean;
  anonymize_ip?: boolean;
  cookie_expires?: number;
  cookie_update?: boolean;
  cookie_domain?: string;
  [key: string]: any; // Permite propriedades customizadas
}

interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  // Parâmetros padrão GA4 para eventos
  page_path?: string;
  page_title?: string;
  page_location?: string;
  content_category?: string;
  content_group1?: string;
  content_group2?: string;
  content_group3?: string;
  content_group4?: string;
  content_group5?: string;
  custom_tags?: string;
  user_id?: string;
  session_id?: string;
  engagement_time_msec?: number;
  // Parâmetros de e-commerce
  currency?: string;
  transaction_id?: string;
  item_id?: string;
  item_name?: string;
  item_category?: string;
  item_brand?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
  coupon?: string;
  discount?: number;
  affiliation?: string;
  payment_type?: string;
  shipping?: number;
  tax?: number;
  // Permite propriedades customizadas adicionais
  [key: string]: any;
}

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set' | 'consent',
      targetId: string | Date,
      config?: GtagConfig | GtagEventParams
    ) => void;
  }
}

export {};
