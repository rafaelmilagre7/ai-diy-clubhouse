
// Tipos adicionais para tabelas que não estão na definição principal do Supabase
export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface SolutionTool {
  id: string;
  solution_id: string;
  tool_name: string;
  tool_url?: string;
  is_required: boolean;
  created_at: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  official_url: string;
  category: string;
  logo_url?: string;
  tags?: string[];
  video_url?: string;
  video_type?: string;
  status?: boolean;
  created_at: string;
  updated_at: string;
  has_member_benefit?: boolean;
  benefit_type?: string;
  benefit_title?: string;
  benefit_description?: string;
  benefit_link?: string;
  benefit_badge_url?: string;
  benefit_clicks?: number;
}
