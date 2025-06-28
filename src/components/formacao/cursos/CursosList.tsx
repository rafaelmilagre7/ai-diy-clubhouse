
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Users, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CourseData {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  thumbnail_url: string;
  instructor_id: string;
  category: string;
  difficulty_level: string;
  estimated_duration_hours: number;
}

const CursosList = () => {
  const [cursos, setCursos] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the data to match our CourseData interface
      const mappedData: CourseData[] = data.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        is_published: course.is_published || false,
        created_at: course.created_at,
        updated_at: course.updated_at,
        thumbnail_url: course.thumbnail_url || '',
        instructor_id: course.instructor_id || '',
        category: 'Geral',
        difficulty_level: 'Intermediário',
        estimated_duration_hours: course.estimated_duration_hours || 0
      }));

      setCursos(mappedData);
    } catch (error: any) {
      console.error('Erro ao buscar cursos:', error);
      toast.error('Erro ao carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (curso: CourseData) => {
    try {
      const { error } = await supabase
        .from('learning_courses')
        .update({ is_published: !curso.is_published })
        .eq('id', curso.id);

      if (error) throw error;

      setCursos(cursos.map(c => 
        c.id === curso.id 
          ? { ...c, is_published: !c.is_published }
          : c
      ));

      toast.success(`Curso ${curso.is_published ? 'despublicado' : 'publicado'} com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do curso');
    }
  };

  const getStatusBadge = (published: boolean) => {
    return published ? (
      <Badge variant="default" className="bg-green-500">
        Publicado
      </Badge>
    ) : (
      <Badge variant="secondary">
        Rascunho
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-[#0ABAB5] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Cursos</h2>
          <p className="text-gray-600">Gerencie seus cursos de formação</p>
        </div>
        <Button 
          onClick={() => navigate('/formacao/cursos/novo')}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Curso
        </Button>
      </div>

      {cursos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum curso encontrado</h3>
            <p className="text-gray-500 mb-4">Comece criando seu primeiro curso de formação.</p>
            <Button 
              onClick={() => navigate('/formacao/cursos/novo')}
              className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Curso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <Card key={curso.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{curso.title}</CardTitle>
                  {getStatusBadge(curso.is_published)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {curso.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>0 alunos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{curso.estimated_duration_hours}h</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/formacao/cursos/${curso.id}`)}
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusToggle(curso)}
                    className="flex-1"
                  >
                    {curso.is_published ? 'Despublicar' : 'Publicar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CursosList;
