
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, ExternalLink } from "lucide-react";

interface TrailPanelCoursesProps {
  courses: any[];
}

export const TrailPanelCourses: React.FC<TrailPanelCoursesProps> = ({ courses }) => {
  const navigate = useNavigate();
  
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-neutral-400">Nenhum curso recomendado encontrado.</p>
      </div>
    );
  }

  // Ordenar cursos por prioridade
  const sortedCourses = [...courses].sort((a, b) => (a.priority || 1) - (b.priority || 1));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sortedCourses.map((course) => (
        <Card key={course.id} className="bg-[#151823] border-[#0ABAB5]/30 hover:border-[#0ABAB5]/60 transition-all">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5] border-[#0ABAB5]/30">
                Aula
              </Badge>
              <Badge variant="outline" className="bg-[#151823]">
                Prioridade {course.priority || 1}
              </Badge>
            </div>
            <CardTitle className="text-lg mt-2">{course.title}</CardTitle>
            <CardDescription className="line-clamp-2">{course.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="text-sm text-neutral-300 bg-[#0ABAB5]/5 p-3 rounded-md border border-[#0ABAB5]/20">
              <p className="italic">"{course.justification}"</p>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-neutral-400">
              <Book size={14} />
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
}
