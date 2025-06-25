
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RecursosList } from "@/components/formacao/materiais/RecursosList";
import { RecursoFormDialog } from "@/components/formacao/materiais/RecursoFormDialog";
import { supabase } from "@/lib/supabase";
import { LearningResource } from "@/lib/supabase/types";
import { useAuth } from "@/contexts/auth";
import { isAdminRole, isFormacaoRole } from "@/lib/supabase";
import { toast } from "sonner";

const FormacaoMateriais = () => {
  const [recursos, setRecursos] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState<LearningResource | null>(null);
  const { profile } = useAuth();

  // Verificar se o usuário tem permissão para administrar
  const isAdmin = isAdminRole(profile) || isFormacaoRole(profile);

  // Buscar recursos da biblioteca (lesson_id IS NULL)
  const fetchRecursos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .is('lesson_id', null) // Apenas recursos da biblioteca global
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar recursos:', error);
        toast.error('Erro ao carregar materiais');
        return;
      }

      setRecursos(data || []);
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
      toast.error('Erro ao carregar materiais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecursos();
  }, []);

  // Garantir que o bucket existe
  useEffect(() => {
    const ensureBucket = async () => {
      try {
        await supabase.rpc('setup_learning_storage_buckets');
      } catch (error) {
        console.error('Erro ao configurar buckets:', error);
      }
    };
    ensureBucket();
  }, []);

  const handleEdit = (recurso: LearningResource) => {
    setEditingRecurso(recurso);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('learning_resources')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir recurso:', error);
        toast.error('Erro ao excluir material');
        return;
      }

      toast.success('Material excluído com sucesso');
      fetchRecursos();
    } catch (error) {
      console.error('Erro ao excluir recurso:', error);
      toast.error('Erro ao excluir material');
    }
  };

  const handleDialogSuccess = () => {
    fetchRecursos();
    setShowDialog(false);
    setEditingRecurso(null);
  };

  const handleNewMaterial = () => {
    setEditingRecurso(null);
    setShowDialog(true);
  };

  // Filtrar recursos baseado no termo de busca
  const filteredRecursos = recursos.filter(recurso =>
    recurso.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recurso.description && recurso.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Biblioteca de Materiais</h1>
            <p className="text-muted-foreground">
              Gerencie materiais de apoio e recursos educacionais
            </p>
          </div>
          {isAdmin && (
            <Button onClick={handleNewMaterial}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar materiais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de Recursos */}
        <RecursosList
          recursos={filteredRecursos}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={isAdmin}
        />

        {/* Dialog de Formulário */}
        <RecursoFormDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSuccess={handleDialogSuccess}
          recurso={editingRecurso}
          lessonId={null} // Recursos da biblioteca não têm lesson_id
        />
      </div>
    </div>
  );
};

export default FormacaoMateriais;
