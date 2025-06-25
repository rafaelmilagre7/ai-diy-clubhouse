
import { useState, useEffect } from 'react';

interface FeedbackData {
  id: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  feedback: string;
  createdAt: string;
  userName: string;
}

export const useLessonFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data
    const mockFeedback: FeedbackData[] = [
      {
        id: '1',
        lessonId: '1',
        lessonTitle: 'Introdução ao AI',
        score: 5,
        feedback: 'Excelente aula!',
        createdAt: new Date().toISOString(),
        userName: 'João Silva'
      }
    ];

    setTimeout(() => {
      setFeedback(mockFeedback);
      setLoading(false);
    }, 1000);
  }, []);

  return { feedback, loading, error };
};
