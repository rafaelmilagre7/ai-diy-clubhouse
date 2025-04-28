
import { Button } from "@/components/ui/button";
import { Course } from "@/types/learningTypes";
import { Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCoursesAdmin } from "@/hooks/learning/useCoursesAdmin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface CourseActionsProps {
  course: Course;
}

export function CourseActions({ course }: CourseActionsProps) {
  const navigate = useNavigate();
  const { deleteCourse } = useCoursesAdmin();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    deleteCourse.mutate(course.id);
    setShowDeleteDialog(false);
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/admin/learning/${course.id}`)}
      >
        <Edit className="w-4 h-4 mr-2" />
        Editar
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/admin/learning/${course.id}/preview`)}
      >
        <Eye className="w-4 h-4 mr-2" />
        Preview
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowDeleteDialog(true)}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Excluir
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir curso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o curso "{course.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
