
import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

// Simplified interfaces to avoid type depth issues
interface SimpleModule {
  id: string;
  solution_id: string;
  title: string;
  content: any;
  type: string;
  module_order: number;
  estimated_time_minutes: number;
}

interface SimpleProgress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: string | null;
  progress_percentage: number;
  is_completed: boolean;
  completed_modules: string[];
  last_activity: string;
}

export const useModuleImplementation = (solutionId: string) => {
  const { user } = useSimpleAuth();
  const [modules, setModules] = useState<SimpleModule[]>([]);
  const [currentModule, setCurrentModule] = useState<SimpleModule | null>(null);
  const [nextModule, setNextModule] = useState<SimpleModule | null>(null);
  const [progress, setProgress] = useState<SimpleProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = async () => {
    try {
      console.log('Buscando módulos para solução:', solutionId);
      
      // Mock data since modules table may not have expected structure
      const mockModules: SimpleModule[] = [
        {
          id: '1',
          solution_id: solutionId,
          title: 'Introdução',
          content: { type: 'text', blocks: [] },
          type: 'introduction',
          module_order: 1,
          estimated_time_minutes: 15
        },
        {
          id: '2',
          solution_id: solutionId,
          title: 'Implementação',
          content: { type: 'text', blocks: [] },
          type: 'implementation',
          module_order: 2,
          estimated_time_minutes: 30
        }
      ];

      setModules(mockModules);
      
      if (mockModules.length > 0) {
        setCurrentModule(mockModules[0]);
        if (mockModules.length > 1) {
          setNextModule(mockModules[1]);
        }
      }

    } catch (err: any) {
      console.error('Erro ao buscar módulos:', err);
      setError(err.message);
      setModules([]);
    }
  };

  const fetchProgress = async () => {
    if (!user?.id) return;

    try {
      console.log('Buscando progresso para usuário:', user.id);
      
      // Mock progress data
      const mockProgress: SimpleProgress = {
        id: '1',
        user_id: user.id,
        solution_id: solutionId,
        current_module: '1',
        progress_percentage: 25,
        is_completed: false,
        completed_modules: [],
        last_activity: new Date().toISOString()
      };

      setProgress(mockProgress);

    } catch (err: any) {
      console.error('Erro ao buscar progresso:', err);
      setError(err.message);
    }
  };

  const markModuleAsCompleted = async (moduleId: string) => {
    if (!progress) return;

    try {
      console.log('Marcando módulo como concluído:', moduleId);
      
      const updatedProgress = {
        ...progress,
        completed_modules: [...progress.completed_modules, moduleId],
        progress_percentage: Math.min(100, progress.progress_percentage + 25)
      };

      setProgress(updatedProgress);
      
      // Move to next module if available
      const currentIndex = modules.findIndex(m => m.id === moduleId);
      if (currentIndex >= 0 && currentIndex < modules.length - 1) {
        setCurrentModule(modules[currentIndex + 1]);
        if (currentIndex + 2 < modules.length) {
          setNextModule(modules[currentIndex + 2]);
        } else {
          setNextModule(null);
        }
      }

    } catch (err: any) {
      console.error('Erro ao marcar módulo como concluído:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      if (!solutionId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchModules(),
          fetchProgress()
        ]);
      } catch (err: any) {
        console.error('Erro ao inicializar dados:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [solutionId, user?.id]);

  return {
    modules,
    currentModule,
    nextModule,
    progress,
    loading,
    error,
    markModuleAsCompleted,
    refetch: () => {
      fetchModules();
      fetchProgress();
    }
  };
};
