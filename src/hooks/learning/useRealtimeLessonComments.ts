
import { useEffect } from 'react';

export const useRealtimeLessonComments = (lessonId: string) => {
  useEffect(() => {
    if (!lessonId) return;
    
    console.log('Simulando realtime comments para lesson:', lessonId);
    
    // Mock realtime subscription
    return () => {
      console.log('Cleanup realtime comments subscription');
    };
  }, [lessonId]);
};
