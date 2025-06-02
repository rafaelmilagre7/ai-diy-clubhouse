
import React from 'react';
import { MemberLearningHeader } from '@/components/learning/member/MemberLearningHeader';
import { MemberCoursesList } from '@/components/learning/member/MemberCoursesList';
import { useLearningCourses } from '@/hooks/learning/useLearningCourses';
import { useUserProgress } from '@/hooks/learning/useUserProgress';

const LearningPage = () => {
  const { courses, isLoading: coursesLoading } = useLearningCourses();
  const { userProgress, isLoading: progressLoading } = useUserProgress();

  const isLoading = coursesLoading || progressLoading;

  return (
    <div className="container py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <MemberLearningHeader />
        
        <div className="mt-8">
          <MemberCoursesList 
            courses={courses}
            userProgress={userProgress || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
