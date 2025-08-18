import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

export const useCourseIndividualAccess = (courseId: string) => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id || !courseId) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Admin sempre tem acesso
      if (isAdmin) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Verificar acesso usando a função RPC
        const { data, error } = await supabase.rpc('can_access_course', {
          p_course_id: courseId,
          p_user_id: user.id
        });

        if (error) {
          console.error('Erro ao verificar acesso ao curso:', error);
          setHasAccess(false);
        } else {
          setHasAccess(data || false);
        }

      } catch (error) {
        console.error('Erro ao verificar acesso ao curso:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [courseId, user?.id, isAdmin]);

  return { hasAccess, loading };
};