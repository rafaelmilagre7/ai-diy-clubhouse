
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpenCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";

interface CourseData {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  thumbnail_url: string;
  instructor_id: string;
  category: string;
  difficulty_level: string;
  estimated_duration_hours: number;
}

const MemberCoursesList = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSimpleAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('learning_courses')
          .select('*');

        if (error) {
          console.error("Erro ao buscar cursos:", error);
          return;
        }

        const mappedData: CourseData[] = (data || []).map(course => ({
          id: course.id,
          title: course.title,
          description: course.description || '',
          is_published: course.is_published || false,
          created_at: course.created_at,
          updated_at: course.updated_at,
          thumbnail_url: course.thumbnail_url || '',
          instructor_id: course.instructor_id || '',
          category: 'Geral',
          difficulty_level: 'Intermediário',
          estimated_duration_hours: course.estimated_duration_hours || 0
        }));

        setCourses(mappedData);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const publishedCourses = courses.filter(course => course.is_published);

  if (loading) {
    return <p>Carregando cursos...</p>;
  }

  if (publishedCourses.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Nenhum curso disponível</CardTitle>
          <CardDescription>
            No momento, não há cursos disponíveis para membros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookOpenCheck className="w-16 h-16 mx-auto text-muted-foreground" />
          <p className="text-center text-muted-foreground">
            Volte mais tarde para conferir os cursos disponíveis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {publishedCourses.map((course) => (
        <Card key={course.id} className="bg-cardBgColor text-cardTextColor">
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>0 alunos</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{course.estimated_duration_hours} horas</span>
            </div>
            <Button asChild>
              <Link to={`/formacao/cursos/${course.id}`}>Acessar curso</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MemberCoursesList;
