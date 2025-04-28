
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourseAdmin } from '@/hooks/learning/useCourseAdmin';
import { useModulesAdmin } from '@/hooks/learning/useModulesAdmin';
import { CourseModuleTree } from '@/components/admin/learning/CourseModuleTree';
import { ModuleEditor } from '@/components/admin/learning/ModuleEditor';
import { CourseHeader } from '@/components/admin/learning/CourseHeader';
import { CourseDetailsForm } from '@/components/admin/learning/CourseDetailsForm';
import { toast } from 'sonner';
import { ArrowLeft, Plus } from 'lucide-react';

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('details');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  
  const { course, isLoading: isLoadingCourse, updateCourse } = useCourseAdmin(id || '');
  const { modules, isLoading: isLoadingModules, createModule, updateModule, deleteModule } = useModulesAdmin(id || '');
  
  // Quando o curso carregar, inicializa a página
  useEffect(() => {
    if (course) {
      document.title = `Editar: ${course.title} | Admin Formação VIVER DE IA`;
    }
  }, [course]);
  
  // Função para criar um novo módulo
  const handleCreateModule = async () => {
    if (!id) return;
    
    try {
      const newModule = await createModule.mutateAsync({
        course_id: id,
        title: "Novo Módulo",
        description: "",
        order_index: modules ? modules.length : 0,
        published: false
      });
      
      toast.success("Módulo criado com sucesso");
      setSelectedModuleId(newModule.id);
      setActiveTab('modules');
    } catch (error) {
      toast.error("Erro ao criar módulo");
    }
  };
  
  // Se estiver carregando, mostra um esqueleto
  if (isLoadingCourse) {
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
  
  // Se o curso não existe
  if (!course && !isLoadingCourse) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="flex flex-col items-center justify-center h-96">
            <h2 className="text-2xl font-bold mb-4">Curso não encontrado</h2>
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
        {/* Cabeçalho do Curso */}
        <CourseHeader 
          course={course!} 
          onBack={() => navigate('/admin/learning')} 
        />
        
        {/* Tabs para alternar entre Detalhes e Módulos */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="details">Detalhes do Curso</TabsTrigger>
              <TabsTrigger value="modules">Módulos</TabsTrigger>
            </TabsList>
            
            {activeTab === 'modules' && (
              <Button onClick={handleCreateModule}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Módulo
              </Button>
            )}
          </div>
          
          <TabsContent value="details" className="mt-0">
            <CourseDetailsForm 
              course={course!} 
              onSave={(data) => updateCourse.mutate(data)} 
              isSaving={updateCourse.isPending} 
            />
          </TabsContent>
          
          <TabsContent value="modules" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Árvore de Módulos */}
              <div className="md:col-span-1 border rounded-md p-4">
                <h3 className="font-medium mb-4">Módulos do Curso</h3>
                
                {isLoadingModules ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <CourseModuleTree 
                    modules={modules || []} 
                    selectedModuleId={selectedModuleId}
                    onSelect={setSelectedModuleId}
                    onCreateModule={handleCreateModule}
                  />
                )}
              </div>
              
              {/* Editor de Módulos */}
              <div className="md:col-span-2 border rounded-md p-4">
                {selectedModuleId ? (
                  <ModuleEditor 
                    moduleId={selectedModuleId} 
                    onUpdate={updateModule.mutate}
                    onDelete={() => {
                      deleteModule.mutate(selectedModuleId);
                      setSelectedModuleId(null);
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <h3 className="text-lg font-medium mb-2">Selecione um módulo para editar</h3>
                    <p className="text-sm text-muted-foreground mb-4">Ou crie um novo módulo clicando no botão acima</p>
                    <Button onClick={handleCreateModule}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Módulo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
