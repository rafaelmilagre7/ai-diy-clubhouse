
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Search, Play, Clock, BookOpen, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from "@/components/SEO/SEOHead";
import { WebsiteStructuredData, CourseStructuredData } from "@/components/SEO/StructuredData";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  lessons_count?: number;
}

const LearningPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons:lessons(count)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(course => ({
        ...course,
        lessons_count: course.lessons?.[0]?.count || 0
      })) as Course[];
    }
  });

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário'; 
      case 'advanced': return 'Avançado';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-900/40 text-green-300 border-green-700';
      case 'intermediate': return 'bg-yellow-900/40 text-yellow-300 border-yellow-700';
      case 'advanced': return 'bg-red-900/40 text-red-300 border-red-700';
      default: return 'bg-gray-800/60 text-gray-300 border-gray-700';
    }
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/learning/course/${courseId}`);
  };

  return (
    <>
      <SEOHead page="learning" />
      <WebsiteStructuredData />
      
      <div className="container py-6 space-y-8">
        {/* Header com copy otimizado */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Cursos de IA Prática que Geram Resultados Reais
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Domine a implementação de IA com cursos práticos e diretos ao ponto. 
            Transforme conhecimento em resultados tangíveis para seu negócio em semanas, não meses.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, label: "Cursos Disponíveis", value: courses.length.toString(), color: "text-viverblue" },
            { icon: TrendingUp, label: "Taxa de Conclusão", value: "94%", color: "text-green-400" },
            { icon: Award, label: "Certificados Emitidos", value: "2.5k+", color: "text-yellow-400" },
            { icon: Clock, label: "Horas de Conteúdo", value: "150+", color: "text-purple-400" }
          ].map((stat, index) => (
            <Card key={index} className="bg-[#151823] border-neutral-700">
              <CardContent className="p-6 text-center">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Busca */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar cursos de IA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#151823] border-neutral-700 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Lista de cursos */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? `Nenhum curso encontrado para "${searchQuery}"` : 'Nenhum curso disponível'}
            </h3>
            <p className="text-gray-400">
              {searchQuery ? 'Tente buscar por outros termos.' : 'Novos cursos serão adicionados em breve.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                {filteredCourses.length} Curso{filteredCourses.length !== 1 ? 's' : ''} Disponível{filteredCourses.length !== 1 ? 'eis' : ''}
              </h2>
              <p className="text-sm text-gray-400">
                Conteúdo atualizado mensalmente
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <React.Fragment key={course.id}>
                  <CourseStructuredData course={course} />
                  <Card 
                    className="bg-[#151823] border-neutral-700 hover:border-viverblue/50 transition-all duration-300 cursor-pointer group overflow-hidden"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <div className="aspect-video bg-[#1A1E2E] relative overflow-hidden">
                      {course.thumbnail_url ? (
                        <img 
                          src={course.thumbnail_url} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1E2E] to-[#0F111A]">
                          <BookOpen className="h-12 w-12 text-viverblue/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-transparent to-transparent opacity-80"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge 
                          variant="outline"
                          className={getDifficultyColor(course.difficulty_level)}
                        >
                          {getDifficultyLabel(course.difficulty_level)}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white group-hover:text-viverblue transition-colors line-clamp-2">
                        {course.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-4">
                          {course.lessons_count && course.lessons_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              <span>{course.lessons_count} aulas</span>
                            </div>
                          )}
                          {course.duration_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{Math.round(course.duration_minutes / 60)}h</span>
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-viverblue hover:bg-viverblue/80 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCourseClick(course.id);
                          }}
                        >
                          Acessar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-viverblue/10 to-viverblue/5 border-viverblue/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Acelere sua Jornada com IA
              </h3>
              <p className="text-gray-300 mb-6">
                Combine nossos cursos práticos com implementações reais. Teoria + prática = resultados garantidos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-viverblue hover:bg-viverblue/80"
                  onClick={() => navigate('/solutions')}
                >
                  Ver Soluções Práticas
                </Button>
                <Button 
                  variant="outline" 
                  className="border-viverblue/30 text-viverblue hover:bg-viverblue/10"
                  onClick={() => navigate('/learning/certificates')}
                >
                  Meus Certificados
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LearningPage;
