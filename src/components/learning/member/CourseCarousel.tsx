import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Eye, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface CourseData {
  id: string;
  title: string;
  description: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  cover_image_url: string;
  instructor_id: string;
  category: string;
  difficulty_level: string;
  estimated_hours: number;
}

const CourseCarousel = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
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
        published: course.published || false,
        created_at: course.created_at,
        updated_at: course.updated_at,
        cover_image_url: course.cover_image_url || '',
        instructor_id: course.created_by || '',
        category: 'Geral',
        difficulty_level: 'Intermediário',
        estimated_hours: 0
      }));

      setCursos(mappedData);
    } catch (error: any) {
      console.error('Erro ao buscar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const featuredCourses = courses.filter(course => course.published).slice(0, 6);

  if (loading) {
    return <p>Carregando cursos...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Cursos em Destaque</h2>
          <p className="text-gray-600">Confira nossos cursos mais populares</p>
        </div>
        <Button onClick={() => navigate('/formacao/cursos')} variant="outline">
          Ver todos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {featuredCourses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum curso em destaque</h3>
            <p className="text-gray-500 mb-4">Volte mais tarde para conferir os cursos mais populares.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((curso) => (
            <Card key={curso.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{curso.title}</CardTitle>
                  <Badge variant={curso.published ? "default" : "secondary"}>
                    {curso.published ? "Publicado" : "Rascunho"}
                  </Badge>
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
                    <span>{curso.estimated_hours}h</span>
                  </div>
                </div>
              </CardContent>
              <Button onClick={() => navigate(`/formacao/cursos/${curso.id}`)} className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCarousel;
