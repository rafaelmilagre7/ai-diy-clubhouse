
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
import { LearningCourse } from "@/lib/supabase";
import { useCourseAccess } from "@/hooks/learning/useCourseAccess";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { Loader2 } from "lucide-react";
import { showModernSuccess, showModernError } from '@/lib/toast-helpers';

interface CourseAccessControlProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: LearningCourse | null;
}

export function CourseAccessControl({
  open,
  onOpenChange,
  course
}: CourseAccessControlProps) {
  const { roles, loading: loadingRoles } = usePermissions();
  const { getRolesByCourse, manageCourseAccess, loading } = useCourseAccess();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Carregar os papéis que já têm acesso a este curso
  useEffect(() => {
    const loadRoles = async () => {
      if (course && open) {
        try {
          const courseRoles = await getRolesByCourse(course.id);
          const roleIds = courseRoles.map(role => role.id);
          setSelectedRoles(roleIds);
        } catch (error) {
          console.error("Erro ao carregar papéis do curso:", error);
        }
      }
    };
    
    loadRoles();
  }, [course, open, getRolesByCourse]);
  
  // Alternar a seleção de um papel
  const toggleRoleSelection = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };
  
  // Salvar as alterações
  const handleSave = async () => {
    if (!course) return;
    
    setIsSaving(true);
    
    try {
      // Para cada papel, verificar se deve ter acesso ou não
      for (const role of roles) {
        const shouldHaveAccess = selectedRoles.includes(role.id);
        await manageCourseAccess(course.id, role.id, shouldHaveAccess);
      }
      
      showModernSuccess("Acesso configurado!", "Permissões salvas com sucesso");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar configurações de acesso:", error);
      showModernError("Erro ao salvar", "Não foi possível atualizar permissões");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-dialog-lg max-h-modal-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Acesso ao Curso</DialogTitle>
          <DialogDescription>
            {course ? `Configure quais papéis podem acessar o curso ${course.title}` : ""}
          </DialogDescription>
        </DialogHeader>
        
        {(loadingRoles || loading) ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando configurações de acesso...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border p-4 rounded-md bg-muted/20">
              <p className="text-sm text-muted-foreground mb-4">
                Selecione os papéis que terão permissão para acessar este curso. 
                Os usuários que não possuírem esses papéis não conseguirão visualizar o conteúdo do curso.
              </p>
              
              {roles.length === 0 ? (
                <p>Nenhum papel encontrado.</p>
              ) : (
                <div className="space-y-4">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50">
                      <Checkbox 
                        id={role.id} 
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={() => toggleRoleSelection(role.id)}
                        disabled={isSaving}
                      />
                      <div className="grid gap-1">
                        <label 
                          htmlFor={role.id}
                          className="font-medium text-sm cursor-pointer"
                        >
                          {role.name}
                        </label>
                        {role.description && (
                          <p className="text-xs text-muted-foreground">{role.description}</p>
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
