
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useModuleAdmin } from '@/hooks/learning/useModuleAdmin';
import { useLessonsAdmin } from '@/hooks/learning/useLessonsAdmin';
import { ModuleHeader } from '@/components/admin/learning/ModuleHeader';
import { LessonEditor } from '@/components/admin/learning/LessonEditor';
import { LessonList } from '@/components/admin/learning/LessonList';
import { toast } from 'sonner';
import { ArrowLeft, Plus } from 'lucide-react';

export default function ModuleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  
  const { module, isLoading: isLoadingModule, courseId } = useModuleAdmin(id || '');
  const { lessons, isLoading: isLoadingLessons, createLesson, updateLesson, deleteLesson } = useLessonsAdmin(id || '');
  
  // Quando o módulo carregar, inicializa a página
  useEffect(() => {
    if (module) {
      document.title = `Editar: ${module.title} | Admin Formação VIVER DE IA`;
    }
  }, [module]);
  
  // Função para criar uma nova aula
  const handleCreateLesson = async () => {
    if (!id) return;
    
    try {
      const newLesson = await createLesson.mutateAsync({
        module_id: id,
        title: "Nova Aula",
        description: "",
        order_index: lessons ? lessons.length : 0,
        published: false,
        content: {}, // Conteúdo vazio inicial
        estimated_time_minutes: 0,
        ai_assistant_enabled: true
      });
      
      toast.success("Aula criada com sucesso");
      setSelectedLessonId(newLesson.id);
    } catch (error) {
      toast.error("Erro ao criar aula");
    }
  };
  
  // Se estiver carregando, mostra um esqueleto
  if (isLoadingModule) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="flex items-center space-x-2 mb-6">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-96" />
          </div>
          <div className="grid gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  // Se o módulo não existe
  if (!module && !isLoadingModule) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="flex flex-col items-center justify-center h-96">
            <h2 className="text-2xl font-bold mb-4">Módulo não encontrado</h2>
            <Button onClick={() => navigate('/admin/learning')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista de cursos
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container py-6">
        {/* Cabeçalho do Módulo */}
        <ModuleHeader 
          module={module!} 
          onBack={() => courseId ? navigate(`/admin/learning/${courseId}`) : navigate('/admin/learning')} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Lista de Aulas */}
          <div className="md:col-span-1 border rounded-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Aulas do Módulo</h3>
              <Button size="sm" onClick={handleCreateLesson}>
                <Plus className="h-3 w-3 mr-1" />
                Aula
              </Button>
            </div>
            
            {isLoadingLessons ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <LessonList 
                lessons={lessons || []} 
                selectedLessonId={selectedLessonId}
                onSelect={setSelectedLessonId}
              />
            )}
          </div>
          
          {/* Editor de Aulas */}
          <div className="md:col-span-2 border rounded-md p-4">
            {selectedLessonId ? (
              <LessonEditor 
                lessonId={selectedLessonId} 
                onUpdate={updateLesson.mutate}
                onDelete={() => {
                  deleteLesson.mutate(selectedLessonId);
                  setSelectedLessonId(null);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <h3 className="text-lg font-medium mb-2">Selecione uma aula para editar</h3>
                <p className="text-sm text-muted-foreground mb-4">Ou crie uma nova aula clicando no botão acima</p>
                <Button onClick={handleCreateLesson}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Aula
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
