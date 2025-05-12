
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
import { Role } from "@/hooks/admin/useRoles";
import { LearningCourse } from "@/lib/supabase";
import { useCourseAccess } from "@/hooks/learning/useCourseAccess";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { getCoursesByRole, manageCourseAccess } = useCourseAccess();
  
  // Carregar todos os cursos disponíveis
  useEffect(() => {
    const fetchCourses = async () => {
      if (open) {
        setIsLoading(true);
        try {
          // Buscar todos os cursos publicados
          const { data, error } = await supabase
            .from('learning_courses')
            .select('*')
            .order('title');
          
          if (error) throw error;
          
          setCourses(data || []);
          
          // Se temos um papel selecionado, buscar os cursos que ele já tem acesso
          if (role?.id) {
            const roleCourses = await getCoursesByRole(role.id);
            setSelectedCourses(roleCourses.map(course => course.id));
          } else {
            setSelectedCourses([]);
          }
        } catch (error) {
          console.error("Erro ao carregar cursos:", error);
          toast.error("Erro ao carregar cursos");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchCourses();
  }, [open, role, getCoursesByRole]);
  
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
      // Buscar os cursos atuais do papel
      const currentCourses = await getCoursesByRole(role.id);
      const currentIds = currentCourses.map(course => course.id);
      
      // Para cada curso, verificar se deve ter acesso ou não
      for (const course of courses) {
        const shouldHaveAccess = selectedCourses.includes(course.id);
        const alreadyHasAccess = currentIds.includes(course.id);
        
        // Só atualizar se houve mudança no estado de acesso
        if (shouldHaveAccess !== alreadyHasAccess) {
          await manageCourseAccess(course.id, role.id, shouldHaveAccess);
        }
      }
      
      toast.success(`Configurações de acesso a cursos salvas com sucesso para o papel ${role.name}`);
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
          <DialogTitle>Gerenciar Acesso a Cursos</DialogTitle>
          <DialogDescription>
            {role ? `Selecione quais cursos o papel ${role.name} pode acessar` : ""}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando cursos...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border p-4 rounded-md bg-muted/20">
              <p className="text-sm text-muted-foreground mb-4">
                Selecione os cursos que usuários com este papel poderão acessar.
                Cursos não selecionados não serão visíveis para usuários com este papel.
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
