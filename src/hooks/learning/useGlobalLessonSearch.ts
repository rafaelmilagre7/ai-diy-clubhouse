import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface LessonWithCourseInfo {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  module_id: string;
  order_index: number | null;
  estimated_time_minutes: number | null;
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

  // Buscar todas as aulas com informações do curso e módulo, usando RPC para permissões
  const { data: allLessons = [], isLoading } = useQuery({
    queryKey: ['global-lessons-search', 'v2'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('[GLOBAL SEARCH] Usuário não autenticado');
        return [];
      }

      console.log('[GLOBAL SEARCH] Iniciando busca para usuário:', user.user.id);

      // Buscar todas as aulas com informações do curso e módulo
      const { data: lessons, error } = await supabase
        .from('learning_lessons')
        .select(`
          id,
          title,
          description,
          cover_image_url,
          module_id,
          order_index,
          estimated_time_minutes,
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
        .order('order_index', { ascending: true });

      if (error) {
        console.error('[GLOBAL SEARCH] Erro ao buscar aulas:', error);
        throw error;
      }

      if (!lessons || lessons.length === 0) {
        console.log('[GLOBAL SEARCH] Nenhuma aula encontrada');
        return [];
      }

      console.log('[GLOBAL SEARCH] Total de aulas carregadas:', lessons.length);

      // Filtrar apenas aulas de cursos publicados
      const publishedLessons = lessons.filter(lesson => {
        const courseInfo = lesson.learning_modules?.[0]?.learning_courses?.[0];
        return courseInfo?.published === true;
      });

      console.log('[GLOBAL SEARCH] Aulas de cursos publicados:', publishedLessons.length);

      // Verificar acesso usando role do usuário (método mais simples e confiável)
      const userAccess = await checkUserAccess(user.user.id);
      
      if (!userAccess.hasAccess) {
        console.log('[GLOBAL SEARCH] Usuário não tem acesso ao conteúdo de aprendizado. Role:', userAccess.userRole);
        return [];
      }

      console.log('[GLOBAL SEARCH] Usuário autorizado com role:', userAccess.userRole, '- Aulas liberadas:', publishedLessons.length);
      
      return publishedLessons;
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

// Função para verificar acesso do usuário baseado em role
async function checkUserAccess(userId: string): Promise<{ hasAccess: boolean; userRole: string }> {
  try {
    console.log('[GLOBAL SEARCH] Verificando acesso para usuário:', userId);
    
    // Buscar role do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        role_id,
        user_roles (
          name
        )
      `)
      .eq('id', userId)
      .single();

    // user_roles pode ser um objeto único ou um array - usar type assertion para corrigir
    const userRolesData = profile?.user_roles as any;
    const userRole = Array.isArray(userRolesData) 
      ? userRolesData[0]?.name 
      : userRolesData?.name || 'member';
    
    console.log('[GLOBAL SEARCH] Role do usuário:', userRole);

    // Roles que têm acesso ao conteúdo de aprendizado
    const allowedRoles = [
      'admin', 
      'membro_club', 
      'formacao', 
      'hands_on', 
      'lovable_course',
      'member' // Permitir acesso básico para todos os membros
    ];
    
    const hasAccess = allowedRoles.includes(userRole);
    
    console.log('[GLOBAL SEARCH] Acesso liberado:', hasAccess, '- Role:', userRole);
    
    return { hasAccess, userRole };
  } catch (error) {
    console.error('[GLOBAL SEARCH] Erro ao verificar acesso do usuário:', error);
    // Em caso de erro, permitir acesso para não bloquear a funcionalidade
    return { hasAccess: true, userRole: 'unknown' };
  }
}

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