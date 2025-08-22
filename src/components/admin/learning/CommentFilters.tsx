import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface Course {
  id: string;
  title: string;
}

interface CommentFiltersProps {
  courseFilter: string;
  setCourseFilter: (value: string) => void;
  onReset: () => void;
}

export const CommentFilters: React.FC<CommentFiltersProps> = ({
  courseFilter,
  setCourseFilter,
  onReset
}) => {
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["admin-learning-courses"],
    queryFn: async (): Promise<Course[]> => {
      const { data, error } = await supabase
        .from("learning_courses")
        .select("id, title")
        .eq("published", true)
        .order("title");

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Curso:</label>
        <Select
          value={courseFilter}
          onValueChange={setCourseFilter}
          disabled={isLoadingCourses}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Todos os cursos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cursos</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Limpar Filtros
      </Button>
    </div>
  );
};