
export interface Comment {
  id: string;
  tool_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  parent_id?: string | null;
  user_has_liked?: boolean;
  // Informações do perfil do usuário que fez o comentário
  profiles?: {
    name: string;
    avatar_url?: string;
    role?: string;
  };
  // Comentários aninhados (respostas a este comentário)
  replies?: Comment[];
}

export interface CommentFormData {
  content: string;
  tool_id: string;
  parent_id?: string;
  images?: File[];
}
