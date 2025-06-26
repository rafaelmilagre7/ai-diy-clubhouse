
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

// Learning Management System types
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'];
export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type LearningCertificate = Database['public']['Tables']['learning_certificates']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];

// Solution types (if they exist in your database)
export type Solution = any; // Define based on your actual schema
export type Module = any; // Define based on your actual schema
export type Progress = any; // Define based on your actual schema
export type UserChecklist = any; // Define based on your actual schema
export type SolutionResource = any; // Define based on your actual schema
export type SolutionTool = any; // Define based on your actual schema
export type ImplementationCheckpoint = any; // Define based on your actual schema

// Tool types (if they exist in your database)
export type Tool = any; // Define based on your actual schema
export type ToolCategory = any; // Define based on your actual schema

// Forum types
export type ForumTopic = Database['public']['Tables']['forum_topics']['Row'];
export type ForumPost = Database['public']['Tables']['forum_posts']['Row'];
export type ForumCategory = Database['public']['Tables']['forum_categories']['Row'];

// Event types
export type Event = Database['public']['Tables']['events']['Row'];
export type EventAccessControl = Database['public']['Tables']['event_access_control']['Row'];

// Role and permission types
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type PermissionDefinition = any; // Define based on your actual schema
export type RolePermission = any; // Define based on your actual schema
export type CourseAccessControl = Database['public']['Tables']['course_access_control']['Row'];

// Analytics and audit types
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type Analytics = Database['public']['Tables']['analytics']['Row'];

// Invite types (if they exist in your database)
export type Invite = any; // Define based on your actual schema
export type InviteDelivery = any; // Define based on your actual schema

// Communication types
export type AdminCommunication = Database['public']['Tables']['admin_communications']['Row'];
export type NotificationPreference = any; // Define based on your actual schema

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
