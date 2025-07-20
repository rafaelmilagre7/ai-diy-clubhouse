
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
  is_active?: boolean;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  name: string | null;
  avatar_url?: string | null;
  role?: string;
  user_id?: string;
  email?: string;
  company_name?: string;
  industry?: string;
  created_at?: string;
  updated_at?: string;
  user_roles?: {
    id: string;
    name: string;
    description?: string | null;
    permissions?: any;
  } | null;
}

// Alias para compatibilidade
export type Profile = UserProfile;

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

// Alias para compatibilidade
export type Topic = CommunityTopic;

export interface CommunityPost {
  id: string;
  content: string;
  user_id: string;
  topic_id: string;
  created_at: string;
  updated_at: string;
  profiles?: UserProfile | null;
  is_accepted_solution?: boolean;
  is_solution?: boolean; // Alias para compatibilidade
  parent_id?: string | null;
  is_hidden?: boolean;
}

// Alias para compatibilidade
export type Post = CommunityPost;
