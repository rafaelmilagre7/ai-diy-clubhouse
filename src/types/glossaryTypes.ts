export interface GlossaryCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order_index?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface GlossaryTerm {
  id: string;
  title: string;
  slug: string;
  definition: string;
  short_definition?: string;
  category_id?: string;
  tags?: string[];
  related_terms?: string[];
  synonyms?: string[];
  examples?: string[];
  difficulty_level?: 'iniciante' | 'intermediario' | 'avancado';
  reading_time_minutes?: number;
  view_count?: number;
  is_featured?: boolean;
  is_published?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface GlossaryTermWithCategory extends GlossaryTerm {
  category_name?: string;
  category_slug?: string;
  category_color?: string;
  category_icon?: string;
  author_name?: string;
  author_avatar?: string;
}

export interface GlossaryTermRelation {
  id: string;
  term_id: string;
  related_term_id: string;
  relation_type: 'related' | 'prerequisite' | 'next_step';
  created_at: string;
}