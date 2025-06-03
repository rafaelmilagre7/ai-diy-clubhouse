
import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { LearningModule, LearningCourse, LearningProgress } from "@/lib/supabase/types";
import { ChevronDown, BookOpen } from "lucide-react";
import { ModuleLessons } from "./course-modules/ModuleLessons";
import { isLessonCompleted, isLessonInProgress, getLessonProgress } from "./course-modules/CourseModulesHelpers";

interface CourseModulesProps {
  modules: LearningModule[];
  courseId: string;
  userProgress: LearningProgress[];
  course: LearningCourse;
  expandedModules?: string[];
}

export const CourseModules: React.FC<CourseModulesProps> = ({ 
  modules, 
  courseId, 
  userProgress,
  course,
  expandedModules = []
}) => {
  // Estado para rastrear módulos expandidos (para lembrar o estado mesmo ao recarregar componente)
  const [openModules, setOpenModules] = useState<string[]>(expandedModules);
  
  // Caso não haja módulos, mostrar mensagem
  if (modules.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Nenhum módulo disponível</h3>
        <p className="text-gray-400">Este curso ainda não possui módulos ou conteúdo publicado.</p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Accordion de módulos */}
      <Accordion
        type="multiple" 
        value={openModules}
        onValueChange={setOpenModules}
        className="space-y-4"
      >
        {modules.map((module, index) => (
          <AccordionItem
            key={module.id}
            value={module.id}
            className="border-0 rounded-xl overflow-hidden bg-gray-900/40 backdrop-blur-sm"
          >
            <div className="border-b border-gray-700/30">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-800/50 transition-colors group">
                <div className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-4">
                    <div className="bg-viverblue/20 p-2 rounded-lg group-hover:bg-viverblue/30 transition-colors">
                      <span className="text-viverblue font-bold text-sm">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-viverblue transition-colors">
                        {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-viverblue transition-all duration-200" />
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent className="p-0 bg-gray-900/20">
              <ModuleLessons 
                moduleId={module.id} 
                courseId={courseId}
                userProgress={userProgress}
                isLessonCompleted={(lessonId) => isLessonCompleted(lessonId, userProgress)}
                isLessonInProgress={(lessonId) => isLessonInProgress(lessonId, userProgress)}
                getLessonProgress={(lessonId) => getLessonProgress(lessonId, userProgress)}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
