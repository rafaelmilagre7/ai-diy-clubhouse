
export type ToolCategory = 
  | 'Modelos de IA e Interfaces'
  | 'Geração de Conteúdo Visual'
  | 'Geração e Processamento de Áudio'
  | 'Automação e Integrações'
  | 'Comunicação e Atendimento'
  | 'Captura e Análise de Dados'
  | 'Pesquisa e Síntese de Informações'
  | 'Gestão de Documentos e Conteúdo'
  | 'Marketing e CRM'
  | 'Produtividade e Organização'
  | 'Desenvolvimento e Código'
  | 'Plataformas de Mídia'
  | 'Outros';

export type BenefitType = 'discount' | 'exclusive' | 'free' | 'trial' | 'other';

export interface VideoTutorial {
  title: string;
  url: string;
  type: 'youtube' | 'upload';
  description?: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  logo_url: string;
  is_active: boolean;
  status: boolean;
  created_at: string;
  updated_at: string;
  official_url: string;
  tags: string[];
  benefit_title: string | null;
  benefit_type: BenefitType;
  benefit_description: string | null;
  benefit_link: string | null;
  benefit_discount_percentage: number | null;
  has_member_benefit: boolean;
  features: string[];
  pricing_info: any;
  video_tutorials?: VideoTutorial[];
  benefit_badge_url?: string | null;
  // Campos adicionais para compatibilidade
  has_valid_logo?: boolean;
  is_access_restricted?: boolean;
  has_access?: boolean;
}
