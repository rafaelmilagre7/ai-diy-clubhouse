
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { useCourseAccess } from "@/hooks/learning/useCourseAccess";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface RoleCourseAccessProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

export function RoleCourseAccess({
  open,
  onOpenChange,
  role
}: RoleCourseAccessProps) {
  const { courses, isLoading: loadingCourses } = useLearningCourses();
  const { getCoursesByRole, manageCourseAccess, loading } = useCourseAccess();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Carregar os cursos que este role já tem acesso
  useEffect(() => {
    const loadCourses = async () => {
      if (role && open) {
        try {
          const roleCourses = await getCoursesByRole(role.id);
          const courseIds = roleCourses.map(course => course.id);
          setSelectedCourses(courseIds);
        } catch (error) {
          console.error("Erro ao carregar cursos do role:", error);
        }
      }
    };
    
    loadCourses();
  }, [role, open, getCoursesByRole]);
  
  // Alternar a seleção de um curso
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };
  
  // Salvar as alterações
  const handleSave = async () => {
    if (!role) return;
    
    setIsSaving(true);
    
    try {
      // Para cada curso, verificar se deve ter acesso ou não
      for (const course of courses) {
        const shouldHaveAccess = selectedCourses.includes(course.id);
        await manageCourseAccess(course.id, role.id, shouldHaveAccess);
      }
      
      toast.success("Configurações de acesso salvas com sucesso");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar configurações de acesso:", error);
      toast.error("Erro ao salvar configurações de acesso");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Acesso aos Cursos</DialogTitle>
          <DialogDescription>
            {role ? `Configure quais cursos o papel ${role.name} pode acessar` : ""}
          </DialogDescription>
        </DialogHeader>
        
        {(loadingCourses || loading) ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando configurações de acesso...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border p-4 rounded-md bg-muted/20">
              <p className="text-sm text-muted-foreground mb-4">
                Selecione os cursos que este papel terá permissão para acessar. 
                Os usuários com este papel só conseguirão visualizar os cursos selecionados.
              </p>
              
              {courses.length === 0 ? (
                <p>Nenhum curso encontrado.</p>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50">
                      <Checkbox 
                        id={course.id} 
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={() => toggleCourseSelection(course.id)}
                        disabled={isSaving}
                      />
                      <div className="grid gap-1">
                        <label 
                          htmlFor={course.id}
                          className="font-medium text-sm cursor-pointer"
                        >
                          {course.title}
                        </label>
                        {course.description && (
                          <p className="text-xs text-muted-foreground">{course.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : "Salvar configurações"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
