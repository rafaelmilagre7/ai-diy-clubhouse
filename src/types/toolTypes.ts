export type ToolCategory = 'IA' | 'API' | 'Automação' | 'No-Code' | 'Integração' | 'Produtividade' | 'Outro';

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
