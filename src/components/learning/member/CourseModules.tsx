
import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { LearningModule, LearningCourse, LearningProgress } from "@/lib/supabase/types";
import { ChevronDown } from "lucide-react";
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
      <Card className="p-6 text-center text-muted-foreground">
        <p>Este curso ainda não possui módulos disponíveis.</p>
      </Card>
    );
  }
  
  return (
    <Card className="border rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Conteúdo do curso</h2>
        
        <Accordion
          type="multiple" 
          value={openModules}
          onValueChange={setOpenModules}
          className="space-y-6"
        >
          {modules.map(module => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="border rounded-lg overflow-hidden"
            >
              <div className="border-b">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                  <div className="flex justify-between w-full items-center text-left">
                    <span className="font-semibold">{module.title}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                  </div>
                </AccordionTrigger>
              </div>
              <AccordionContent className="p-0">
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
    </Card>
  );
};
