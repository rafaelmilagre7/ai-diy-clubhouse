
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { LearningLesson } from "@/lib/supabase";
import { FormacaoAulasHeader } from "@/components/formacao/aulas/FormacaoAulasHeader";
import { AulasList } from "@/components/formacao/aulas/AulasList";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const FormacaoAulas = () => {
  const { profile } = useAuth();
  const [aulas, setAulas] = useState<LearningLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursoFiltro, setCursoFiltro] = useState<string>("");
  const [moduloFiltro, setModuloFiltro] = useState<string>("");
  const [cursosDisponiveis, setCursosDisponiveis] = useState<{id: string, title: string}[]>([]);
  const [modulosDisponiveis, setModulosDisponiveis] = useState<{id: string, title: string, course_id: string}[]>([]);
  const [busca, setBusca] = useState("");
  
  // Buscar cursos para filtro
  const fetchCursos = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_courses')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      
      setCursosDisponiveis(data || []);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      toast.error("Não foi possível carregar a lista de cursos");
    }
  };

  // Buscar módulos para filtro
  const fetchModulos = async (curso_id?: string) => {
    try {
      let query = supabase
        .from('learning_modules')
        .select('id, title, course_id')
        .order('title');
      
      if (curso_id) {
        query = query.eq('course_id', curso_id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setModulosDisponiveis(data || []);
    } catch (error) {
      console.error("Erro ao buscar módulos:", error);
      toast.error("Não foi possível carregar a lista de módulos");
    }
  };

  // Buscar aulas com filtros aplicados
  const fetchAulas = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('learning_lessons')
        .select(`
          *,
          learning_modules!inner(id, title, course_id, learning_courses!inner(id, title))
        `)
        .order('title');
      
      // Aplicar filtro de curso se selecionado
      if (cursoFiltro) {
        query = query.eq('learning_modules.course_id', cursoFiltro);
      }
      
      // Aplicar filtro de módulo se selecionado
      if (moduloFiltro) {
        query = query.eq('module_id', moduloFiltro);
      }
      
      // Aplicar busca por título se informado
      if (busca) {
        query = query.ilike('title', `%${busca}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setAulas(data || []);
    } catch (error) {
      console.error("Erro ao buscar aulas:", error);
      toast.error("Não foi possível carregar as aulas");
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar cursos e módulos ao iniciar
  useEffect(() => {
    fetchCursos();
    fetchModulos();
  }, []);

  // Efeito para buscar aulas quando filtros mudam
  useEffect(() => {
    fetchAulas();
  }, [cursoFiltro, moduloFiltro]);

  // Efeito para atualizar módulos quando curso é alterado
  useEffect(() => {
    if (cursoFiltro) {
      fetchModulos(cursoFiltro);
      setModuloFiltro("");
    } else {
      fetchModulos();
      setModuloFiltro("");
    }
  }, [cursoFiltro]);

  // Manipular alteração do filtro de curso
  const handleCursoChange = (value: string) => {
    setCursoFiltro(value === "all" ? "" : value);
  };

  // Manipular alteração do filtro de módulo
  const handleModuloChange = (value: string) => {
    setModuloFiltro(value === "all" ? "" : value);
  };

  // Manipular busca
  const handleBusca = () => {
    fetchAulas();
  };

  // Limpar filtros
  const limparFiltros = () => {
    setCursoFiltro("");
    setModuloFiltro("");
    setBusca("");
    fetchAulas();
  };

  // Excluir aula
  const handleExcluirAula = async (aulaId: string) => {
    try {
      // Primeiro excluir materiais relacionados
      const { error: materiaisError } = await supabase
        .from('learning_resources')
        .delete()
        .eq('lesson_id', aulaId);
      
      if (materiaisError) throw materiaisError;
      
      // Depois excluir vídeos relacionados
      const { error: videosError } = await supabase
        .from('learning_lesson_videos')
        .delete()
        .eq('lesson_id', aulaId);
      
      if (videosError) throw videosError;
      
      // Finalmente excluir a aula
      const { error } = await supabase
        .from('learning_lessons')
        .delete()
        .eq('id', aulaId);
      
      if (error) throw error;
      
      toast.success("Aula excluída com sucesso!");
      fetchAulas();
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      toast.error("Não foi possível excluir a aula. Verifique se não há dependências.");
    }
  };

  // Redirecionar para detalhes da aula
  const handleEditarAula = (aula: LearningLesson) => {
    window.location.href = `/formacao/aulas/${aula.id}`;
  };

  return (
    <div className="space-y-6">
      <FormacaoAulasHeader />
      
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Refine a lista de aulas usando os filtros abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Curso</label>
              <Select value={cursoFiltro || "all"} onValueChange={handleCursoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os cursos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cursos</SelectItem>
                  {cursosDisponiveis.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {curso.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Módulo</label>
              <Select value={moduloFiltro || "all"} onValueChange={handleModuloChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os módulos</SelectItem>
                  {modulosDisponiveis
                    .filter(modulo => !cursoFiltro || modulo.course_id === cursoFiltro)
                    .map((modulo) => (
                    <SelectItem key={modulo.id} value={modulo.id}>
                      {modulo.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <label className="text-sm font-medium mb-1 block">Buscar por título</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Digite para buscar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBusca()}
                />
                <Button variant="secondary" onClick={handleBusca}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <AulasList 
        aulas={aulas} 
        loading={loading} 
        onEdit={handleEditarAula}
        onDelete={handleExcluirAula}
        isAdmin={profile?.role === 'admin'}
      />
    </div>
  );
};

export default FormacaoAulas;
