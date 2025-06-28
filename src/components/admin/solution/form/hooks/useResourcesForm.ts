
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Resource {
  id?: string;
  name: string;
  type: string;
  url: string;
  description?: string;
}

export const useResourcesForm = (solutionId?: string) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addResource = useCallback((resource: Omit<Resource, 'id'>) => {
    const newResource: Resource = {
      ...resource,
      id: `temp-${Date.now()}-${Math.random()}`
    };
    setResources(prev => [...prev, newResource]);
  }, []);

  const updateResource = useCallback((index: number, updates: Partial<Resource>) => {
    setResources(prev => 
      prev.map((resource, i) => 
        i === index ? { ...resource, ...updates } : resource
      )
    );
  }, []);

  const removeResource = useCallback((index: number) => {
    setResources(prev => prev.filter((_, i) => i !== index));
  }, []);

  const saveResources = useCallback(async () => {
    if (!solutionId) {
      toast.error('ID da solução não fornecido');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Simular salvamento de recursos (implementar conforme necessário)
      console.log('Salvando recursos:', resources);
      
      // Aqui você implementaria a lógica real de salvamento
      // Por exemplo, salvar em uma tabela de recursos
      
      toast.success('Recursos salvos com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao salvar recursos: ' + errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [solutionId, resources]);

  const loadResources = useCallback(async () => {
    if (!solutionId) return;

    setLoading(true);
    try {
      // Simular carregamento de recursos
      console.log('Carregando recursos para solução:', solutionId);
      
      // Implementar lógica de carregamento conforme necessário
      setResources([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar recursos:', err);
    } finally {
      setLoading(false);
    }
  }, [solutionId]);

  return {
    resources,
    loading,
    error,
    addResource,
    updateResource,
    removeResource,
    saveResources,
    loadResources,
    setResources
  };
};
