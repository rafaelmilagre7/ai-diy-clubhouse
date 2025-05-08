
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";

// Interface simplificada para os cursos
interface Course {
  id: string;
  title: string;
  coverImageUrl: string;
  slug?: string;
  created_at: string;
}

// Componente simplificado de carrossel
const CoursesCarousel = ({ title, courses }: { title: string, courses: Course[] }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={course.coverImageUrl || 'https://placehold.co/300x200'} 
              alt={course.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600">
                {new Date(course.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MemberLearningPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        // Buscar cursos
        const { data, error } = await supabase
          .from('learning_courses')
          .select(`
            id, 
            title, 
            cover_image_url, 
            slug, 
            created_at
          `)
          .eq('published', true)
          .order('order_index');

        if (error) throw error;
        
        const formattedCourses = (data || []).map(course => ({
          id: course.id,
          title: course.title,
          coverImageUrl: course.cover_image_url || 'https://placehold.co/400x600/0ABAB5/white?text=Curso',
          slug: course.slug,
          created_at: course.created_at
        }));

        setCourses(formattedCourses);
      } catch (error: any) {
        console.error('Erro ao carregar cursos:', error);
        toast.error('Erro ao carregar cursos', {
          description: error.message || 'Não foi possível carregar os cursos. Tente novamente mais tarde.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Minha Formação</h1>
      
      {loading ? (
        <div className="space-y-8">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      ) : courses.length > 0 ? (
        <CoursesCarousel
          title="Cursos Disponíveis"
          courses={courses}
        />
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400">Nenhum curso disponível no momento.</p>
          <p className="mt-2 text-gray-500">Novos cursos serão adicionados em breve!</p>
        </div>
      )}
    </div>
  );
};

export default MemberLearningPage;
