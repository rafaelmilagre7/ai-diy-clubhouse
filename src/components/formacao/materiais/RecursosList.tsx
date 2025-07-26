
import { useState } from "react";
import { LearningResource } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  FileText, 
  FileImage, 
  FileArchive,
  FileCode, 
  File, 
  Pencil, 
  Trash2, 
  Download,
  Loader2
} from "lucide-react";
import { RecursoDeleteDialog } from "./RecursoDeleteDialog";

interface RecursoWithDetails extends LearningResource {
  lesson?: {
    id: string;
    title: string;
    module?: {
      id: string;
      title: string;
      course?: {
        id: string;
        title: string;
      };
    };
  };
}

interface RecursosListProps {
  recursos: RecursoWithDetails[];
  loading: boolean;
  onEdit: (recurso: RecursoWithDetails) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export const RecursosList = ({ 
  recursos, 
  loading, 
  onEdit, 
  onDelete, 
  isAdmin 
}: RecursosListProps) => {
  const [recursoParaExcluir, setRecursoParaExcluir] = useState<RecursoWithDetails | null>(null);

  // Abrir diálogo de confirmação para excluir
  const handleOpenDelete = (recurso: RecursoWithDetails) => {
    setRecursoParaExcluir(recurso);
  };

  // Confirmar exclusão
  const handleConfirmDelete = () => {
    if (recursoParaExcluir) {
      onDelete(recursoParaExcluir.id);
      setRecursoParaExcluir(null);
    }
  };

  // Função para determinar o ícone com base no tipo de arquivo
  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="h-5 w-5" />;
    
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes("image")) return <FileImage className="h-5 w-5" />;
    if (fileType.includes("zip") || fileType.includes("rar")) return <FileArchive className="h-5 w-5" />;
    if (fileType.includes("text") || fileType.includes("doc")) return <FileText className="h-5 w-5" />;
    if (fileType.includes("code") || fileType.includes("json") || fileType.includes("html")) return <FileCode className="h-5 w-5" />;
    
    return <File className="h-5 w-5" />;
  };

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return "Desconhecido";
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Função para gerar hierarquia do recurso
  const getResourceHierarchy = (recurso: RecursoWithDetails) => {
    const lesson = recurso.lesson;
    if (!lesson) return <span className="text-sm text-muted-foreground">Sem aula associada</span>;
    
    const module = lesson.module;
    const course = module?.course;
    
    return (
      <div className="text-sm">
        {course?.title && (
          <div className="font-medium text-foreground">{course.title}</div>
        )}
        {module?.title && (
          <div className="text-muted-foreground">{module.title}</div>
        )}
        <div className="text-xs text-muted-foreground">{lesson.title}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (recursos.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-background">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhum material disponível</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          Esta aula ainda não possui materiais cadastrados.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Curso/Módulo/Aula</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recursos.map((recurso) => (
              <TableRow key={recurso.id}>
                <TableCell>{getFileIcon(recurso.file_type)}</TableCell>
                <TableCell className="font-medium">{recurso.name}</TableCell>
                <TableCell>{getResourceHierarchy(recurso)}</TableCell>
                <TableCell>{formatFileSize(recurso.file_size_bytes)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={recurso.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </a>
                    </Button>
                    
                    {isAdmin && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => onEdit(recurso)}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenDelete(recurso)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <RecursoDeleteDialog 
        open={!!recursoParaExcluir} 
        onOpenChange={() => setRecursoParaExcluir(null)}
        onConfirm={handleConfirmDelete}
        recurso={recursoParaExcluir}
      />
    </>
  );
};
