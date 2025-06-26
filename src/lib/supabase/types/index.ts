import { Database } from './database.types';

// Tipos de tabelas principais - TODOS OS TIPOS NECESSÁRIOS
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'];
export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type LearningCertificate = Database['public']['Tables']['learning_certificates']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];
export type LearningCommentLike = Database['public']['Tables']['learning_comment_likes']['Row'];
export type LearningLessonNps = Database['public']['Tables']['learning_lesson_nps']['Row'];
export type LearningLessonTool = Database['public']['Tables']['learning_lesson_tools']['Row'];

export type Solution = Database['public']['Tables']['solutions']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type Progress = Database['public']['Tables']['progress']['Row'];
export type CourseAccessControl = Database['public']['Tables']['course_access_control']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type PermissionDefinition = Database['public']['Tables']['permission_definitions']['Row'];
export type RolePermission = Database['public']['Tables']['role_permissions']['Row'];
export type ImplementationCheckpoint = Database['public']['Tables']['implementation_checkpoints']['Row'];
export type SolutionResource = Database['public']['Tables']['solution_resources']['Row'];
export type SolutionTool = Database['public']['Tables']['solution_tools']['Row'];
export type UserChecklist = Database['public']['Tables']['user_checklists']['Row'];
export type Tool = Database['public']['Tables']['tools']['Row'];
export type BenefitAccessControl = Database['public']['Tables']['benefit_access_control']['Row'];

// Forum types
export type ForumTopic = Database['public']['Tables']['forum_topics']['Row'];
export type ForumCategory = Database['public']['Tables']['forum_categories']['Row'];
export type ForumPost = Database['public']['Tables']['forum_posts']['Row'];
export type ForumReaction = Database['public']['Tables']['forum_reactions']['Row'];
export type ForumMention = Database['public']['Tables']['forum_mentions']['Row'];
export type ForumNotification = Database['public']['Tables']['forum_notifications']['Row'];

// Analytics and audit types
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type Analytics = Database['public']['Tables']['analytics']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type Invite = Database['public']['Tables']['invites']['Row'];
export type InviteDelivery = Database['public']['Tables']['invite_deliveries']['Row'];
export type InviteCampaign = Database['public']['Tables']['invite_campaigns']['Row'];
export type InviteBackup = Database['public']['Tables']['invite_backups']['Row'];
export type InviteAnalyticsEvent = Database['public']['Tables']['invite_analytics_events']['Row'];

// Community and social types
export type CommunityReport = Database['public']['Tables']['community_reports']['Row'];
export type DirectMessage = Database['public']['Tables']['direct_messages']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type MemberConnection = Database['public']['Tables']['member_connections']['Row'];
export type NetworkConnection = Database['public']['Tables']['network_connections']['Row'];
export type NetworkMatch = Database['public']['Tables']['network_matches']['Row'];
export type NetworkingPreference = Database['public']['Tables']['networking_preferences']['Row'];
export type ConnectionNotification = Database['public']['Tables']['connection_notifications']['Row'];
export type ConnectionRecommendation = Database['public']['Tables']['connection_recommendations']['Row'];

// Admin and moderation types
export type ModerationAction = Database['public']['Tables']['moderation_actions']['Row'];
export type ModerationSetting = Database['public']['Tables']['moderation_settings']['Row'];
export type AdminCommunication = Database['public']['Tables']['admin_communications']['Row'];
export type CommunicationDelivery = Database['public']['Tables']['communication_deliveries']['Row'];
export type CommunicationPreference = Database['public']['Tables']['communication_preferences']['Row'];
export type NotificationPreference = Database['public']['Tables']['notification_preferences']['Row'];
export type NotificationQueue = Database['public']['Tables']['notification_queue']['Row'];

// Implementation and profile types
export type ImplementationProfile = Database['public']['Tables']['implementation_profiles']['Row'];
export type ImplementationTrail = Database['public']['Tables']['implementation_trails']['Row'];
export type AutomatedIntervention = Database['public']['Tables']['automated_interventions']['Row'];
export type AutomationRule = Database['public']['Tables']['automation_rules']['Row'];

// Other types
export type Badge = Database['public']['Tables']['badges']['Row'];
export type BenefitClick = Database['public']['Tables']['benefit_clicks']['Row'];
export type CampaignInvite = Database['public']['Tables']['campaign_invites']['Row'];
export type EmailQueue = Database['public']['Tables']['email_queue']['Row'];
export type EventAccessControl = Database['public']['Tables']['event_access_control']['Row'];

// Tipo UserProfile com role join
export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  user_roles?: {
    id: string;
    name: string;
    description?: string;
    permissions?: any;
    is_system?: boolean;    
  } | null;
};

// Função helper para obter o nome do role do usuário de forma type-safe
export const getUserRoleName = (profile: UserProfile | null): string => {
  if (!profile) return 'guest';
  
  // Verificar se user_roles está disponível via JOIN
  if (profile.user_roles && typeof profile.user_roles === 'object' && 'name' in profile.user_roles) {
    return profile.user_roles.name || 'member';
  }
  
  // Fallback para role direto (caso exista)
  if ('role' in profile && typeof profile.role === 'string') {
    return profile.role;
  }
  
  return 'member';
};

// Re-exportar tipos do database
export * from './database.types';
