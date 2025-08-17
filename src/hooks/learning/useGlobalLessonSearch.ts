import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface LessonWithCourseInfo {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  module_id: string;
  lesson_number: number | null;
  duration_minutes: number | null;
  learning_modules: {
    id: string;
    title: string;
    course_id: string;
    learning_courses: {
      id: string;
      title: string;
      published: boolean;
    }[];
  }[];
}

export interface GlobalSearchResult extends LessonWithCourseInfo {
  relevanceScore: number;
  matchedFields: string[];
  highlightedTitle?: string;
  highlightedDescription?: string;
  courseName?: string;
  moduleTitle?: string;
}

interface UseGlobalLessonSearchProps {
  searchQuery: string;
  debounceMs?: number;
  limit?: number;
}

export const useGlobalLessonSearch = ({ 
  searchQuery, 
  debounceMs = 500,
  limit = 20 
}: UseGlobalLessonSearchProps) => {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce da busca global (um pouco maior que a busca local)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Buscar todas as aulas com informações do curso e módulo
  const { data: allLessons = [], isLoading } = useQuery({
    queryKey: ['global-lessons-search'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_lessons')
        .select(`
          id,
          title,
          description,
          cover_image_url,
          module_id,
          lesson_number,
          duration_minutes,
          learning_modules!inner (
            id,
            title,
            course_id,
            learning_courses!inner (
              id,
              title,
              published
            )
          )
        `)
        .eq('learning_modules.learning_courses.published', true)
        .order('lesson_number', { ascending: true });

      if (error) {
        console.error('Erro ao buscar aulas globalmente:', error);
        throw error;
      }

      return (data || []) as any[];
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Manter em cache por 10 minutos
  });

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return {
        results: [],
        query: debouncedQuery,
        totalResults: 0,
        hasFilter: false,
        courseGroups: {}
      };
    }

    const query = debouncedQuery.toLowerCase().trim();
    const queryWords = query.split(' ').filter(word => word.length > 1);

    const scoredResults: GlobalSearchResult[] = allLessons
      .map((lesson) => {
        let score = 0;
        const matchedFields: string[] = [];
        
        const title = lesson.title?.toLowerCase() || '';
        const description = lesson.description?.toLowerCase() || '';
        
        // Obter informações do módulo e curso (primeiro item do array)
        const moduleInfo = lesson.learning_modules?.[0];
        const courseInfo = moduleInfo?.learning_courses?.[0];
        
        const courseName = courseInfo?.title?.toLowerCase() || '';
        const moduleTitle = moduleInfo?.title?.toLowerCase() || '';
        
        // Pontuação por correspondência exata no título (peso maior)
        if (title.includes(query)) {
          score += 100;
          matchedFields.push('title');
        }
        
        // Pontuação por correspondência exata na descrição
        if (description.includes(query)) {
          score += 50;
          matchedFields.push('description');
        }

        // Pontuação por correspondência no nome do curso
        if (courseName.includes(query)) {
          score += 40;
          matchedFields.push('course');
        }

        // Pontuação por correspondência no módulo
        if (moduleTitle.includes(query)) {
          score += 30;
          matchedFields.push('module');
        }

        // Pontuação por palavras individuais
        queryWords.forEach(word => {
          if (title.includes(word)) {
            score += 25;
            if (!matchedFields.includes('title')) matchedFields.push('title');
          }
          if (description.includes(word)) {
            score += 15;
            if (!matchedFields.includes('description')) matchedFields.push('description');
          }
          if (courseName.includes(word)) {
            score += 10;
            if (!matchedFields.includes('course')) matchedFields.push('course');
          }
          if (moduleTitle.includes(word)) {
            score += 8;
            if (!matchedFields.includes('module')) matchedFields.push('module');
          }
        });

        // Bonus para correspondências no início do título
        if (title.startsWith(query)) {
          score += 50;
        }

        // Bonus por palavras-chave técnicas importantes
        const techKeywords = [
          'ia', 'inteligência artificial', 'ai', 'programação', 'dashboard', 
          'analytics', 'automação', 'api', 'desenvolvimento', 'código',
          'machine learning', 'dados', 'análise', 'relatório', 'gestão'
        ];
        
        techKeywords.forEach(keyword => {
          if (query.includes(keyword)) {
            if (title.includes(keyword)) score += 35;
            if (description.includes(keyword)) score += 25;
            if (courseName.includes(keyword)) score += 20;
          }
        });

        return {
          ...lesson,
          relevanceScore: score,
          matchedFields,
          highlightedTitle: highlightText(lesson.title || '', queryWords),
          highlightedDescription: highlightText(lesson.description || '', queryWords),
          courseName: courseInfo?.title,
          moduleTitle: moduleInfo?.title
        } as GlobalSearchResult;
      })
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    // Agrupar resultados por curso para melhor visualização
    const courseGroups = scoredResults.reduce((acc, lesson) => {
      const moduleInfo = lesson.learning_modules?.[0];
      const courseId = moduleInfo?.course_id || 'unknown';
      const courseName = lesson.courseName || 'Curso sem nome';
      
      if (!acc[courseId]) {
        acc[courseId] = {
          courseId,
          courseName,
          lessons: []
        };
      }
      
      acc[courseId].lessons.push(lesson);
      return acc;
    }, {} as Record<string, { courseId: string; courseName: string; lessons: GlobalSearchResult[] }>);

    return {
      results: scoredResults,
      query: debouncedQuery,
      totalResults: scoredResults.length,
      hasFilter: true,
      courseGroups
    };
  }, [allLessons, debouncedQuery, limit]);

  return {
    searchResults: searchResults.results,
    courseGroups: searchResults.courseGroups,
    totalResults: searchResults.totalResults,
    hasActiveFilter: searchResults.hasFilter,
    isSearching: searchQuery !== debouncedQuery,
    searchQuery: debouncedQuery,
    isLoading: isLoading && searchQuery.length > 0
  };
};

// Função auxiliar para destacar texto
function highlightText(text: string, searchWords: string[]): string {
  if (!text || searchWords.length === 0) return text;
  
  let highlightedText = text;
  
  searchWords.forEach(word => {
    if (word.length > 1) {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-primary/20 text-primary font-medium px-1 rounded">$1</mark>');
    }
  });
  
  return highlightedText;
}