
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { Solution } from '@/lib/supabase';

export const useImplementationShortcuts = (
  solution: Solution | null,
  moduleIdx: number,
  modules: any[],
  handleComplete: () => void,
  handlePrevious: () => void
) => {
  const navigate = useNavigate();
  
  // Add keyboard shortcuts for navigation
  useHotkeys('ArrowRight', () => {
    if (moduleIdx < modules.length - 1) {
      handleComplete();
    }
  }, [moduleIdx, modules, handleComplete]);
  
  useHotkeys('ArrowLeft', () => {
    handlePrevious();
  }, [handlePrevious]);
  
  useHotkeys('Escape', () => {
    if (solution) {
      navigate(`/solution/${solution.id}`);
    } else {
      navigate("/dashboard");
    }
  }, [solution, navigate]);
};
