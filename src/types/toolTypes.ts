
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
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  official_url: string;
  logo_url: string | null;
  category: ToolCategory;
  video_tutorials: VideoTutorial[];
  tags: string[];
  status: boolean;
  created_at: string;
  updated_at: string;
  video_url?: string;
  video_type?: 'youtube' | 'upload';
  has_member_benefit?: boolean;
  benefit_title?: string;
  benefit_description?: string;
  benefit_link?: string;
  benefit_badge_url?: string;
  benefit_clicks?: number;
  benefit_type?: BenefitType;
}

export interface SolutionTool {
  id: string;
  solution_id: string;
  tool_name: string;
  tool_url?: string;
  is_required: boolean;
  created_at?: string;
}
