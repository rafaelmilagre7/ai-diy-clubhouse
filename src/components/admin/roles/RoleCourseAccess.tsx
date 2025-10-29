
import { useState, useEffect, useCallback, useMemo } from "react";
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
import { useToastModern } from "@/hooks/useToastModern";
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
  const { showSuccess, showError } = useToastModern();
  
  // Debounce para toggleCourseSelection
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());

  // Função para carregar dados iniciais de forma otimizada
  const loadInitialData = useCallback(async () => {
    if (!open || !role?.id) return;
    
    setIsLoading(true);
    // Carregando dados iniciais
    
    try {
      // Carregar cursos e cursos do papel em paralelo
      const [allCoursesResult, roleCoursesResult] = await Promise.all([
        supabase
          .from('learning_courses')
          .select('*')
          .order('title'),
        getCoursesByRole(role.id)
      ]);

      if (allCoursesResult.error) {
        console.error('❌ Erro ao carregar cursos:', allCoursesResult.error);
        throw allCoursesResult.error;
      }

      const allCourses = allCoursesResult.data || [];
      const roleCourses = roleCoursesResult;
      const roleCoursesIds = roleCourses.map(course => course.id);

      setCourses(allCourses);
      setSelectedCourses(roleCoursesIds);
    } catch (error) {
      console.error("❌ Erro ao carregar dados iniciais:", error);
      showError("Erro", "Erro ao carregar dados");
      setCourses([]);
      setSelectedCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [open, role?.id, role?.name, getCoursesByRole]);

  // Carregar dados quando modal abrir ou role mudar
  useEffect(() => {
    if (open && role?.id) {
      loadInitialData();
    } else if (!open) {
      // Limpar estado quando fechar
      setCourses([]);
      setSelectedCourses([]);
      setPendingToggles(new Set());
    }
  }, [open, role?.id, loadInitialData]);
  
  // Função otimizada para alternar seleção com debounce
  const toggleCourseSelection = useCallback((courseId: string) => {
    // Evitar múltiplos cliques no mesmo curso
    if (pendingToggles.has(courseId)) {
      // Toggle já pendente
      return;
    }

    setPendingToggles(prev => new Set(prev).add(courseId));
    
    setSelectedCourses(prev => {
      const newSelected = prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId];
      
      // Toggle executado
      return newSelected;
    });

    // Remover o debounce após um pequeno delay
    setTimeout(() => {
      setPendingToggles(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }, 300);
  }, [pendingToggles]);
  
  // Função otimizada para salvar alterações
  const handleSave = useCallback(async () => {
    if (!role) return;
    
    setIsSaving(true);
    // Iniciando salvamento
    
    try {
      // Buscar cursos atuais do papel
      const currentCourses = await getCoursesByRole(role.id);
      const currentIds = currentCourses.map(course => course.id);
      
      // Calcular mudanças necessárias
      const toAdd = selectedCourses.filter(id => !currentIds.includes(id));
      const toRemove = currentIds.filter(id => !selectedCourses.includes(id));

      // Aplicar mudanças
      const promises = [
        ...toAdd.map(courseId => manageCourseAccess(courseId, role.id, true)),
        ...toRemove.map(courseId => manageCourseAccess(courseId, role.id, false))
      ];

      await Promise.all(promises);
      
      // Salvamento concluído
      showSuccess("Sucesso", `Configurações de acesso salvas para o papel ${role.name}`);
      onOpenChange(false);
    } catch (error) {
      console.error("❌ Erro ao salvar configurações:", error);
      showError("Erro", "Erro ao salvar configurações de acesso");
    } finally {
      setIsSaving(false);
    }
  }, [role, selectedCourses, getCoursesByRole, manageCourseAccess, onOpenChange]);

  // Memoizar informações de estado para evitar re-renders desnecessários
  const selectionInfo = useMemo(() => ({
    selectedCount: selectedCourses.length,
    totalCount: courses.length,
    hasChanges: true // sempre true pois não temos estado inicial para comparar
  }), [selectedCourses.length, courses.length]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-dialog-lg max-h-modal-md overflow-y-auto">
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
                ({selectionInfo.selectedCount} de {selectionInfo.totalCount} selecionados)
              </p>
              
              {courses.length === 0 ? (
                <p>Nenhum curso encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => {
                    const isSelected = selectedCourses.includes(course.id);
                    const isPending = pendingToggles.has(course.id);
                    
                    return (
                      <div key={course.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                        <Checkbox 
                          id={course.id} 
                          checked={isSelected}
                          onCheckedChange={() => toggleCourseSelection(course.id)}
                          disabled={isSaving || isPending}
                          className={isPending ? "opacity-50" : ""}
                        />
                        <div className="grid gap-1 flex-1">
                          <label 
                            htmlFor={course.id}
                            className="font-medium text-sm cursor-pointer"
                          >
                            {course.title}
                            {isPending && <span className="text-xs text-muted-foreground ml-2">(processando...)</span>}
                          </label>
                          {course.description && (
                            <p className="text-xs text-muted-foreground">{course.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                disabled={isSaving || courses.length === 0 || pendingToggles.size > 0}
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
