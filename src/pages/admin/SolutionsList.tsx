
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SimplifiedSolution } from '@/lib/supabase/types';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SolutionsList = () => {
  const [solutions, setSolutions] = useState<SimplifiedSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const { data, error } = await supabase
          .from('solutions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedSolutions = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          difficulty: item.difficulty_level || 'medium',
          difficulty_level: item.difficulty_level,
          thumbnail_url: item.thumbnail_url,
          cover_image_url: item.thumbnail_url || '',
          published: Boolean(item.published), // Use published field directly
          slug: item.slug || item.title?.toLowerCase().replace(/\s+/g, '-') || '', // Use slug field or generate
          created_at: item.created_at,
          updated_at: item.updated_at,
          tags: item.tags || [],
          estimated_time_hours: item.estimated_time_hours,
          roi_potential: item.roi_potential,
          implementation_steps: item.implementation_steps,
          required_tools: item.required_tools,
          expected_results: item.expected_results || item.description || '', // Use expected_results field
          success_metrics: item.success_metrics || item.roi_potential || '', // Use success_metrics field
          target_audience: item.target_audience || item.description || '', // Use target_audience field
          prerequisites: item.prerequisites || item.description || '' // Use prerequisites field
        }));

        setSolutions(transformedSolutions);
      } catch (error) {
        console.error('Erro ao carregar soluções:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, []);

  if (loading) {
    return <LoadingScreen message="Carregando soluções..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Soluções</h1>
        <Button onClick={() => navigate('/admin/solutions/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Solução
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {solutions.map((solution) => (
          <div 
            key={solution.id} 
            className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/admin/solutions/${solution.id}`)}
          >
            <h3 className="font-semibold text-lg mb-2">{solution.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{solution.description}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Categoria: {solution.category}</span>
              <span>{solution.published ? 'Publicado' : 'Rascunho'}</span>
            </div>
          </div>
        ))}
      </div>
      
      {solutions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma solução encontrada.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/admin/solutions/new')}
          >
            Criar primeira solução
          </Button>
        </div>
      )}
    </div>
  );
};

export default SolutionsList;
