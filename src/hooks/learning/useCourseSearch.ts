import { useState, useMemo, useEffect } from "react";
import { LearningLesson } from "@/lib/supabase/types";

export interface CourseSearchResult extends LearningLesson {
  relevanceScore: number;
  matchedFields: string[];
  highlightedTitle?: string;
  highlightedDescription?: string;
}

interface UseCourseSearchProps {
  allLessons: LearningLesson[];
  searchQuery: string;
  debounceMs?: number;
}

export const useCourseSearch = ({ 
  allLessons, 
  searchQuery, 
  debounceMs = 300 
}: UseCourseSearchProps) => {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return {
        results: allLessons,
        query: debouncedQuery,
        totalResults: allLessons.length,
        hasFilter: false
      };
    }

    const query = debouncedQuery.toLowerCase().trim();
    const queryWords = query.split(' ').filter(word => word.length > 0);

    const scoredResults: CourseSearchResult[] = allLessons
      .map((lesson) => {
        let score = 0;
        const matchedFields: string[] = [];
        
        const title = lesson.title?.toLowerCase() || '';
        const description = lesson.description?.toLowerCase() || '';
        
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

        // Pontuação por palavras individuais
        queryWords.forEach(word => {
          if (title.includes(word)) {
            score += 30;
            if (!matchedFields.includes('title')) {
              matchedFields.push('title');
            }
          }
          if (description.includes(word)) {
            score += 15;
            if (!matchedFields.includes('description')) {
              matchedFields.push('description');
            }
          }
        });

        // Pontuação extra para correspondências no início do título
        if (title.startsWith(query)) {
          score += 50;
        }

        // Bonus por palavras-chave técnicas
        const techKeywords = ['ia', 'inteligência artificial', 'programação', 'dashboard', 
                             'analytics', 'automação', 'api', 'desenvolvimento', 'código'];
        
        techKeywords.forEach(keyword => {
          if (query.includes(keyword) && (title.includes(keyword) || description.includes(keyword))) {
            score += 25;
          }
        });

        return {
          ...lesson,
          relevanceScore: score,
          matchedFields,
          highlightedTitle: highlightText(lesson.title || '', queryWords),
          highlightedDescription: highlightText(lesson.description || '', queryWords)
        };
      })
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      results: scoredResults,
      query: debouncedQuery,
      totalResults: scoredResults.length,
      hasFilter: true
    };
  }, [allLessons, debouncedQuery]);

  return {
    searchResults: searchResults.results,
    totalResults: searchResults.totalResults,
    hasActiveFilter: searchResults.hasFilter,
    isSearching: searchQuery !== debouncedQuery,
    searchQuery: debouncedQuery
  };
};

// Função auxiliar para destacar texto
function highlightText(text: string, searchWords: string[]): string {
  if (!text || searchWords.length === 0) return text;
  
  let highlightedText = text;
  
  searchWords.forEach(word => {
    if (word.length > 1) {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-primary/20 text-primary font-medium">$1</mark>');
    }
  });
  
  return highlightedText;
}