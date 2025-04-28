
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useCoursesAdmin } from "@/hooks/learning/useCoursesAdmin";
import { Plus } from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { CreateCourseDialog } from "@/components/admin/learning/CreateCourseDialog";
import { CourseList } from "@/components/admin/learning/CourseList";

export default function AdminLearningPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { courses, isLoading } = useCoursesAdmin();

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Universidade Viver de IA</h1>
            <p className="text-muted-foreground">
              Gerencie os cursos e conteúdos da plataforma
            </p>
          </div>
          
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Curso
          </Button>
        </div>

        <CourseList courses={courses || []} isLoading={isLoading} />

        <CreateCourseDialog 
          open={isCreateOpen} 
          onOpenChange={setIsCreateOpen} 
        />
      </div>
    </AdminLayout>
  );
}
