
import { useState, useEffect } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { LearningModule, LearningCourse, LearningProgress, LearningLesson } from "@/lib/supabase/types";
import { ChevronDown } from "lucide-react";
import { ModuleLessons } from "./course-modules/ModuleLessons";
import { isLessonCompleted, isLessonInProgress, getLessonProgress } from "./course-modules/CourseModulesHelpers";

interface CourseModulesProps {
  modules: LearningModule[];
  courseId: string;
  userProgress: LearningProgress[];
  course: LearningCourse;
  expandedModules?: string[];
  filteredLessons?: LearningLesson[];
  searchQuery?: string;
}

export const CourseModules: React.FC<CourseModulesProps> = ({ 
  modules, 
  courseId, 
  userProgress,
  course,
  expandedModules = [],
  filteredLessons,
  searchQuery = ""
}) => {
  console.log(`[FORMACAO_DEBUG] CourseModules renderizado - courseId: ${courseId}`, {
    modulesCount: modules?.length || 0,
    expandedModules,
    hasFilter: !!filteredLessons,
    searchQuery,
    timestamp: new Date().toISOString()
  });

  // Estado para rastrear módulos expandidos - expandir primeiro módulo por padrão
  // Quando há busca ativa, expandir todos os módulos automaticamente
  const [openModules, setOpenModules] = useState<string[]>(() => {
    if (filteredLessons && searchQuery) {
      // Se há busca ativa, expandir todos os módulos
      console.log(`[FORMACAO_DEBUG] Expandindo todos os módulos devido à busca: "${searchQuery}"`);
      return modules.map(m => m.id);
    }
    if (expandedModules.length > 0) {
      console.log(`[FORMACAO_DEBUG] Usando módulos expandidos especificados:`, expandedModules);
      return expandedModules;
    }
    // Se não há módulos expandidos especificados, expandir o primeiro módulo
    const firstModule = modules.length > 0 ? [modules[0].id] : [];
    console.log(`[FORMACAO_DEBUG] Expandindo primeiro módulo automaticamente:`, firstModule);
    return firstModule;
  });
  
  // Expandir todos os módulos quando há busca ativa
  useEffect(() => {
    if (filteredLessons && searchQuery) {
      console.log(`[FORMACAO_DEBUG] Expandindo todos os módulos para busca: "${searchQuery}"`);
      setOpenModules(modules.map(m => m.id));
    } else if (modules.length > 0 && openModules.length === 0) {
      console.log(`[FORMACAO_DEBUG] Expandindo primeiro módulo automaticamente:`, modules[0].id);
      setOpenModules([modules[0].id]);
    }
  }, [modules, openModules.length, filteredLessons, searchQuery]);
  
  // Caso não haja módulos, mostrar mensagem detalhada
  if (!modules || modules.length === 0) {
    console.log(`[FORMACAO_DEBUG] Nenhum módulo encontrado para courseId: ${courseId}`);
    return (
      <Card className="p-6 text-center text-muted-foreground space-y-2">
        <p>Este curso ainda não possui módulos disponíveis.</p>
        <p className="text-xs">
          CourseId: {courseId} | Timestamp: {new Date().toLocaleTimeString()}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
        >
          Recarregar página
        </button>
      </Card>
    );
  }
  
  console.log(`[FORMACAO_DEBUG] Renderizando ${modules.length} módulos:`, 
    modules.map(m => ({ id: m.id, title: m.title })));
  
  return (
    <div className="space-y-6">
      <Accordion
        type="multiple" 
        value={openModules}
        onValueChange={(newOpenModules) => {
          console.log(`[FORMACAO_DEBUG] Módulos abertos alterados de [${openModules.join(', ')}] para [${newOpenModules.join(', ')}]`);
          setOpenModules(newOpenModules);
        }}
        className="space-y-4"
      >
        {modules.map((module, index) => (
          <AccordionItem
            key={module.id}
            value={module.id}
            className="border-0 bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <AccordionTrigger className="px-6 py-6 text-left hover:no-underline group bg-gradient-to-r from-transparent via-primary/5 to-transparent hover:from-primary/10 hover:via-primary/5 hover:to-primary/10 transition-all duration-300">
              <div className="flex items-center justify-between w-full">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-muted-foreground text-sm max-w-2xl">
                      {module.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-0 pb-0">
              <ModuleLessons 
                moduleId={module.id} 
                courseId={courseId}
                userProgress={userProgress}
                isLessonCompleted={(lessonId) => isLessonCompleted(lessonId, userProgress)}
                isLessonInProgress={(lessonId) => isLessonInProgress(lessonId, userProgress)}
                getLessonProgress={(lessonId) => getLessonProgress(lessonId, userProgress)}
                filteredLessons={filteredLessons}
                searchQuery={searchQuery}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
