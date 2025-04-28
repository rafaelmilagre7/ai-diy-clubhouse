
import { Course } from "@/types/learningTypes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseActions } from "./CourseActions";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseListProps {
  courses: Course[];
  isLoading: boolean;
}

export function CourseList({ courses, isLoading }: CourseListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 rounded-none" />
            <CardHeader>
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Nenhum curso encontrado. Crie seu primeiro curso!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden">
          {course.cover_image_url && (
            <div className="relative h-48">
              <img
                src={course.cover_image_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                )}
              </div>
              <Badge variant={course.published ? "default" : "secondary"}>
                {course.published ? "Publicado" : "Rascunho"}
              </Badge>
            </div>
            <CourseActions course={course} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
