
export type BenefitType = 'discount' | 'exclusive' | 'free' | 'trial' | 'other';

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

export interface VideoTutorial {
  title: string;
  url: string;
  description?: string;
  type?: 'youtube' | 'upload';
}

export interface SolutionTool {
  id: string;
  solution_id: string;
  tool_id?: string;
  tool_name: string;
  tool_url?: string;
  is_required: boolean;
  order_index: number;
  created_at: string;
  details?: Tool | null;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  logo_url?: string;
  official_url: string;
  video_url?: string;
  video_type?: string;
  tags: string[];
  status: boolean;
  created_at: string;
  updated_at: string;
  video_tutorials?: VideoTutorial[];
  has_member_benefit: boolean;
  benefit_title?: string;
  benefit_description?: string;
  benefit_link?: string;
  benefit_badge_url?: string;
  benefit_type?: BenefitType;
  benefit_clicks?: number;
  has_valid_logo?: boolean;
  is_access_restricted?: boolean;
  has_access?: boolean;
}
