
import { Database } from './database.types';

// Export all database types
export * from './database.types';

// Main table row types with enhanced UserProfile
export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  user_roles?: {
    id: string;
    name: string;
    description?: string;
    permissions?: any;
    is_system?: boolean;
  } | null;
};

// Progress type
export type Progress = Database['public']['Tables']['progress']['Row'];

// Solutions and Modules
export type Solution = Database['public']['Tables']['solutions']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type Tool = Database['public']['Tables']['tools']['Row'];

// Learning Management System types
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'];
export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type LearningCertificate = Database['public']['Tables']['learning_certificates']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];
export type LearningLessonNps = Database['public']['Tables']['learning_lesson_nps']['Row'];

// Event types
export type Event = Database['public']['Tables']['events']['Row'];
export type EventAccessControl = Database['public']['Tables']['event_access_control']['Row'];

// Access control types
export type CourseAccessControl = Database['public']['Tables']['course_access_control']['Row'];
export type BenefitAccessControl = Database['public']['Tables']['benefit_access_control']['Row'];

// Permission types
export type PermissionDefinition = Database['public']['Tables']['permission_definitions']['Row'];
export type RolePermission = Database['public']['Tables']['role_permissions']['Row'];

// Analytics types
export type OnboardingAnalytics = Database['public']['Tables']['onboarding_analytics']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

// User role types
export type UserRole = Database['public']['Tables']['user_roles']['Row'];

// Notification types
export type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];

// Onboarding types
export type OnboardingSync = Database['public']['Tables']['onboarding_sync']['Row'];
export type QuickOnboarding = Database['public']['Tables']['quick_onboarding']['Row'];

// Invitation types
export type Invite = Database['public']['Tables']['invites']['Row'];

// Implementation types
export type ImplementationCheckpoint = Database['public']['Tables']['implementation_checkpoints']['Row'];
export type SolutionResource = Database['public']['Tables']['solution_resources']['Row'];

// Additional types for implementation system
export type SolutionTool = {
  id: string;
  solution_id: string;
  tool_id: string;
  is_required: boolean;
  order_index: number;
  created_at: string;
};

export type UserChecklist = {
  id: string;
  user_id: string;
  solution_id: string;
  checklist_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
};

// Utility function to get user role name safely
export const getUserRoleName = (profile: UserProfile | null): string => {
  if (!profile) return 'guest';
  
  if (profile.user_roles && typeof profile.user_roles === 'object' && 'name' in profile.user_roles) {
    return profile.user_roles.name || 'member';
  }
  
  return 'member';
};

// Helper functions for role checking
export const isAdminRole = (profile: any): boolean => {
  return profile?.user_roles?.name === 'admin';
};

export const isFormacaoRole = (profile: any): boolean => {
  return profile?.user_roles?.name === 'formacao';
};
