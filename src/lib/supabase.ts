
// Central export file for all Supabase related exports

// Re-export the Supabase client
import { supabase, signOut, incrementVoteCount, decrementVoteCount } from './supabase/client';

// Re-export all types
import {
  UserRole,
  UserProfile,
  Solution,
  Module,
  Progress,
  UserChecklist,
  LearningCourse,
  LearningModule,
  LearningLesson,
  LearningProgress,
  LearningResource,
  LearningLessonVideo,
  LearningComment,
  LearningCertificate
} from './supabase/types';

// Export everything
export {
  // Client and utility functions
  supabase,
  signOut,
  incrementVoteCount,
  decrementVoteCount,
  
  // Types
  UserRole,
  UserProfile,
  Solution,
  Module,
  Progress,
  UserChecklist,
  LearningCourse,
  LearningModule,
  LearningLesson,
  LearningProgress,
  LearningResource,
  LearningLessonVideo,
  LearningComment,
  LearningCertificate
};

// Also export the LearningLesson interface from this file for backward compatibility
export interface LearningLesson {
  id: string;
  title: string;
  description?: string;
  module_id: string;
  content?: any;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  cover_image_url?: string;
  estimated_time_minutes?: number;
  ai_assistant_enabled?: boolean;
  ai_assistant_prompt?: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  cover_image_url?: string;
}

export interface LearningResource {
  id: string;
  name: string;
  description?: string;
  file_url: string;
  file_type?: string;
  file_size_bytes?: number;
  lesson_id: string;
  order_index: number;
  created_at: string;
}

export interface LearningLessonVideo {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  lesson_id: string;
  order_index: number;
  created_at: string;
}
