
export type BenefitType = 'discount' | 'exclusive' | 'free' | 'trial' | 'other';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url?: string;
  official_url: string;
  video_url?: string;
  video_type?: string;
  tags: string[];
  status: boolean;
  created_at: string;
  updated_at: string;
  video_tutorials?: {
    title: string;
    url: string;
    description?: string;
  }[];
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
