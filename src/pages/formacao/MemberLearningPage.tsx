
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import CoursesCarousel from '@/components/formacao/membro/CoursesCarousel';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { CardContent } from '@/components/ui/card';

type Course = {
  id: string;
  title: string;
  coverImageUrl: string;
  instructor?: string;
  date?: string;
  slug?: string;
};

type CourseCategory = {
  title: string;
  courses: Course[];
  type: 'course' | 'hotseat' | 'tutorial';
};

const MemberLearningPage = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        // Buscar cursos
        const { data: courses, error: coursesError } = await supabase
          .from('learning_courses')
          .select(`
            id, 
            title, 
            cover_image_url, 
            slug, 
            created_at,
            learning_modules!inner(id)
          `)
          .eq('published', true)
          .order('order_index');

        if (coursesError) throw coursesError;

        // Buscar hotseats/tutoriais (exemplo: usando solução, adaptar conforme necessário)
        const { data: hotseats, error: hotseatsError } = await supabase
          .from('solutions')
          .select('id, title, thumbnail_url, slug, created_at')
          .eq('published', true)
          .eq('category', 'tutorial')
          .order('created_at', { ascending: false })
          .limit(10);

        if (hotseatsError) throw hotseatsError;

        // Formatar os dados
        const formattedCategories: CourseCategory[] = [
          {
            title: 'Formação VIVER DE IA',
            courses: (courses || []).map(course => ({
              id: course.id,
              title: course.title,
              coverImageUrl: course.cover_image_url || 'https://placehold.co/400x600/0ABAB5/white?text=Curso',
              slug: course.slug,
              date: new Date(course.created_at).toLocaleDateString('pt-BR')
            })),
            type: 'course'
          },
          {
            title: 'HotSeats e Tutorias',
            courses: (hotseats || []).map(item => ({
              id: item.id,
              title: item.title,
              coverImageUrl: item.thumbnail_url || 'https://placehold.co/400x600/0ABAB5/white?text=HotSeat',
              slug: item.slug,
              date: new Date(item.created_at).toLocaleDateString('pt-BR')
            })),
            type: 'hotseat'
          }
        ];

        // Filtrar apenas categorias com cursos
        const nonEmptyCategories = formattedCategories.filter(cat => cat.courses.length > 0);
        setCategories(nonEmptyCategories);
      } catch (error: any) {
        console.error('Erro ao carregar cursos:', error);
        toast({
          title: 'Erro ao carregar cursos',
          description: error.message || 'Não foi possível carregar os cursos. Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  return (
    <div className="min-h-screen bg-black text-white pb-12">
      {/* Banner principal */}
      <div className="relative w-full h-[60vh] mb-8">
        <img
          src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
          alt="VIVER DE IA Club"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-end p-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">VIVER DE IA Club</h1>
            <p className="text-xl mb-6">Desenvolva habilidades para criar soluções de IA para o seu negócio</p>
          </div>
        </div>
      </div>

      {/* Carrosséis de conteúdo */}
      <div className="container mx-auto">
        {loading ? (
          <div className="space-y-16">
            {[1, 2].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-64 bg-gray-800" />
                <div className="flex space-x-4 overflow-hidden">
                  {[1, 2, 3, 4].map(j => (
                    <Skeleton key={j} className="w-72 h-[380px] rounded-md bg-gray-800" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          categories.map((category, index) => (
            <CoursesCarousel
              key={index}
              title={category.title}
              courses={category.courses}
              type={category.type}
            />
          ))
        ) : (
          <CardContent className="text-center py-16">
            <p className="text-xl text-gray-400">Nenhum curso disponível no momento.</p>
            <p className="mt-2 text-gray-500">Novos cursos serão adicionados em breve!</p>
          </CardContent>
        )}
      </div>
    </div>
  );
};

export default MemberLearningPage;
