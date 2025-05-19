
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, ExternalLink, Calendar } from "lucide-react";

interface TrailCoursesListProps {
  courses: any[];
}

export const TrailCoursesList: React.FC<TrailCoursesListProps> = ({ courses }) => {
  const navigate = useNavigate();

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50 p-4">
        <p className="text-neutral-400">Nenhuma aula recomendada encontrada na sua trilha.</p>
      </div>
    );
  }

  // Ordenar cursos por prioridade
  const sortedCourses = [...courses].sort((a, b) => (a.priority || 1) - (b.priority || 1));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedCourses.map((course) => (
        <Card key={course.id} className="bg-[#151823] border-[#0ABAB5]/30 hover:border-[#0ABAB5]/60 transition-all">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start mb-1">
              <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5] border-[#0ABAB5]/30">
                Aula
              </Badge>
              <Badge variant="outline" className="bg-[#151823]">
                Prioridade {course.priority || 1}
              </Badge>
            </div>
            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
          </CardHeader>
          
          <CardContent className="pb-2">
            {course.cover_image_url ? (
              <div className="mb-3 aspect-video w-full overflow-hidden rounded-md">
                <img 
                  src={course.cover_image_url} 
                  alt={course.title} 
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="mb-3 aspect-video w-full overflow-hidden rounded-md bg-[#0ABAB5]/10 flex items-center justify-center">
                <Book className="h-10 w-10 text-[#0ABAB5]/40" />
              </div>
            )}
            
            <div className="text-sm text-neutral-300 bg-[#0ABAB5]/5 p-3 rounded-md border border-[#0ABAB5]/20 mb-3">
              <p className="italic line-clamp-3">"{course.justification}"</p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Calendar size={14} />
              <span>{course.learning_modules?.count || 0} módulos</span>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={() => navigate(`/learning/course/${course.id}`)}
              variant="outline" 
              className="w-full border-[#0ABAB5]/30 hover:bg-[#0ABAB5]/10 hover:text-white"
            >
              <ExternalLink size={14} className="mr-2" />
              Acessar aula
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
