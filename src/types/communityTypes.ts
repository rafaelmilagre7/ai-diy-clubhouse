
export type CommunityFilterType = "recentes" | "populares" | "sem-respostas" | "resolvidos";

export interface CommunityFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: CommunityFilterType;
  onFilterChange: (filter: CommunityFilterType) => void;
}

export interface UseCommunityTopicsParams {
  activeTab: "all" | "my-topics";
  selectedFilter: CommunityFilterType;
  searchQuery: string;
  categorySlug?: string;
}

// Tipos consolidados da comunidade
export interface CommunityCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  topic_count?: number;
  color?: string;
  icon?: string;
  order?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string | null;
  role?: string;
  user_id?: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar_url?: string | null;
  email?: string;
  role?: string;
  role_id?: string;
  company_name?: string;
  industry?: string;
  created_at: string;
  updated_at: string;
  user_roles?: {
    id: string;
    name: string;
    description?: string | null;
    permissions?: any;
  } | null;
}

export interface CommunityTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  category_id: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  last_activity_at: string;
  profiles?: UserProfile | null;
  category?: CommunityCategory | null;
}

export interface CommunityPost {
  id: string;
  content: string;
  user_id: string;
  topic_id: string;
  created_at: string;
  updated_at: string;
  profiles?: UserProfile | null;
  is_accepted_solution?: boolean;
  parent_id?: string | null;
}
