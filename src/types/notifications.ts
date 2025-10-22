/**
 * 🔔 SISTEMA UNIFICADO DE NOTIFICAÇÕES
 * 
 * Tipos padronizados para todas as notificações da plataforma.
 * Centraliza e organiza todos os tipos de notificação em categorias claras.
 */

// ============================================
// TIPOS PADRONIZADOS DE NOTIFICAÇÃO
// ============================================

export type NotificationType = 
  // COMUNIDADE
  | 'community_reply'
  | 'community_post_liked'
  | 'community_mention'
  | 'community_topic_solved'
  
  // ENGAJAMENTO
  | 'comment_liked'
  | 'comment_replied'
  | 'content_shared'
  
  // NETWORKING/SOCIAL
  | 'connection_request'
  | 'connection_accepted'
  | 'connection_suggestion'
  | 'profile_viewed'
  
  // EVENTOS
  | 'event_created'
  | 'event_reminder_24h'
  | 'event_reminder_1h'
  | 'event_starting'
  | 'event_completed'
  | 'event_certificate_ready'
  | 'event_material_available'
  | 'event_cancelled'
  | 'event_updated'
  | 'event_friend_registered'
  
  // FORMAÇÕES/CURSOS
  | 'course_available'
  | 'course_reminder'
  | 'lesson_available'
  | 'course_milestone'
  | 'course_completed'
  | 'course_certificate_ready'
  | 'lesson_comment'
  | 'peer_completed_course'
  | 'new_course_material'
  
  // SOLUÇÕES/FERRAMENTAS
  | 'solution_available'
  | 'solution_updated'
  | 'solution_comment'
  | 'solution_implementation_started'
  | 'solution_completed'
  | 'solution_certificate_ready'
  | 'solution_popular_network'
  | 'solution_recommended'
  
  // SUGESTÕES
  | 'suggestion_approved'
  | 'suggestion_rejected'
  | 'suggestion_comment_added'
  | 'suggestion_liked'
  | 'suggestion_status_update'
  
  // SISTEMA
  | 'system_announcement'
  | 'system_maintenance'
  | 'system_update'
  | 'welcome_message'
  | 'onboarding_step'
  
  // IA/INTELIGÊNCIA
  | 'ai_recommendation'
  | 'ai_insight'
  | 'ai_suggestion'
  | 'ai_report_ready';

// ============================================
// CATEGORIAS DE NOTIFICAÇÃO
// ============================================

export type NotificationCategory =
  | 'community'      // Comunidade e discussões
  | 'engagement'     // Curtidas, comentários, compartilhamentos
  | 'social'         // Conexões e networking
  | 'events'         // Eventos e webinars
  | 'learning'       // Cursos e formações
  | 'solutions'      // Ferramentas e soluções
  | 'suggestions'    // Sugestões de melhorias
  | 'system'         // Avisos do sistema
  | 'ai';            // Recomendações e insights de IA

// ============================================
// TIPOS DE REFERÊNCIA
// ============================================

export type NotificationReferenceType =
  | 'community_topic'
  | 'community_post'
  | 'comment'
  | 'connection'
  | 'profile'
  | 'event'
  | 'course'
  | 'lesson'
  | 'solution'
  | 'suggestion'
  | 'certificate'
  | 'announcement';

// ============================================
// PRIORIDADES
// ============================================

export type NotificationPriority = 0 | 1 | 2 | 3;

export const NOTIFICATION_PRIORITY = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  URGENT: 3,
} as const;

// ============================================
// INTERFACE PRINCIPAL
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  actor_id?: string;
  
  // Tipo e categoria
  type: NotificationType;
  category?: NotificationCategory;
  
  // Conteúdo
  title: string;
  message: string;
  
  // Estado
  is_read: boolean;
  read_at?: string;
  
  // Referência
  reference_id?: string;
  reference_type?: NotificationReferenceType;
  
  // Navegação
  action_url?: string;
  
  // Metadata
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
  
  // Timestamps
  created_at: string;
  updated_at?: string;
  expires_at?: string;
  
  // Relacionamentos (populados via JOIN)
  actor?: {
    id: string;
    name: string;
    avatar_url?: string;
    company_name?: string;
    current_position?: string;
  };
  
  // Agrupamento (calculado no frontend)
  grouped_count?: number;
  grouped_ids?: string[];
  grouped_actors?: Array<{
    id: string;
    name: string;
    avatar_url?: string;
  }>;
}

// ============================================
// MAPEAMENTO CATEGORIA -> TIPOS
// ============================================

export const NOTIFICATION_TYPES_BY_CATEGORY: Record<NotificationCategory, NotificationType[]> = {
  community: [
    'community_reply',
    'community_post_liked',
    'community_mention',
    'community_topic_solved',
  ],
  engagement: [
    'comment_liked',
    'comment_replied',
    'content_shared',
  ],
  social: [
    'connection_request',
    'connection_accepted',
    'connection_suggestion',
    'profile_viewed',
  ],
  events: [
    'event_created',
    'event_reminder_24h',
    'event_reminder_1h',
    'event_starting',
    'event_completed',
    'event_certificate_ready',
    'event_material_available',
    'event_cancelled',
    'event_updated',
    'event_friend_registered',
  ],
  learning: [
    'course_available',
    'course_reminder',
    'lesson_available',
    'course_milestone',
    'course_completed',
    'course_certificate_ready',
    'lesson_comment',
    'peer_completed_course',
    'new_course_material',
  ],
  solutions: [
    'solution_available',
    'solution_updated',
    'solution_comment',
    'solution_implementation_started',
    'solution_completed',
    'solution_certificate_ready',
    'solution_popular_network',
    'solution_recommended',
  ],
  suggestions: [
    'suggestion_approved',
    'suggestion_rejected',
    'suggestion_comment_added',
    'suggestion_liked',
    'suggestion_status_update',
  ],
  system: [
    'system_announcement',
    'system_maintenance',
    'system_update',
    'welcome_message',
    'onboarding_step',
  ],
  ai: [
    'ai_recommendation',
    'ai_insight',
    'ai_suggestion',
    'ai_report_ready',
  ],
};

// ============================================
// HELPERS
// ============================================

/**
 * Retorna a categoria baseada no tipo de notificação
 */
export function getCategoryFromType(type: NotificationType): NotificationCategory {
  for (const [category, types] of Object.entries(NOTIFICATION_TYPES_BY_CATEGORY)) {
    if (types.includes(type)) {
      return category as NotificationCategory;
    }
  }
  return 'system'; // fallback
}

/**
 * Retorna ícone padrão para cada categoria
 */
export function getCategoryIcon(category: NotificationCategory): string {
  const icons: Record<NotificationCategory, string> = {
    community: '💬',
    engagement: '❤️',
    social: '👥',
    events: '📅',
    learning: '📚',
    solutions: '🛠️',
    suggestions: '💡',
    system: '🔔',
    ai: '🤖',
  };
  return icons[category] || '🔔';
}

/**
 * Retorna cor padrão para cada categoria (para badges)
 */
export function getCategoryColor(category: NotificationCategory): string {
  const colors: Record<NotificationCategory, string> = {
    community: 'hsl(var(--aurora-primary))',
    engagement: 'hsl(var(--accent))',
    social: 'hsl(var(--aurora-secondary))',
    events: 'hsl(var(--warning))',
    learning: 'hsl(var(--info))',
    solutions: 'hsl(var(--success))',
    suggestions: 'hsl(var(--aurora-accent))',
    system: 'hsl(var(--muted-foreground))',
    ai: 'hsl(var(--aurora-primary))',
  };
  return colors[category] || 'hsl(var(--muted))';
}

/**
 * Retorna label amigável para categoria
 */
export function getCategoryLabel(category: NotificationCategory): string {
  const labels: Record<NotificationCategory, string> = {
    community: 'Comunidade',
    engagement: 'Engajamento',
    social: 'Conexões',
    events: 'Eventos',
    learning: 'Aprendizado',
    solutions: 'Soluções',
    suggestions: 'Sugestões',
    system: 'Sistema',
    ai: 'IA',
  };
  return labels[category] || 'Notificação';
}
