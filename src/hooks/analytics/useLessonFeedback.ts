
import { useState, useEffect } from 'react';

interface LessonFeedback {
  id: string;
  lesson_title: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const useLessonFeedback = () => {
  const [feedback, setFeedback] = useState<LessonFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data
    const mockFeedback: LessonFeedback[] = [
      {
        id: '1',
        lesson_title: 'Introdução ao AI',
        user_name: 'João Silva',
        rating: 5,
        comment: 'Excelente aula!',
        created_at: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setFeedback(mockFeedback);
      setLoading(false);
    }, 1000);
  }, []);

  return { feedback, loading, error };
};
