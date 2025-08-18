import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useSolutionsAccess = () => {
  const { user, isAdmin } = useAuth();
  const [hasSolutionsAccess, setHasSolutionsAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSolutionsAccess = async () => {
      if (!user?.id) {
        setHasSolutionsAccess(false);
        setLoading(false);
        return;
      }

      // Admin sempre tem acesso
      if (isAdmin) {
        setHasSolutionsAccess(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('user_has_solutions_access', {
          check_user_id: user.id
        });

        if (error) {
          console.error('Erro ao verificar acesso a soluções:', error);
          setHasSolutionsAccess(false);
        } else {
          setHasSolutionsAccess(data || false);
        }
      } catch (error) {
        console.error('Erro ao verificar acesso a soluções:', error);
        setHasSolutionsAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkSolutionsAccess();
  }, [user?.id, isAdmin]);

  return {
    hasSolutionsAccess,
    loading
  };
};