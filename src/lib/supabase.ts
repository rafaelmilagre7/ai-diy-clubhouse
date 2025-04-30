// Central export file for all Supabase related exports

// Re-export the Supabase client
import { supabase, signOut, incrementVoteCount, decrementVoteCount } from './supabase/client';

// Re-export all types
import type {
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
  decrementVoteCount
};

// Export types correctly with 'export type' for isolatedModules
export type {
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
