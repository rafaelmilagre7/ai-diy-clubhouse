
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

// Solution types
export type Solution = Database['public']['Tables']['solutions']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type Progress = Database['public']['Tables']['progress']['Row'];
export type Tool = Database['public']['Tables']['tools']['Row'];

// Analytics types
export type Analytics = Database['public']['Tables']['analytics']['Row'];
export type OnboardingAnalytics = Database['public']['Tables']['onboarding_analytics']['Row'];
export type OnboardingSync = Database['public']['Tables']['onboarding_sync']['Row'];
export type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];
export type QuickOnboarding = Database['public']['Tables']['quick_onboarding']['Row'];

// User role types
export type UserRole = Database['public']['Tables']['user_roles']['Row'];

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
