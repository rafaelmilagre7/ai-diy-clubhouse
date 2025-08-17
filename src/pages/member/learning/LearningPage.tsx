
import React, { useState } from "react";
import { MemberLearningHeader } from "@/components/learning/member/MemberLearningHeader";
import { MemberCoursesList } from "@/components/learning/member/MemberCoursesList";
import { GlobalSearchHero } from "@/components/learning/member/GlobalSearchHero";
import { GlobalSearchResults } from "@/components/learning/member/GlobalSearchResults";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { useUserProgress } from "@/hooks/learning/useUserProgress";
import { useGlobalLessonSearch } from "@/hooks/learning/useGlobalLessonSearch";
import { ContinueLearning } from "@/components/learning/member/ContinueLearning";
import { useDynamicSEO } from "@/hooks/seo/useDynamicSEO";
import { motion, AnimatePresence } from "framer-motion";

export default function LearningPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    courses,
    isLoading,
    error
  } = useLearningCourses();
  
  const {
    userProgress
  } = useUserProgress();

  // Hook de busca global
  const { 
    courseGroups, 
    totalResults, 
    isLoading: isSearching,
    hasActiveFilter 
  } = useGlobalLessonSearch({ 
    searchQuery,
    limit: 30 
  });

  // SEO otimizado para página de aprendizado
  useDynamicSEO({
    title: 'Cursos de IA',
    description: 'Aprenda Inteligência Artificial através de cursos práticos e implementações reais. Desenvolva suas habilidades em IA de forma estruturada.',
    keywords: 'cursos IA, aprendizado inteligência artificial, formação IA, educação AI'
  });

  return (
    <div className="space-y-8">
      <MemberLearningHeader />
      
      {/* Busca Global Hero */}
      <GlobalSearchHero 
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        isLoading={isSearching}
        totalResults={totalResults}
      />

      <AnimatePresence mode="wait">
        {hasActiveFilter ? (
          <motion.div
            key="search-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlobalSearchResults 
              courseGroups={courseGroups}
              searchQuery={searchQuery}
              totalResults={totalResults}
            />
          </motion.div>
        ) : (
          <motion.div
            key="default-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Componente para continuar de onde parou */}
            <ContinueLearning />
            
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-foreground">Todos os cursos</h2>
              <MemberCoursesList 
                courses={courses} 
                userProgress={userProgress}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
