
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url: string;
  is_active: boolean;
  status: boolean;
  created_at: string;
  updated_at: string;
  official_url: string;
  tags: string[];
  benefit_title: string | null;
  benefit_type: 'discount' | 'free_trial' | 'exclusive_access';
  benefit_description: string | null;
  benefit_link: string | null;
  benefit_discount_percentage: number | null;
  has_member_benefit: boolean;
  features: string[];
  pricing_info: any;
  // Campos adicionais para compatibilidade
  has_valid_logo?: boolean;
  is_access_restricted?: boolean;
  has_access?: boolean;
}
