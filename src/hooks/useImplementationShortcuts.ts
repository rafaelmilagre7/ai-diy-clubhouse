
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { Solution } from '@/lib/supabase';

export const useImplementationShortcuts = (
  solution: Solution | null
) => {
  const navigate = useNavigate();
  
  // Add keyboard shortcut for escape only
  useHotkeys('Escape', () => {
    if (solution) {
      navigate(`/solution/${solution.id}`);
    } else {
      navigate("/dashboard");
    }
  }, [solution, navigate]);
};
